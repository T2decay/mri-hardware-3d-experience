import { useCallback, useMemo, useRef, useState } from "react";
import LayerExplorer from "./components/LayerExplorer.tsx";
import ModelViewport from "./components/ModelViewport.tsx";
import {
  cutawayModes,
  experienceCopy,
  fieldModes,
  selectableDefinitions,
  steps,
  type CutawayMode,
  type SelectionId,
  type StepId,
} from "./content/lesson.ts";
import {
  defaultComponentState,
  initialLabState,
  strippedComponentState,
  type LabState,
} from "./labState.ts";
import type { MagnetScene } from "./scene/MagnetScene.ts";

function preserveCladdingVisibility(
  components: LabState["components"],
  previous: LabState,
): LabState["components"] {
  return {
    ...components,
    "scanner-cladding": {
      ...components["scanner-cladding"],
      visible: previous.components["scanner-cladding"].visible,
    },
  };
}

function stepState(previous: LabState, step: StepId): LabState {
  const next = { ...previous, step };
  if (step === "complete") {
    next.cutawayMode = "closed";
    next.explode = 0;
    next.radialExplode = 0;
    next.b0Visible = false;
    next.selectedComponent = null;
    next.components = preserveCladdingVisibility(defaultComponentState(), previous);
  } else if (step === "cutaway") {
    next.cutawayMode = "window-90";
    next.b0Visible = false;
    next.components = preserveCladdingVisibility(defaultComponentState(), previous);
  } else if (step === "windings") {
    next.cutawayMode = "window-90";
    next.b0Visible = false;
    next.selectedComponent = "main-magnet";
    next.windingsVisited = true;
    next.components = preserveCladdingVisibility(
      Object.fromEntries(
        selectableDefinitions.map((component) => [
          component.id,
          { visible: true, opacity: component.id === "main-magnet" ? 1 : 0.16 },
        ]),
      ) as LabState["components"],
      previous,
    );
  } else if (step === "field" || step === "geometry") {
    next.cutawayMode = "window-90";
    next.b0Visible = true;
    next.selectedComponent = "main-magnet";
    next.components = preserveCladdingVisibility(
      Object.fromEntries(
        selectableDefinitions.map((component) => [
          component.id,
          { visible: true, opacity: component.id === "main-magnet" ? 1 : 0.32 },
        ]),
      ) as LabState["components"],
      previous,
    );
    next.challengeComplete = previous.challengeComplete || previous.windingsVisited;
  } else if (step === "reassembled") {
    next.cutawayMode = "closed";
    next.explode = 0;
    next.radialExplode = 0;
    next.b0Visible = false;
    next.selectedComponent = null;
    next.components = preserveCladdingVisibility(defaultComponentState(), previous);
  }
  return next;
}

export default function App() {
  const [state, setState] = useState<LabState>(() => initialLabState());
  const sceneRef = useRef<MagnetScene | null>(null);
  const activeStep = useMemo(() => steps.find((step) => step.id === state.step)!, [state.step]);

  const selectComponent = useCallback((id: SelectionId) => {
    setState((previous) => ({
      ...previous,
      selectedComponent: id,
      windingsVisited: previous.windingsVisited || id === "main-magnet",
      components: {
        ...previous.components,
        [id]: { ...previous.components[id], visible: true },
        ...(id === "quench-vent" || id === "cryogenic-chiller"
          ? {
              "scanner-cladding": {
                ...previous.components["scanner-cladding"],
                visible: false,
              },
            }
          : {}),
      },
    }));
  }, []);

  const activateStep = (step: StepId) => setState((previous) => stepState(previous, step));

  const reset = () => {
    setState(initialLabState());
    sceneRef.current?.resetCamera(state.reducedMotion);
  };

  const isolate = (id: SelectionId) => {
    setState((previous) => {
      const components = Object.fromEntries(
        selectableDefinitions.map((component) => [
          component.id,
          { visible: true, opacity: component.id === id ? 1 : 0.08 },
        ]),
      ) as LabState["components"];
      if (id !== "scanner-cladding") {
        components["scanner-cladding"].visible = previous.components["scanner-cladding"].visible;
      }
      return {
        ...previous,
        cutawayMode: "window-90",
        selectedComponent: id,
        windingsVisited: previous.windingsVisited || id === "main-magnet",
        components,
      };
    });
  };

  const showAll = () => setState((previous) => ({ ...previous, components: defaultComponentState() }));
  const stripAll = () =>
    setState((previous) => ({
      ...previous,
      selectedComponent: null,
      components: strippedComponentState(previous.components),
    }));

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

          <ModelViewport
            state={state}
            onSelect={selectComponent}
            onExplode={(explode) => setState((previous) => ({ ...previous, explode }))}
            onRadialExplode={(radialExplode) =>
              setState((previous) => ({ ...previous, radialExplode }))
            }
            sceneRef={sceneRef}
          />
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
                  aria-pressed={!state.components["scanner-cladding"].visible}
                  onClick={() =>
                    setState((previous) => ({
                      ...previous,
                      components: {
                        ...previous.components,
                        "scanner-cladding": {
                          ...previous.components["scanner-cladding"],
                          visible: !previous.components["scanner-cladding"].visible,
                        },
                      },
                    }))
                  }
                >
                  {state.components["scanner-cladding"].visible ? "Remove cladding" : "Restore cladding"}
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

            <div className="cutaway-control">
              <div>
                <span className="kicker">CUTAWAY PRESET</span>
                <p>{cutawayModes[state.cutawayMode].detail}</p>
              </div>
              <div className="button-cluster" role="group" aria-label="Cutaway preset">
                {(Object.keys(cutawayModes) as CutawayMode[]).map((mode) => (
                  <button
                    type="button"
                    className="field-button"
                    key={mode}
                    aria-pressed={state.cutawayMode === mode}
                    onClick={() => setState((previous) => ({ ...previous, cutawayMode: mode }))}
                  >
                    {cutawayModes[mode].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="range-grid section-range-grid">
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
          onSelect={selectComponent}
          onToggle={(id) =>
            setState((previous) => ({
              ...previous,
              components: {
                ...previous.components,
                [id]: { ...previous.components[id], visible: !previous.components[id].visible },
              },
            }))
          }
          onOpacity={(id, opacity) =>
            setState((previous) => ({
              ...previous,
              components: {
                ...previous.components,
                [id]: { ...previous.components[id], opacity, visible: true },
              },
            }))
          }
          onIsolate={isolate}
          onShowAll={showAll}
          onStripAll={stripAll}
        />
      </main>

      <footer>
        B₀ / static field · magnetic shielding · room RF shielding / Faraday cage are distinct concepts; the room enclosure is not a magnet layer.
      </footer>
    </div>
  );
}
