import { layers, type LayerId } from "../content/lesson.ts";
import type { LabState } from "../labState.ts";

interface Props {
  state: LabState;
  onSelect: (id: LayerId) => void;
  onToggle: (id: LayerId) => void;
  onOpacity: (id: LayerId, value: number) => void;
  onIsolate: (id: LayerId) => void;
  onShowAll: () => void;
}

export default function LayerExplorer({
  state,
  onSelect,
  onToggle,
  onOpacity,
  onIsolate,
  onShowAll,
}: Props) {
  const selected = layers.find((layer) => layer.id === state.selectedLayer) ?? null;

  return (
    <aside className="explorer" aria-label="Layer explorer">
      <div className="panel-heading">
        <div>
          <span className="kicker">LAYER EXPLORER</span>
          <h2>Eight systems · bore outward</h2>
        </div>
        <button type="button" className="text-action" onClick={onShowAll}>Show all</button>
      </div>

      <ol className="layer-list">
        {layers.map((layer) => {
          const layerState = state.layers[layer.id];
          const isSelected = state.selectedLayer === layer.id;
          return (
            <li key={layer.id} className={isSelected ? "selected" : undefined}>
              <button
                type="button"
                className="layer-name"
                aria-pressed={isSelected}
                onClick={() => onSelect(layer.id)}
              >
                <span className="layer-number">{String(layer.order).padStart(2, "0")}</span>
                <span className="layer-swatch" style={{ background: layer.color }} aria-hidden="true" />
                <span>{layer.shortName}</span>
              </button>
              <button
                type="button"
                className="visibility"
                aria-label={`${layerState.visible ? "Hide" : "Show"} ${layer.name}`}
                aria-pressed={layerState.visible}
                onClick={() => onToggle(layer.id)}
              >
                {layerState.visible ? "ON" : "OFF"}
              </button>
            </li>
          );
        })}
      </ol>

      {selected ? (
        <div className="layer-detail" aria-live="polite">
          <span className="detail-order">LAYER {String(selected.order).padStart(2, "0")} · {selected.radialRange}</span>
          <h3>{selected.name}</h3>
          <p>{selected.summary}</p>
          <div className="detail-actions">
            <button type="button" className="secondary-button" onClick={() => onIsolate(selected.id)}>
              Isolate layer
            </button>
          </div>
          <label className="range-label" htmlFor="layer-opacity">
            <span>Layer opacity</span>
            <output>{Math.round(state.layers[selected.id].opacity * 100)}%</output>
          </label>
          <input
            id="layer-opacity"
            type="range"
            min="10"
            max="100"
            value={Math.round(state.layers[selected.id].opacity * 100)}
            onChange={(event) => {
              const opacity = Number(event.currentTarget.value) / 100;
              onOpacity(selected.id, opacity);
            }}
          />
          <p className="source-note">{selected.source}</p>
        </div>
      ) : (
        <div className="layer-empty">
          Select any layer in the model or list to inspect its role without leaving the guided lesson.
        </div>
      )}
    </aside>
  );
}
