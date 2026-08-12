import {
  challengeBuildSteps,
  challengeQuestions,
  challengeTrayOrder,
  layers,
  type LayerId,
} from "../content/lesson.ts";

export type ChallengePhase = "idle" | "build" | "explain" | "complete";
export type FeedbackTone = "neutral" | "retry" | "correct";

export interface BuildChallengeState {
  phase: ChallengePhase;
  buildIndex: number;
  buildMistakes: number;
  questionIndex: number;
  questionMistakes: number;
  firstTryCorrect: number;
  questionHadMistake: boolean;
  selectedChoiceId: string | null;
  answerCorrect: boolean;
  feedback: string;
  feedbackTone: FeedbackTone;
}

interface Props {
  challenge: BuildChallengeState;
  onStart: () => void;
  onChooseLayer: (id: LayerId) => void;
  onChooseAnswer: (choiceId: string) => void;
  onNextQuestion: () => void;
  onExit: () => void;
  onReview: () => void;
}

const layerById = Object.fromEntries(layers.map((layer) => [layer.id, layer]));

function Progress({ current, total, label }: { current: number; total: number; label: string }) {
  const percent = Math.round((current / total) * 100);
  return (
    <div className="challenge-progress" aria-label={`${label}: ${current} of ${total}`}>
      <div className="challenge-progress-copy">
        <span>{label}</span>
        <strong>{current} / {total}</strong>
      </div>
      <div className="challenge-progress-track" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function BuildChallenge({
  challenge,
  onStart,
  onChooseLayer,
  onChooseAnswer,
  onNextQuestion,
  onExit,
  onReview,
}: Props) {
  const activeBuildStep = challengeBuildSteps[challenge.buildIndex];
  const activeQuestion = challengeQuestions[challenge.questionIndex];

  return (
    <section className="knowledge-challenge" aria-labelledby="build-challenge-title">
      <div className="knowledge-challenge-heading">
        <div>
          <span className="kicker">BUILD &amp; EXPLAIN · CHAPTER 9</span>
          <h3 id="build-challenge-title">Reconstruct the superconducting magnet</h3>
        </div>
        {challenge.phase !== "idle" && (
          <button type="button" className="text-action" onClick={onExit}>Exit challenge</button>
        )}
      </div>

      {challenge.phase === "idle" && (
        <div className="challenge-intro">
          <p>
            First rebuild this lesson model from the bore outward. Then explain five hardware relationships using only the assigned Chapter 9 reading.
          </p>
          <div className="challenge-boundary">
            <strong>Source boundary</strong>
            <span>
              Functional claims come from <em>MRI in Practice, Fifth Edition</em>, Chapter 9. The radial order is identified as this vendor-neutral teaching model, not a universal manufacturer blueprint.
            </span>
          </div>
          <button type="button" className="challenge-primary" onClick={onStart}>Start challenge</button>
        </div>
      )}

      {challenge.phase === "build" && activeBuildStep && (
        <div className="challenge-body">
          <Progress current={challenge.buildIndex} total={challengeBuildSteps.length} label="Layers placed" />
          <div className="challenge-prompt-row">
            <div>
              <span className="challenge-stage-label">PHASE 1 · BUILD</span>
              <h4>Choose the next layer from the bore outward.</h4>
              <p>Use the 3D model as it rebuilds. The tray order is intentionally mixed.</p>
            </div>
            <span className="challenge-next-position">Position {challenge.buildIndex + 1}</span>
          </div>

          <div className="challenge-layer-tray" role="group" aria-label="Available hardware layers">
            {challengeTrayOrder.map((id) => {
              const buildPosition = challengeBuildSteps.findIndex((step) => step.id === id);
              const placed = buildPosition < challenge.buildIndex;
              const layer = layerById[id];
              return (
                <button
                  type="button"
                  key={id}
                  className="challenge-layer-choice"
                  disabled={placed}
                  onClick={() => onChooseLayer(id)}
                >
                  <span className="layer-swatch" style={{ background: layer.color }} aria-hidden="true" />
                  <span>{layer.shortName}</span>
                  <small>{placed ? "Placed" : "Available"}</small>
                </button>
              );
            })}
          </div>
          <div className={`challenge-feedback ${challenge.feedbackTone}`} aria-live="polite">
            <strong>{challenge.feedbackTone === "retry" ? "Try again" : challenge.feedbackTone === "correct" ? "Layer placed" : "Your task"}</strong>
            <p>{challenge.feedback}</p>
            {challenge.feedbackTone === "correct" && <span>{challengeBuildSteps[Math.max(0, challenge.buildIndex - 1)].source}</span>}
          </div>
        </div>
      )}

      {challenge.phase === "explain" && activeQuestion && (
        <div className="challenge-body">
          <Progress current={challenge.questionIndex} total={challengeQuestions.length} label="Explanations complete" />
          <div className="challenge-prompt-row">
            <div>
              <span className="challenge-stage-label">PHASE 2 · EXPLAIN</span>
              <h4>{activeQuestion.prompt}</h4>
            </div>
            <span className="challenge-next-position">Question {challenge.questionIndex + 1}</span>
          </div>

          <div className="challenge-answer-list" role="group" aria-label={`Answers for question ${challenge.questionIndex + 1}`}>
            {activeQuestion.choices.map((choice) => (
              <button
                type="button"
                key={choice.id}
                aria-pressed={challenge.selectedChoiceId === choice.id}
                disabled={challenge.answerCorrect}
                onClick={() => onChooseAnswer(choice.id)}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <div className={`challenge-feedback ${challenge.feedbackTone}`} aria-live="polite">
            <strong>{challenge.feedbackTone === "retry" ? "Reconsider" : challenge.feedbackTone === "correct" ? "Supported by the text" : "Choose one answer"}</strong>
            <p>{challenge.feedback}</p>
            {challenge.feedbackTone === "correct" && <span>{activeQuestion.source}</span>}
          </div>

          {challenge.answerCorrect && (
            <button type="button" className="challenge-primary" onClick={onNextQuestion}>
              {challenge.questionIndex === challengeQuestions.length - 1 ? "Finish challenge" : "Next question"}
            </button>
          )}
        </div>
      )}

      {challenge.phase === "complete" && (
        <div className="challenge-complete-card" aria-live="polite">
          <span className="challenge-complete-mark" aria-hidden="true">✓</span>
          <div>
            <span className="challenge-stage-label">CHALLENGE COMPLETE</span>
            <h4>You rebuilt the model and connected each system to its role.</h4>
            <p>
              {challenge.firstTryCorrect} of {challengeQuestions.length} explanations were correct on the first try. You made {challenge.buildMistakes} {challenge.buildMistakes === 1 ? "revision" : "revisions"} while rebuilding and {challenge.questionMistakes} while explaining.
            </p>
            <p className="challenge-source-summary">
              Review boundary: <em>MRI in Practice, Fifth Edition</em>, Chapter 9, pp. 318–339. This is practice feedback, not a recorded grade.
            </p>
            <div className="challenge-complete-actions">
              <button type="button" className="challenge-primary" onClick={onReview}>Review assembled model</button>
              <button type="button" className="secondary-button" onClick={onStart}>Try again</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
