import {
  relationshipPathways,
  type RelationshipPathwayId,
} from "../content/lesson.ts";

export interface RelationshipModeState {
  activePathwayId: RelationshipPathwayId | null;
  stepIndex: number;
  phase: "explore" | "scenario";
  selectedChoiceId: string | null;
  answerCorrect: boolean;
  feedback: string;
  feedbackTone: "neutral" | "retry" | "correct";
  completedPathways: RelationshipPathwayId[];
}

interface Props {
  mode: RelationshipModeState;
  onSelectPathway: (id: RelationshipPathwayId) => void;
  onSelectStep: (index: number) => void;
  onOpenScenario: () => void;
  onChooseAnswer: (choiceId: string) => void;
  onBackToPathways: () => void;
  onNextPathway: () => void;
}

export default function SystemRelationships({
  mode,
  onSelectPathway,
  onSelectStep,
  onOpenScenario,
  onChooseAnswer,
  onBackToPathways,
  onNextPathway,
}: Props) {
  const activePathway = relationshipPathways.find((pathway) => pathway.id === mode.activePathwayId) ?? null;
  const activeStep = activePathway?.steps[mode.stepIndex] ?? null;

  return (
    <section className="relationship-mode" aria-labelledby="relationship-title">
      <div className="relationship-heading">
        <div>
          <span className="kicker">SYSTEM RELATIONSHIPS · CHAPTER 9</span>
          <h3 id="relationship-title">See how the hardware works together</h3>
        </div>
        <div className="relationship-completion" aria-label={`${mode.completedPathways.length} of ${relationshipPathways.length} pathways complete`}>
          <strong>{mode.completedPathways.length}/{relationshipPathways.length}</strong>
          <span>pathways complete</span>
        </div>
      </div>

      {!activePathway ? (
        <div className="relationship-library">
          <p>
            Choose a pathway to drive the 3D model through one cause-and-effect chain. Every explanation and check is bounded to the assigned Chapter 9 reading.
          </p>
          <div className="relationship-pathway-grid">
            {relationshipPathways.map((pathway) => {
              const complete = mode.completedPathways.includes(pathway.id);
              return (
                <button
                  type="button"
                  key={pathway.id}
                  className="relationship-pathway-card"
                  onClick={() => onSelectPathway(pathway.id)}
                  style={{ "--pathway-accent": pathway.accent } as React.CSSProperties}
                >
                  <span className="relationship-pathway-status">{complete ? "COMPLETE" : "EXPLORE"}</span>
                  <strong>{pathway.shortLabel}</strong>
                  <span>{pathway.summary}</span>
                </button>
              );
            })}
          </div>
          <div className="relationship-boundary-note">
            The pathways distinguish field generation, magnetic shielding, RF shielding, gradient encoding, and cryogenic support. Similar words do not mean the systems perform the same job.
          </div>
        </div>
      ) : (
        <div className="relationship-active">
          <div className="relationship-pathway-nav">
            <button type="button" className="text-action" onClick={onBackToPathways}>All pathways</button>
            <div>
              <span className="relationship-pathway-status">ACTIVE PATHWAY</span>
              <h4>{activePathway.title}</h4>
            </div>
          </div>

          {mode.phase === "explore" && activeStep && (
            <>
              <ol className="relationship-chain" aria-label={`${activePathway.shortLabel} pathway steps`}>
                {activePathway.steps.map((step, index) => (
                  <li key={step.id}>
                    <button
                      type="button"
                      aria-current={mode.stepIndex === index ? "step" : undefined}
                      onClick={() => onSelectStep(index)}
                    >
                      <span>{step.label}</span>
                      <strong>{step.title}</strong>
                    </button>
                  </li>
                ))}
              </ol>

              <div className="relationship-step-detail" aria-live="polite">
                <div className="relationship-step-number">{String(mode.stepIndex + 1).padStart(2, "0")}</div>
                <div>
                  <span>{activeStep.label}</span>
                  <h5>{activeStep.title}</h5>
                  <p>{activeStep.explanation}</p>
                  {activeStep.id === "faraday-cage" && (
                    <div
                      className="room-boundary-diagram"
                      role="img"
                      aria-label="The RF-shielded room boundary surrounds the scanner hardware. It is outside the magnet and is not a radial scanner layer."
                    >
                      <span className="room-boundary-label">RF-SHIELDED ROOM · FARADAY CAGE</span>
                      <div className="room-boundary-scanner">
                        <span>SCANNER HARDWARE</span>
                        <i aria-hidden="true" />
                      </div>
                      <small>ROOM BOUNDARY · OUTSIDE THE MAGNET</small>
                    </div>
                  )}
                  <small>{activeStep.source}</small>
                </div>
              </div>

              <div className="relationship-actions">
                {mode.stepIndex < activePathway.steps.length - 1 ? (
                  <button type="button" className="challenge-primary" onClick={() => onSelectStep(mode.stepIndex + 1)}>
                    Next relationship
                  </button>
                ) : (
                  <button type="button" className="challenge-primary" onClick={onOpenScenario}>
                    Check understanding
                  </button>
                )}
              </div>
            </>
          )}

          {mode.phase === "scenario" && (
            <div className="relationship-scenario">
              <span className="relationship-pathway-status">PATHWAY CHECK</span>
              <h5>{activePathway.scenario.prompt}</h5>
              <div className="relationship-answer-list" role="group" aria-label={`${activePathway.shortLabel} pathway answers`}>
                {activePathway.scenario.choices.map((choice) => (
                  <button
                    type="button"
                    key={choice.id}
                    aria-pressed={mode.selectedChoiceId === choice.id}
                    disabled={mode.answerCorrect}
                    onClick={() => onChooseAnswer(choice.id)}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
              <div className={`relationship-feedback ${mode.feedbackTone}`} aria-live="polite">
                <strong>{mode.feedbackTone === "correct" ? "Relationship confirmed" : mode.feedbackTone === "retry" ? "Try the distinction again" : "Choose the best explanation"}</strong>
                <p>{mode.feedback}</p>
                {mode.answerCorrect && <span>{activePathway.scenario.source}</span>}
              </div>
              {mode.answerCorrect && (
                <div className="relationship-actions">
                  <button type="button" className="challenge-primary" onClick={onNextPathway}>
                    {mode.completedPathways.length === relationshipPathways.length ? "Review pathways" : "Choose another pathway"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
