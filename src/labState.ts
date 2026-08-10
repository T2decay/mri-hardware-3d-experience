import type { FieldMode, LayerId, StepId } from "./content/lesson.ts";

export interface LayerState {
  visible: boolean;
  opacity: number;
}

export interface LabState {
  step: StepId;
  selectedLayer: LayerId | null;
  layers: Record<LayerId, LayerState>;
  explode: number;
  sectionPlane: number;
  sectionEnabled: boolean;
  cutaway: boolean;
  b0Visible: boolean;
  fieldMode: FieldMode;
  reducedMotion: boolean;
  windingsVisited: boolean;
  challengeComplete: boolean;
}

const layerIds: LayerId[] = [
  "bore-liner",
  "rf-body-coil",
  "rf-screen",
  "gradient-assembly",
  "cryostat-inner",
  "main-magnet",
  "active-shield",
  "housing",
];

export function defaultLayerState(): Record<LayerId, LayerState> {
  return Object.fromEntries(layerIds.map((id) => [id, { visible: true, opacity: 1 }])) as Record<
    LayerId,
    LayerState
  >;
}

export function initialLabState(): LabState {
  return {
    step: "complete",
    selectedLayer: null,
    layers: defaultLayerState(),
    explode: 0,
    sectionPlane: 1,
    sectionEnabled: false,
    cutaway: false,
    b0Visible: false,
    fieldMode: "both",
    reducedMotion: false,
    windingsVisited: false,
    challengeComplete: false,
  };
}
