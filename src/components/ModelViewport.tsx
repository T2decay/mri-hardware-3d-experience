import { useEffect, useRef, useState } from "react";
import { selectableDefinitions, type SelectionId, type StepId } from "../content/lesson.ts";
import type { LabState } from "../labState.ts";
import type { LabelPosition, MagnetScene, MagnetSceneState } from "../scene/MagnetScene.ts";

export type SceneHandle = Pick<MagnetScene, "failed" | "update" | "resize" | "dispose" | "zoom" | "resetCamera">;

interface Props {
  generation: "gen1" | "gen2";
  state: LabState;
  onSelect: (id: SelectionId) => void;
  onExplode: (value: number) => void;
  onRadialExplode: (value: number) => void;
  sceneRef: React.RefObject<SceneHandle | null>;
}

const visibleLabels: Record<StepId, Array<{ id: string; text: string; selectionId?: SelectionId }>> = {
  complete: [
    { id: "bore-liner", text: "Bore", selectionId: "bore-liner" },
    { id: "scanner-cladding", text: "Scanner cladding", selectionId: "scanner-cladding" },
  ],
  cutaway: [
    { id: "bore-liner", text: "Bore", selectionId: "bore-liner" },
    { id: "cryostat-inner", text: "Cryostat", selectionId: "cryostat-inner" },
    { id: "main-magnet", text: "Main windings", selectionId: "main-magnet" },
    { id: "quench-vent", text: "Quench pipe", selectionId: "quench-vent" },
    { id: "cryogenic-chiller", text: "Cold head", selectionId: "cryogenic-chiller" },
  ],
  windings: [
    { id: "main-magnet", text: "Superconducting wire windings", selectionId: "main-magnet" },
    { id: "cryostat-inner", text: "Cryostat · cold environment", selectionId: "cryostat-inner" },
  ],
  field: [
    { id: "main-magnet", text: "Current in windings", selectionId: "main-magnet" },
    { id: "b0", text: "B₀ · static magnetic field" },
    { id: "isocenter", text: "Isocenter" },
  ],
  geometry: [
    { id: "bore-liner", text: "Central bore", selectionId: "bore-liner" },
    { id: "b0", text: "B₀ · qualitative geometry" },
    { id: "isocenter", text: "Isocenter" },
  ],
  reassembled: [
    { id: "bore-liner", text: "Bore", selectionId: "bore-liner" },
    { id: "scanner-cladding", text: "Scanner cladding", selectionId: "scanner-cladding" },
  ],
};

function sceneState(state: LabState): MagnetSceneState {
  return {
    step: state.step,
    components: state.components,
    selectedComponent: state.selectedComponent,
    explode: state.explode,
    radialExplode: state.radialExplode,
    cutawayMode: state.cutawayMode,
    sectionEnabled: state.sectionEnabled,
    sectionPlane: state.sectionPlane,
    b0Visible: state.b0Visible,
    fieldMode: state.fieldMode,
    reducedMotion: state.reducedMotion,
  };
}

export default function ModelViewport({
  state,
  generation,
  onSelect,
  onExplode,
  onRadialExplode,
  sceneRef,
}: Props) {
  const latestState = useRef(state);
  latestState.current = state;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState<{ id: SelectionId; x: number; y: number } | null>(null);
  const [positions, setPositions] = useState<Record<string, LabelPosition>>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let active = true;
    let scene: SceneHandle | null = null;
    let observer: ResizeObserver | null = null;

    setLoading(true);
    setFailed(false);
    setHover(null);
    setPositions({});
    (generation === "gen2" ? import("../scene/MagnetSceneGen2.ts") : import("../scene/MagnetScene.ts"))
      .then(({ MagnetScene }) => {
        if (!active) return;
        scene = new MagnetScene(canvas, {
          onSelect,
          onHover: (id, x, y) => setHover(id ? { id, x, y } : null),
          onLabels: (next) =>
            setPositions(Object.fromEntries(next.map((position) => [position.id, position]))),
        });
        if (scene.failed) {
          setFailed(true);
          setLoading(false);
          return;
        }
        scene.update(sceneState(latestState.current));
        sceneRef.current = scene;
        observer = new ResizeObserver(() => scene?.resize());
        observer.observe(canvas);
        setLoading(false);
      })
      .catch(() => {
        setFailed(true);
        setLoading(false);
      });

    return () => {
      active = false;
      observer?.disconnect();
      sceneRef.current = null;
      scene?.dispose();
    };
  }, [onSelect, sceneRef, generation]);

  useEffect(() => {
    sceneRef.current?.update(sceneState(state));
  }, [sceneRef, state]);

  const hoverComponent = hover
    ? selectableDefinitions.find((component) => component.id === hover.id)
    : null;

  return (
    <div className="model-frame">
      {!failed ? (
        <>
          <canvas
            ref={canvasRef}
            tabIndex={0}
            aria-label="Interactive longitudinal cutaway of a conceptual superconducting MRI magnet. Drag to rotate, scroll to zoom, or use the arrow and plus or minus keys."
          />
          {loading && (
            <div className="loading" role="status">
              <span className="loading-ring" aria-hidden="true" />
              Preparing the layered magnet model…
            </div>
          )}
          {!loading && (
            <div className="model-labels" aria-label="Current model labels">
              {visibleLabels[state.step].map((label) => {
                const position = positions[label.id];
                if (!position?.visible) return null;
                if (label.selectionId && !state.components[label.selectionId].visible) return null;
                const style = { left: position.x, top: position.y };
                return label.selectionId ? (
                  <button
                    type="button"
                    className="model-label"
                    key={label.id}
                    style={style}
                    onClick={() => onSelect(label.selectionId!)}
                  >
                    {label.text}
                  </button>
                ) : (
                  <span className="model-label static" key={label.id} style={style}>
                    {label.text}
                  </span>
                );
              })}
            </div>
          )}
          {hover && hoverComponent && (
            <div className="hover-tip" style={{ left: hover.x, top: hover.y }}>
              {hoverComponent.kind === "layer"
                ? `${String(hoverComponent.order).padStart(2, "0")} · ${hoverComponent.shortName}`
                : `SERVICE · ${hoverComponent.shortName}`}
            </div>
          )}
          <div className="viewport-controls">
            <div className="viewport-spatial-controls">
              <div className="viewport-spatial-row">
                <label htmlFor="viewport-explode">
                  <span>Layer separation</span>
                  <output>{Math.round(state.explode * 100)}%</output>
                </label>
                <input
                  id="viewport-explode"
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(state.explode * 100)}
                  onChange={(event) => onExplode(Number(event.currentTarget.value) / 100)}
                />
              </div>
              <div className="viewport-spatial-row">
                <label htmlFor="viewport-radial-explode">
                  <span>Exploded view</span>
                  <output>{Math.round(state.radialExplode * 100)}%</output>
                </label>
                <input
                  id="viewport-radial-explode"
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(state.radialExplode * 100)}
                  onChange={(event) => onRadialExplode(Number(event.currentTarget.value) / 100)}
                />
              </div>
            </div>
            <div className="viewport-zoom" role="group" aria-label="Zoom controls">
              <button
                type="button"
                aria-label="Zoom out"
                title="Zoom out"
                onClick={() => sceneRef.current?.zoom("out")}
              >
                −
              </button>
              <button
                type="button"
                aria-label="Zoom in"
                title="Zoom in"
                onClick={() => sceneRef.current?.zoom("in")}
              >
                +
              </button>
            </div>
          </div>
          <div className="model-help" aria-hidden="true">
            DRAG ROTATE · SCROLL ZOOM · ARROW KEYS ROTATE
          </div>
          <div className="axis-chip" aria-hidden="true">Z · BORE AXIS</div>
        </>
      ) : (
        <div className="fallback" role="status">
          <strong>3D view unavailable</strong>
          <span>Use the layer explorer and descriptions to review the same system relationships.</span>
        </div>
      )}
    </div>
  );
}
