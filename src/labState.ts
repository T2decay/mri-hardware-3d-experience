import {
  layers,
  serviceComponents,
  type CutawayMode,
  type FieldMode,
  type SelectionId,
  type StepId,
} from "./content/lesson.ts";

export interface ComponentState {
  visible: boolean;
  opacity: number;
}

export interface LabState {
  step: StepId;
  selectedComponent: SelectionId | null;
  components: Record<SelectionId, ComponentState>;
  explode: number;
  radialExplode: number;
  sectionPlane: number;
  sectionEnabled: boolean;
  cutawayMode: CutawayMode;
  b0Visible: boolean;
  fieldMode: FieldMode;
  reducedMotion: boolean;
  windingsVisited: boolean;
  challengeComplete: boolean;
}

export const componentIds: SelectionId[] = [
  ...layers.map((layer) => layer.id),
  ...serviceComponents.map((component) => component.id),
];

export function defaultComponentState(): Record<SelectionId, ComponentState> {
  return Object.fromEntries(componentIds.map((id) => [id, { visible: true, opacity: 1 }])) as Record<
    SelectionId,
    ComponentState
  >;
}

export function strippedComponentState(
  previous: Record<SelectionId, ComponentState>,
): Record<SelectionId, ComponentState> {
  return Object.fromEntries(
    componentIds.map((id) => [id, { ...previous[id], visible: false }]),
  ) as Record<SelectionId, ComponentState>;
}

export function initialLabState(): LabState {
  return {
    step: "complete",
    selectedComponent: null,
    components: defaultComponentState(),
    explode: 0,
    radialExplode: 0,
    sectionPlane: 1,
    sectionEnabled: false,
    cutawayMode: "closed",
    b0Visible: false,
    fieldMode: "both",
    reducedMotion: false,
    windingsVisited: false,
    challengeComplete: false,
  };
}
