import { useCallback, useMemo, useRef, useState } from "react";
import LayerExplorer from "./components/LayerExplorer.tsx";
import ModelViewport from "./components/ModelViewport.tsx";
import {
  experienceCopy,
  fieldModes,
  layers,
  steps,
  type LayerId,
  type StepId,
} from "./content/lesson.ts";
import { defaultLayerState, initialLabState, type LabState } from "./labState.ts";
import type { MagnetScene } from "./scene/MagnetScene.ts";

function stepState(previous: LabState, step: StepId): LabState {
  const next = { ...previous, step };
  if (step === "complete") {
    next.cutaway = false;
    next.explode = 0;
    next.b0Visible = false;
    next.selectedLayer = null;
    next.layers = defaultLayerState();
  } else if (step === "cutaway") {
    next.cutaway = true;
    next.b0Visible = false;
    next.layers = defaultLayerState();
  } else if (step === "windings") {
    next.cutaway = true;
    next.b0Visible = false;
    next.selectedLayer = "main-magnet";
    next.windingsVisited = true;
    next.layers = Object.fromEntries(
      layers.map((layer) => [
        layer.id,
        { visible: true, opacity: layer.id === "main-magnet" ? 1 : 0.16 },
      ]),
    ) as LabState["layers"];
  } else if (step === "field" || step === "geometry") {
    next.cutaway = true;
    next.b0Visible = true;
    next.selectedLayer = "main-magnet";
    next.layers = Object.fromEntries(
      layers.map((layer) => [
        layer.id,
        { visible: true, opacity: layer.id === "main-magnet" ? 1 : 0.32 },
      ]),
    ) as LabState["layers"];
    next.challengeComplete = previous.challengeComplete || previous.windingsVisited;
  } else if (step === "reassembled") {
    next.cutaway = false;
    next.explode = 0;
    next.b0Visible = false;
    next.selectedLayer = null;
    next.layers = defaultLayerState();
  }
  return next;
}

export default function App() {
  const [state, setState] = useState<LabState>(() => initialLabState());
  const sceneRef = useRef<MagnetScene | null>(null);
  const activeStep = useMemo(() => steps.find((step) => step.id === state.step)!, [state.step]);

  const selectLayer = useCallback((id: LayerId) => {
    setState((previous) => ({ ...previous, selectedLayer: id }));
  }, []);

  const activateStep = (step: StepId) => setState((previous) => stepState(previous, step));

  const reset = () => {
    setState(initialLabState());
    sceneRef.current?.resetCamera(state.reducedMotion);
  };

  const isolate = (id: LayerId) => {
    setState((previous) => ({
      ...previous,
      cutaway: true,
      selectedLayer: id,
      windingsVisited: previous.windingsVisited || id === "main-magnet",
      layers: Object.fromEntries(
        layers.map((layer) => [
          layer.id,
          { visible: true, opacity: layer.id === id ? 1 : 0.08 },
        ]),
      ) as LabState["layers"],
    }));
  };

  const showAll = () => setState((previous) => ({ ...previous, layers: defaultLayerState() }));

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <span className="kicker">{experienceCopy.eyebrow}</span>
          <h1>{experienceCopy.title}</h1>
        </div>
        <div className="source-lockup">
          <span>Source-bound companion experience</span>
          <strong>MRI in Practice, Fifth Edition · pp. 318–326</strong>
        </div>
      </header>

      <div className="learning-strip">
        <span className="kicker">LEARNING OBJECTIVE</span>
        <p>{experienceCopy.objective}</p>
      </div>

      <main className="workspace">
        <section className="experience-column">
          <div className="stage-heading">
            <div>
              <span className="kicker">GUIDED STATE · {String(steps.findIndex((step) => step.id === state.step) + 1).padStart(2, "0")}</span>
              <h2>{activeStep.title}</h2>
            </div>
            <button type="button" className="secondary-button" onClick={reset}>Reset all</button>
          </div>

          <ModelViewport state={state} onSelect={selectLayer} sceneRef={sceneRef} />
          <div className="caption-row">
            <span>{experienceCopy.modelCaption}</span>
            {state.b0Visible && <span className="field-caption">{experienceCopy.fieldCaption}</span>}
          </div>

          <section className="explore-controls" aria-label="Persistent model explorer">
            <div className="control-header">
              <div>
                <span className="kicker">FREE EXPLORATION · ALWAYS AVAILABLE</span>
                <h3>Inspect without leaving the lesson</h3>
              </div>
              <div className="button-cluster">
                <button
                  type="button"
                  className="secondary-button"
                  aria-pressed={state.cutaway}
                  onClick={() => setState((previous) => ({ ...previous, cutaway: !previous.cutaway }))}
                >
                  {state.cutaway ? "Cutaway on" : "Cutaway off"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  aria-pressed={state.b0Visible}
                  onClick={() =>
                    setState((previous) => ({
                      ...previous,
                      b0Visible: !previous.b0Visible,
                      challengeComplete:
                        previous.challengeComplete || (!previous.b0Visible && previous.windingsVisited),
                    }))
                  }
                >
                  {state.b0Visible ? "B₀ visible" : "Show B₀"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  aria-pressed={state.reducedMotion}
                  onClick={() => setState((previous) => ({ ...previous, reducedMotion: !previous.reducedMotion }))}
                >
                  {state.reducedMotion ? "Motion reduced" : "Reduce motion"}
                </button>
              </div>
            </div>

            <div className="range-grid">
              <div className="range-control">
                <label className="range-label" htmlFor="explode">
                  <span>Explode layers</span>
                  <output>{Math.round(state.explode * 100)}%</output>
                </label>
                <input
                  id="explode"
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(state.explode * 100)}
                  onChange={(event) => {
                    const explode = Number(event.currentTarget.value) / 100;
                    setState((previous) => ({ ...previous, explode }));
                  }}
                />
              </div>

              <div className="range-control section-control">
                <label className="range-label" htmlFor="section-plane">
                  <span>Section plane · slide along bore</span>
                  <output>{state.sectionEnabled ? `${Math.round(state.sectionPlane * 100)}%` : "OFF"}</output>
                </label>
                <div className="range-with-toggle">
                  <button
                    type="button"
                    className="mini-toggle"
                    aria-pressed={state.sectionEnabled}
                    onClick={() => setState((previous) => ({ ...previous, sectionEnabled: !previous.sectionEnabled }))}
                  >
                    {state.sectionEnabled ? "ON" : "OFF"}
                  </button>
                  <input
                    id="section-plane"
                    type="range"
                    min="2"
                    max="100"
                    disabled={!state.sectionEnabled}
                    value={Math.round(state.sectionPlane * 100)}
                    onChange={(event) => {
                      const sectionPlane = Number(event.currentTarget.value) / 100;
                      setState((previous) => ({ ...previous, sectionPlane }));
                    }}
                  />
                </div>
              </div>
            </div>

            {state.b0Visible && (
              <div className="field-mode-row">
                <span className="kicker">FIELD GEOMETRY</span>
                <div className="button-cluster" role="group" aria-label="Field geometry view">
                  {(Object.keys(fieldModes) as Array<keyof typeof fieldModes>).map((mode) => (
                    <button
                      type="button"
                      className="field-button"
                      key={mode}
                      aria-pressed={state.fieldMode === mode}
                      onClick={() => setState((previous) => ({ ...previous, fieldMode: mode }))}
                    >
                      {fieldModes[mode].label}
                    </button>
                  ))}
                </div>
                <p>{fieldModes[state.fieldMode].detail}</p>
              </div>
            )}
          </section>

          <nav className="guided-steps" aria-label="Guided lesson steps">
            {steps.map((step, index) => (
              <button
                type="button"
                key={step.id}
                aria-current={state.step === step.id ? "step" : undefined}
                onClick={() => activateStep(step.id)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.shortLabel}</strong>
              </button>
            ))}
          </nav>
          <div className="step-instruction">
            <p>{activeStep.instruction}</p>
            <div className={state.challengeComplete ? "challenge complete" : "challenge"} aria-live="polite">
              {state.challengeComplete ? experienceCopy.challengeComplete : experienceCopy.challenge}
            </div>
          </div>
        </section>

        <LayerExplorer
          state={state}
          onSelect={selectLayer}
          onToggle={(id) =>
            setState((previous) => ({
              ...previous,
              layers: {
                ...previous.layers,
                [id]: { ...previous.layers[id], visible: !previous.layers[id].visible },
              },
            }))
          }
          onOpacity={(id, opacity) =>
            setState((previous) => ({
              ...previous,
              layers: { ...previous.layers, [id]: { ...previous.layers[id], opacity } },
            }))
          }
          onIsolate={isolate}
          onShowAll={showAll}
        />
      </main>

      <footer>
        B₀ / static field · magnetic shielding · RF shielding / Faraday cage remain separate concepts and controls.
      </footer>
    </div>
  );
}
