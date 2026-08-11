export type LayerId =
  | "bore-liner"
  | "rf-body-coil"
  | "gradient-assembly"
  | "cryostat-inner"
  | "main-magnet"
  | "active-shield"
  | "housing"
  | "scanner-cladding";

export type ServiceId = "quench-vent" | "cryogenic-chiller";
export type SelectionId = LayerId | ServiceId;
export type CutawayMode = "closed" | "window-90" | "reveal-270";

export type StepId =
  | "complete"
  | "cutaway"
  | "windings"
  | "field"
  | "geometry"
  | "reassembled";

export type FieldMode = "both" | "inside" | "return";

export interface LayerDefinition {
  id: LayerId;
  kind: "layer";
  order: number;
  shortName: string;
  name: string;
  color: string;
  radialRange: string;
  summary: string;
  source: string;
}

export interface ServiceDefinition {
  id: ServiceId;
  kind: "service";
  shortName: string;
  name: string;
  color: string;
  summary: string;
  safetyNote: string;
  misconception: string;
  source: string;
}

export interface GuidedStep {
  id: StepId;
  shortLabel: string;
  title: string;
  instruction: string;
}

export const layers: LayerDefinition[] = [
  {
    id: "bore-liner",
    kind: "layer",
    order: 1,
    shortName: "Bore",
    name: "Patient bore and liner",
    color: "#9da8ae",
    radialRange: "innermost",
    summary: "The central opening provides the patient-facing passage through the magnet assembly.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 311–312; conceptual radial placement after Fig. 9.1.",
  },
  {
    id: "rf-body-coil",
    kind: "layer",
    order: 2,
    shortName: "RF body coil",
    name: "Integrated RF body coil",
    color: "#667f8a",
    radialRange: "bore outward 02",
    summary: "The integrated RF coil belongs to the RF system; it does not generate the static magnetic field.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 337–343.",
  },
  {
    id: "gradient-assembly",
    kind: "layer",
    order: 3,
    shortName: "Gradients",
    name: "Gradient coil assembly",
    color: "#315a8c",
    radialRange: "bore outward 03",
    summary: "Three gradient-coil sets produce controlled spatial variation for encoding; they do not create B₀.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 330–337.",
  },
  {
    id: "cryostat-inner",
    kind: "layer",
    order: 4,
    shortName: "Cryostat",
    name: "Cryostat and thermal structure",
    color: "#4d8d91",
    radialRange: "bore outward 04",
    summary: "The cryostat supports the cold environment required by the superconducting magnet; it does not create B₀.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 318–326.",
  },
  {
    id: "main-magnet",
    kind: "layer",
    order: 5,
    shortName: "Main windings",
    name: "Main superconducting winding packs",
    color: "#b85b21",
    radialRange: "bore outward 05",
    summary: "Current persists in the superconducting windings, generating the main static magnetic field B₀.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 318–326.",
  },
  {
    id: "active-shield",
    kind: "layer",
    order: 6,
    shortName: "Shield coils",
    name: "Active magnetic shielding coils",
    color: "#987226",
    radialRange: "bore outward 06",
    summary: "Active shielding coils help manage the spatial extent of the fringe field; they are not RF shielding.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 326–328.",
  },
  {
    id: "housing",
    kind: "layer",
    order: 7,
    shortName: "Outer vessel",
    name: "Outer steel cryostat vessel",
    color: "#747b80",
    radialRange: "bore outward 07",
    summary: "The sealed steel vessel forms the outside of the cryostat and surrounds an evacuated space that reduces heat transfer.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 320–321; Figure 9.8.",
  },
  {
    id: "scanner-cladding",
    kind: "layer",
    order: 8,
    shortName: "Scanner cladding",
    name: "Patient-facing scanner cladding",
    color: "#d8d7d1",
    radialRange: "outermost patient-facing cover",
    summary: "The molded exterior, 12 o'clock display, and paired operator panels give the scanner its familiar clinical appearance while covering the engineering structure; the cladding does not create B₀ or maintain superconductivity.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 311–317; original vendor-neutral educational geometry.",
  },
];

export const serviceComponents: ServiceDefinition[] = [
  {
    id: "quench-vent",
    kind: "service",
    shortName: "Quench pipe",
    name: "Cryogen exhaust vent / quench pipe",
    color: "#aeb5b8",
    summary: "The vent provides a designed exhaust path from the cryostat. During a quench, rapidly expanding helium gas is directed toward the building vent route rather than intentionally released into the scan room.",
    safetyNote: "This is a safety-system overview, not an emergency-response procedure. Cryogen hazards and emergency actions belong to the dedicated MRI safety lesson.",
    misconception: "The quench pipe does not cool the magnet and does not switch B₀ on or off.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 320–321; Figure 9.8 labels the wide-bore cryogen vent.",
  },
  {
    id: "cryogenic-chiller",
    kind: "service",
    shortName: "Cold head",
    name: "Cryogenic chiller / cold-head assembly",
    color: "#858e92",
    summary: "The refrigeration assembly removes incoming heat from the cryostat structure. In modern systems, cryogenic refrigeration can also reduce helium loss through recondensing or recycling.",
    safetyNote: "Its role is thermal management: it helps preserve the cold environment required for superconductivity.",
    misconception: "The cold head does not generate B₀; current in the superconducting windings does.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 320–321; Figure 9.8 labels the chiller.",
  },
];

export const selectableDefinitions = [...layers, ...serviceComponents];

export const cutawayModes: Record<CutawayMode, { label: string; detail: string }> = {
  closed: {
    label: "Closed",
    detail: "All 360° of each shell are retained.",
  },
  "window-90": {
    label: "90° removed",
    detail: "A quarter-window is removed, leaving approximately 270° of each shell. This matches the original teaching cutaway.",
  },
  "reveal-270": {
    label: "270° removed",
    detail: "Three quarters of each shell are removed, leaving a 90° structural sector for a more open internal view.",
  },
};

export const steps: GuidedStep[] = [
  {
    id: "complete",
    shortLabel: "Complete",
    title: "Orient to the complete magnet",
    instruction: "Rotate the assembled magnet and locate the bore before revealing its internal construction.",
  },
  {
    id: "cutaway",
    shortLabel: "Cutaway",
    title: "Reveal the concentric construction",
    instruction: "A longitudinal cutaway exposes the nested systems while preserving their bore-outward order.",
  },
  {
    id: "windings",
    shortLabel: "Windings",
    title: "Isolate the main windings",
    instruction: "Ghost the surrounding hardware and make the copper superconducting winding packs dominant.",
  },
  {
    id: "field",
    shortLabel: "Create B₀",
    title: "Connect winding current to B₀",
    instruction: "A bounded current cue appears in the winding packs as the qualitative static field is introduced.",
  },
  {
    id: "geometry",
    shortLabel: "Field geometry",
    title: "Compare the central and returning field",
    instruction: "Compare the comparatively uniform field through the bore with the qualitative returning field outside it.",
  },
  {
    id: "reassembled",
    shortLabel: "Reassemble",
    title: "Return to the complete magnet",
    instruction: "Reassemble the hardware while retaining the causal link: current in the windings generates B₀.",
  },
];

export const fieldModes: Record<FieldMode, { label: string; detail: string }> = {
  both: {
    label: "Compare both",
    detail: "The central and returning cues are parts of one qualitative B₀ visualization.",
  },
  inside: {
    label: "Inside bore",
    detail: "Near isocenter, the useful static field is shown aligned with the bore axis and comparatively uniform.",
  },
  return: {
    label: "Returning field",
    detail: "Outside the useful imaging volume, the field curves around the magnet; this is not a measured field map.",
  },
};

export const experienceCopy = {
  eyebrow: "MRI HARDWARE · CHAPTER 9",
  title: "Superconducting Magnet Lab",
  objective: "Connect current in superconducting windings to B₀ and the usable static field through the central bore.",
  modelCaption: "Conceptual educational model · vendor-neutral · not to scale · layer thicknesses and winding counts are illustrative",
  fieldCaption: "B₀ geometry is qualitative and is not a calculated field or fringe-field map.",
  challenge: "Reveal the component that generates B₀, then turn on the field visualization.",
  challengeComplete: "Correct. Current in the main superconducting windings generates B₀; the cryostat maintains the cold environment.",
  loading: "Preparing the layered magnet model…",
  fallback: "Three-dimensional rendering is unavailable. The layer list and explanations below preserve the instructional content.",
};
