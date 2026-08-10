import { useEffect, useRef, useState } from "react";
import { layers, type LayerId, type StepId } from "../content/lesson.ts";
import type { LabState } from "../labState.ts";
import type { LabelPosition, MagnetScene } from "../scene/MagnetScene.ts";

interface Props {
  state: LabState;
  onSelect: (id: LayerId) => void;
  sceneRef: React.RefObject<MagnetScene | null>;
}

const visibleLabels: Record<StepId, Array<{ id: string; text: string; layerId?: LayerId }>> = {
  complete: [
    { id: "bore-liner", text: "Bore", layerId: "bore-liner" },
    { id: "housing", text: "Complete magnet", layerId: "housing" },
  ],
  cutaway: [
    { id: "bore-liner", text: "Bore", layerId: "bore-liner" },
    { id: "cryostat-inner", text: "Cryostat", layerId: "cryostat-inner" },
    { id: "main-magnet", text: "Main windings", layerId: "main-magnet" },
  ],
  windings: [
    { id: "main-magnet", text: "Superconducting wire windings", layerId: "main-magnet" },
    { id: "cryostat-inner", text: "Cryostat · cold environment", layerId: "cryostat-inner" },
  ],
  field: [
    { id: "main-magnet", text: "Current in windings", layerId: "main-magnet" },
    { id: "b0", text: "B₀ · static magnetic field" },
    { id: "isocenter", text: "Isocenter" },
  ],
  geometry: [
    { id: "bore-liner", text: "Central bore", layerId: "bore-liner" },
    { id: "b0", text: "B₀ · qualitative geometry" },
    { id: "isocenter", text: "Isocenter" },
  ],
  reassembled: [
    { id: "bore-liner", text: "Bore", layerId: "bore-liner" },
    { id: "housing", text: "Complete magnet", layerId: "housing" },
  ],
};

export default function ModelViewport({ state, onSelect, sceneRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState<{ id: LayerId; x: number; y: number } | null>(null);
  const [positions, setPositions] = useState<Record<string, LabelPosition>>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let active = true;
    let scene: MagnetScene | null = null;
    let observer: ResizeObserver | null = null;

    import("../scene/MagnetScene.ts")
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
  }, [onSelect, sceneRef]);

  useEffect(() => {
    sceneRef.current?.update({
      step: state.step,
      layers: state.layers,
      selectedLayer: state.selectedLayer,
      explode: state.explode,
      cutaway: state.cutaway,
      sectionEnabled: state.sectionEnabled,
      sectionPlane: state.sectionPlane,
      b0Visible: state.b0Visible,
      fieldMode: state.fieldMode,
      reducedMotion: state.reducedMotion,
    });
  }, [sceneRef, state]);

  const hoverLayer = hover ? layers.find((layer) => layer.id === hover.id) : null;

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
                const style = { left: position.x, top: position.y };
                return label.layerId ? (
                  <button
                    type="button"
                    className="model-label"
                    key={label.id}
                    style={style}
                    onClick={() => onSelect(label.layerId!)}
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
          {hover && hoverLayer && (
            <div className="hover-tip" style={{ left: hover.x, top: hover.y }}>
              {String(hoverLayer.order).padStart(2, "0")} · {hoverLayer.shortName}
            </div>
          )}
          <div className="model-help" aria-hidden="true">
            DRAG ROTATE · SCROLL ZOOM · ARROW KEYS ROTATE · +/− ZOOM
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
