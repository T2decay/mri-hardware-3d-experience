export type LayerId =
  | "bore-liner"
  | "rf-body-coil"
  | "rf-screen"
  | "gradient-assembly"
  | "cryostat-inner"
  | "main-magnet"
  | "active-shield"
  | "housing";

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
  order: number;
  shortName: string;
  name: string;
  color: string;
  radialRange: string;
  summary: string;
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
    order: 2,
    shortName: "RF body coil",
    name: "Integrated RF body coil",
    color: "#667f8a",
    radialRange: "bore outward 02",
    summary: "The integrated RF coil belongs to the RF system; it does not generate the static magnetic field.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 337–343.",
  },
  {
    id: "rf-screen",
    order: 3,
    shortName: "RF screen",
    name: "RF screen",
    color: "#765b86",
    radialRange: "bore outward 03",
    summary: "This conductive layer supports RF control locally and remains conceptually separate from magnetic shielding.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 337–343.",
  },
  {
    id: "gradient-assembly",
    order: 4,
    shortName: "Gradients",
    name: "Gradient coil assembly",
    color: "#315a8c",
    radialRange: "bore outward 04",
    summary: "Three gradient-coil sets produce controlled spatial variation for encoding; they do not create B₀.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 330–337.",
  },
  {
    id: "cryostat-inner",
    order: 5,
    shortName: "Cryostat",
    name: "Cryostat and thermal structure",
    color: "#4d8d91",
    radialRange: "bore outward 05",
    summary: "The cryostat supports the cold environment required by the superconducting magnet; it does not create B₀.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 318–326.",
  },
  {
    id: "main-magnet",
    order: 6,
    shortName: "Main windings",
    name: "Main superconducting winding packs",
    color: "#b85b21",
    radialRange: "bore outward 06",
    summary: "Current persists in the superconducting windings, generating the main static magnetic field B₀.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 318–326.",
  },
  {
    id: "active-shield",
    order: 7,
    shortName: "Shield coils",
    name: "Active magnetic shielding coils",
    color: "#987226",
    radialRange: "bore outward 07",
    summary: "Active shielding coils help manage the spatial extent of the fringe field; they are not RF shielding.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 326–328.",
  },
  {
    id: "housing",
    order: 8,
    shortName: "Outer vessel",
    name: "Outer cryostat vessel and covers",
    color: "#747b80",
    radialRange: "outermost",
    summary: "The outer vessel encloses and supports the magnet system while leaving the patient bore open.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 311–312 and pp. 318–326.",
  },
];

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
