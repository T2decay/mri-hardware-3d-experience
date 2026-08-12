import {
  layers,
  selectableDefinitions,
  serviceComponents,
  type SelectionId,
} from "../content/lesson.ts";
import type { LabState } from "../labState.ts";

interface Props {
  state: LabState;
  onSelect: (id: SelectionId) => void;
  onToggle: (id: SelectionId) => void;
  onOpacity: (id: SelectionId, value: number) => void;
  onIsolate: (id: SelectionId) => void;
  onShowAll: () => void;
  onStripAll: () => void;
  interactionLocked?: boolean;
}

interface VisibilityToggleProps {
  visible: boolean;
  name: string;
  onToggle: () => void;
  disabled?: boolean;
}

function VisibilityToggle({ visible, name, onToggle, disabled }: VisibilityToggleProps) {
  return (
    <button
      type="button"
      className="visibility"
      aria-label={`${visible ? "Hide" : "Show"} ${name}`}
      aria-pressed={visible}
      onClick={onToggle}
      disabled={disabled}
    >
      <span className="visibility-state">{visible ? "ON" : "OFF"}</span>
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-thumb" />
      </span>
    </button>
  );
}

export default function LayerExplorer({
  state,
  onSelect,
  onToggle,
  onOpacity,
  onIsolate,
  onShowAll,
  onStripAll,
  interactionLocked = false,
}: Props) {
  const selected = selectableDefinitions.find((component) => component.id === state.selectedComponent) ?? null;

  return (
    <aside className="explorer" aria-label="Hardware explorer">
      <div className="panel-heading">
        <div>
          <span className="kicker">HARDWARE EXPLORER</span>
          <h2>Eight layers · bore outward</h2>
        </div>
        <div className="panel-actions">
          <button type="button" className="text-action" onClick={onShowAll} disabled={interactionLocked}>Show all</button>
          <button type="button" className="text-action" onClick={onStripAll} disabled={interactionLocked}>Strip all</button>
        </div>
      </div>

      {interactionLocked && (
        <p className="explorer-lock-note" role="status">
          Explorer controls pause during the build phase so each choice comes from the challenge tray.
        </p>
      )}

      <ol className="layer-list">
        {layers.map((layer) => {
          const componentState = state.components[layer.id];
          const isSelected = state.selectedComponent === layer.id;
          return (
            <li key={layer.id} className={isSelected ? "selected" : undefined}>
              <button
                type="button"
                className="layer-name"
                aria-pressed={isSelected}
                onClick={() => onSelect(layer.id)}
                disabled={interactionLocked}
              >
                <span className="layer-number">{String(layer.order).padStart(2, "0")}</span>
                <span className="layer-swatch" style={{ background: layer.color }} aria-hidden="true" />
                <span>{layer.shortName}</span>
              </button>
              <VisibilityToggle
                visible={componentState.visible}
                name={layer.name}
                onToggle={() => onToggle(layer.id)}
                disabled={interactionLocked}
              />
            </li>
          );
        })}
      </ol>

      <div className="service-heading">
        <span className="kicker">CRYOGENIC SERVICE COMPONENTS</span>
        <p>Selectable hardware · not radial layers</p>
      </div>
      <ul className="layer-list service-list">
        {serviceComponents.map((component) => {
          const componentState = state.components[component.id];
          const isSelected = state.selectedComponent === component.id;
          return (
            <li key={component.id} className={isSelected ? "selected" : undefined}>
              <button
                type="button"
                className="layer-name"
                aria-pressed={isSelected}
                onClick={() => onSelect(component.id)}
                disabled={interactionLocked}
              >
                <span className="service-mark">S</span>
                <span className="layer-swatch" style={{ background: component.color }} aria-hidden="true" />
                <span>{component.shortName}</span>
              </button>
              <VisibilityToggle
                visible={componentState.visible}
                name={component.name}
                onToggle={() => onToggle(component.id)}
                disabled={interactionLocked}
              />
            </li>
          );
        })}
      </ul>

      {selected ? (
        <div className="layer-detail" aria-live="polite">
          <span className="detail-order">
            {selected.kind === "layer"
              ? `LAYER ${String(selected.order).padStart(2, "0")} · ${selected.radialRange}`
              : "CRYOGENIC SERVICE COMPONENT"}
          </span>
          <h3>{selected.name}</h3>
          <p>{selected.summary}</p>
          {selected.kind === "service" && (
            <div className="service-notes">
              <p><strong>Why it matters:</strong> {selected.safetyNote}</p>
              <p><strong>Do not confuse it with:</strong> {selected.misconception}</p>
            </div>
          )}
          <div className="detail-actions">
            <button type="button" className="secondary-button" onClick={() => onIsolate(selected.id)} disabled={interactionLocked}>
              Isolate {selected.kind === "layer" ? "layer" : "component"}
            </button>
          </div>
          <label className="range-label" htmlFor="component-opacity">
            <span>Selected opacity</span>
            <output>{Math.round(state.components[selected.id].opacity * 100)}%</output>
          </label>
          <input
            id="component-opacity"
            type="range"
            min="5"
            max="100"
            value={Math.round(state.components[selected.id].opacity * 100)}
            disabled={interactionLocked}
            onChange={(event) => {
              const opacity = Number(event.currentTarget.value) / 100;
              onOpacity(selected.id, opacity);
            }}
          />
          <p className="source-note">{selected.source}</p>
        </div>
      ) : (
        <div className="layer-empty">
          Select a layer or service component in the model or list. After Strip all, selecting an item from this list reveals it for reconstruction.
        </div>
      )}
    </aside>
  );
}
