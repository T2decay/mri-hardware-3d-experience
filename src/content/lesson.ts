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

export interface ChallengeBuildStep {
  id: LayerId;
  success: string;
  hint: string;
  source: string;
}

export interface ChallengeChoice {
  id: string;
  label: string;
}

export interface ChallengeQuestion {
  id: string;
  prompt: string;
  choices: ChallengeChoice[];
  correctChoiceId: string;
  correctFeedback: string;
  retryFeedback: string;
  source: string;
}

export type RelationshipPathwayId =
  | "create-b0"
  | "support-superconductivity"
  | "spatial-encoding"
  | "manage-fringe-field"
  | "transmit-receive";

export interface RelationshipView {
  guidedStep: StepId;
  selectedComponent: SelectionId;
  focusComponents: SelectionId[];
  cutawayMode: CutawayMode;
  b0Visible: boolean;
  fieldMode: FieldMode;
}

export interface RelationshipStep {
  id: string;
  label: string;
  title: string;
  explanation: string;
  source: string;
  view: RelationshipView;
}

export interface RelationshipScenario {
  prompt: string;
  choices: ChallengeChoice[];
  correctChoiceId: string;
  correctFeedback: string;
  retryFeedback: string;
  source: string;
}

export interface RelationshipPathway {
  id: RelationshipPathwayId;
  shortLabel: string;
  title: string;
  summary: string;
  accent: string;
  steps: RelationshipStep[];
  scenario: RelationshipScenario;
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
    source: "MRI in Practice, 5e, Ch. 9, pp. 337–339.",
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
    source: "MRI in Practice, 5e, Ch. 9, pp. 330–336.",
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
    source: "MRI in Practice, 5e, Ch. 9, pp. 320–322; Figure 9.8.",
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
    source: "MRI in Practice, 5e, Ch. 9, pp. 318–325.",
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
    source: "MRI in Practice, 5e, Ch. 9, pp. 321, 323, 326–327.",
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
    source: "Original vendor-neutral educational geometry; the engineering functions beneath it are sourced to Chapter 9.",
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

export const challengeBuildSteps: ChallengeBuildStep[] = [
  {
    id: "bore-liner",
    success: "Start at the patient-facing opening: the bore establishes the center of this lesson model.",
    hint: "Begin with the central opening through the magnet assembly.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 311–312.",
  },
  {
    id: "rf-body-coil",
    success: "The integrated body/transceiver coil sits immediately around the inner circumference of the magnet bore.",
    hint: "Look for the RF component described as integrated into the scanner around the bore.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 337–339.",
  },
  {
    id: "gradient-assembly",
    success: "The gradient assembly is next in this conceptual bore-outward model and produces controlled spatial variation for encoding.",
    hint: "Choose the three-coil system used to vary the magnetic field along x, y, and z.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 330–336.",
  },
  {
    id: "cryostat-inner",
    success: "The cryostat and thermal structure help maintain the cold environment required by the superconducting magnet.",
    hint: "Choose the insulated cryogenic structure, not the windings that create B₀.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 320–322; Figure 9.8.",
  },
  {
    id: "main-magnet",
    success: "The main superconducting windings carry persistent current and generate B₀.",
    hint: "Choose the component in which persistent current produces the main static magnetic field.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 318–325.",
  },
  {
    id: "active-shield",
    success: "The active shield, or bucking coils, opposes the main windings outside the imaging region to constrain the fringe field.",
    hint: "Choose the magnetic coils used to manage fringe field—not the RF shield around the scan room.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 321, 323, 326–327.",
  },
  {
    id: "housing",
    success: "The outer steel cryostat vessel encloses the evacuated thermal space shown in the text's cryostat diagram.",
    hint: "Choose the sealed outer vessel of the cryostat.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 320–321; Figure 9.8.",
  },
  {
    id: "scanner-cladding",
    success: "The patient-facing cladding completes this vendor-neutral lesson model. It covers the engineering structure but does not create B₀ or maintain superconductivity.",
    hint: "Finish with the familiar patient-facing exterior. This is a model interface layer, not a magnet-system function named in the text.",
    source: "Original vendor-neutral educational geometry; engineering functions are sourced separately to Chapter 9.",
  },
];

export const challengeTrayOrder: LayerId[] = [
  "main-magnet",
  "scanner-cladding",
  "rf-body-coil",
  "active-shield",
  "bore-liner",
  "housing",
  "gradient-assembly",
  "cryostat-inner",
];

export const challengeQuestions: ChallengeQuestion[] = [
  {
    id: "b0-source",
    prompt: "Which component directly generates the main static magnetic field B₀?",
    choices: [
      { id: "cryostat", label: "Cryostat" },
      { id: "windings", label: "Main superconducting windings" },
      { id: "gradients", label: "Gradient coils" },
    ],
    correctChoiceId: "windings",
    correctFeedback: "Correct. Persistent current in the main superconducting windings generates B₀.",
    retryFeedback: "Not quite. Separate the structure that keeps the magnet cold and the coils that vary the field from the windings that create B₀.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 318–325.",
  },
  {
    id: "cryostat-role",
    prompt: "What is the cryostat's central role in a superconducting magnet system?",
    choices: [
      { id: "encode", label: "Create spatial encoding gradients" },
      { id: "cold", label: "Maintain the insulated cold environment" },
      { id: "transmit", label: "Transmit the B₁ field" },
    ],
    correctChoiceId: "cold",
    correctFeedback: "Correct. The cryostat and its thermal structure maintain the low-temperature environment needed for superconductivity.",
    retryFeedback: "Try again. The cryostat is the insulated cryogenic vessel; field encoding and RF transmission belong to other systems.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 320–322; Figure 9.8.",
  },
  {
    id: "gradient-role",
    prompt: "Which system produces controlled spatial variations used for encoding?",
    choices: [
      { id: "gradients", label: "Gradient coil system" },
      { id: "shield", label: "Active magnetic shielding" },
      { id: "body", label: "Integrated body coil" },
    ],
    correctChoiceId: "gradients",
    correctFeedback: "Correct. The x-, y-, and z-gradient coils create controlled linear changes in the magnetic field for spatial encoding.",
    retryFeedback: "Try again. Look for the three-coil system associated with the x, y, and z axes.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 330–336.",
  },
  {
    id: "active-shield-role",
    prompt: "What do the active shielding, or bucking, coils do?",
    choices: [
      { id: "fringe", label: "Oppose the main windings to constrain fringe field" },
      { id: "rf", label: "Keep outside radiofrequency signals out of the scan room" },
      { id: "cool", label: "Recondense helium inside the cryostat" },
    ],
    correctChoiceId: "fringe",
    correctFeedback: "Correct. Bucking coils oppose the main windings outside the imaging region and reduce the spatial extent of the fringe field.",
    retryFeedback: "Try again. Active magnetic shielding manages the static fringe field; it is distinct from room RF shielding and cryogenic refrigeration.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 326–327.",
  },
  {
    id: "rf-shielding",
    prompt: "Where does the text place the scanner's RF shielding?",
    choices: [
      { id: "radial", label: "As a radial layer inside the magnet" },
      { id: "room", label: "Around the scan room as a Faraday cage" },
      { id: "windings", label: "Inside the main superconducting windings" },
    ],
    correctChoiceId: "room",
    correctFeedback: "Correct. The text describes the scan room enclosure as a Faraday cage; it is not one of the magnet's radial hardware layers.",
    retryFeedback: "Try again. Distinguish magnetic shielding coils in the magnet from the conductive RF enclosure around the scan room.",
    source: "MRI in Practice, 5e, Ch. 9, pp. 337–338.",
  },
];

export const relationshipPathways: RelationshipPathway[] = [
  {
    id: "create-b0",
    shortLabel: "Create B₀",
    title: "From superconducting current to the static field",
    summary: "Follow the causal chain from cold superconducting conductor to persistent current and B₀.",
    accent: "#b85b21",
    steps: [
      {
        id: "superconducting-wire",
        label: "01 · CONDUCTOR",
        title: "The winding wire becomes superconducting at very low temperature.",
        explanation: "The text describes niobium-titanium magnet wire cooled below its critical temperature so it can carry current without electrical resistance.",
        source: "MRI in Practice, 5e, Ch. 9, pp. 322–324.",
        view: {
          guidedStep: "windings",
          selectedComponent: "main-magnet",
          focusComponents: ["main-magnet", "cryostat-inner"],
          cutawayMode: "window-90",
          b0Visible: false,
          fieldMode: "both",
        },
      },
      {
        id: "persistent-current",
        label: "02 · CURRENT",
        title: "After ramping, current persists in the closed superconducting circuit.",
        explanation: "Closing the persistent switch completes the superconducting circuit, allowing current to continue without a connected power supply.",
        source: "MRI in Practice, 5e, Ch. 9, pp. 323–324; Figure 9.10.",
        view: {
          guidedStep: "field",
          selectedComponent: "main-magnet",
          focusComponents: ["main-magnet"],
          cutawayMode: "window-90",
          b0Visible: true,
          fieldMode: "inside",
        },
      },
      {
        id: "static-field",
        label: "03 · FIELD",
        title: "Current in the main windings generates B₀ through the bore.",
        explanation: "The main magnetic field is the static field used by the scanner. The field geometry shown here remains a qualitative teaching cue, not a measured map.",
        source: "MRI in Practice, 5e, Ch. 9, pp. 318–325.",
        view: {
          guidedStep: "geometry",
          selectedComponent: "main-magnet",
          focusComponents: ["main-magnet", "bore-liner"],
          cutawayMode: "window-90",
          b0Visible: true,
          fieldMode: "inside",
        },
      },
    ],
    scenario: {
      prompt: "A student says the cryostat creates B₀ because it surrounds the magnet. Which correction is best supported by the text?",
      choices: [
        { id: "cryostat-source", label: "The cryostat creates B₀ when filled with helium." },
        { id: "windings-source", label: "The cryostat maintains the cold environment; current in the superconducting windings creates B₀." },
        { id: "gradient-source", label: "The gradient coils create B₀ and the cryostat stabilizes it." },
      ],
      correctChoiceId: "windings-source",
      correctFeedback: "Correct. Separate thermal support from field generation: the cryostat maintains the cold environment, while current in the main windings generates B₀.",
      retryFeedback: "Try again. Identify which structure maintains temperature and which conductor carries the field-producing current.",
      source: "MRI in Practice, 5e, Ch. 9, pp. 318–325.",
    },
  },
  {
    id: "support-superconductivity",
    shortLabel: "Keep it cold",
    title: "Thermal support and the cryogenic service path",
    summary: "Separate the cryostat, refrigeration assembly, and cryogen exhaust route by function.",
    accent: "#4d8d91",
    steps: [
      {
        id: "cryostat",
        label: "01 · INSULATE",
        title: "The cryostat maintains an insulated, low-temperature environment.",
        explanation: "The text describes a steel outer vessel, evacuated spaces, heat shields, and a helium chamber around the superconducting magnet.",
        source: "MRI in Practice, 5e, Ch. 9, pp. 320–322; Figure 9.8.",
        view: {
          guidedStep: "cutaway",
          selectedComponent: "cryostat-inner",
          focusComponents: ["cryostat-inner", "housing", "main-magnet"],
          cutawayMode: "window-90",
          b0Visible: false,
          fieldMode: "both",
        },
      },
      {
        id: "cold-head",
        label: "02 · REMOVE HEAT",
        title: "The cryogenic chiller removes incoming heat.",
        explanation: "Modern cryogenic refrigeration helps preserve the cold environment and can reduce helium loss through recondensing or recycling.",
        source: "MRI in Practice, 5e, Ch. 9, pp. 320–321; Figure 9.8.",
        view: {
          guidedStep: "cutaway",
          selectedComponent: "cryogenic-chiller",
          focusComponents: ["cryogenic-chiller", "cryostat-inner"],
          cutawayMode: "window-90",
          b0Visible: false,
          fieldMode: "both",
        },
      },
      {
        id: "quench-vent",
        label: "03 · VENT",
        title: "The quench pipe provides the designed cryogen exhaust route.",
        explanation: "Figure 9.8 identifies a wide-bore cryogen vent. This lesson identifies its system role only; emergency response belongs in the dedicated safety lesson.",
        source: "MRI in Practice, 5e, Ch. 9, pp. 320–321; Figure 9.8.",
        view: {
          guidedStep: "cutaway",
          selectedComponent: "quench-vent",
          focusComponents: ["quench-vent", "cryostat-inner"],
          cutawayMode: "window-90",
          b0Visible: false,
          fieldMode: "both",
        },
      },
    ],
    scenario: {
      prompt: "Which statement correctly distinguishes the cold head from the quench pipe?",
      choices: [
        { id: "roles", label: "The cold head removes heat; the quench pipe provides a cryogen exhaust route." },
        { id: "swap", label: "The cold head vents helium; the quench pipe generates refrigeration." },
        { id: "field", label: "Both components generate the static magnetic field." },
      ],
      correctChoiceId: "roles",
      correctFeedback: "Correct. The chiller supports thermal management, while the vent is the designed cryogen exhaust path.",
      retryFeedback: "Try again. One component removes incoming heat; the other provides an exhaust route.",
      source: "MRI in Practice, 5e, Ch. 9, pp. 320–321; Figure 9.8.",
    },
  },
  {
    id: "spatial-encoding",
    shortLabel: "Encode position",
    title: "From gradient current to spatial encoding",
    summary: "Connect the three gradient axes to controlled field variation and spatial information.",
    accent: "#315a8c",
    steps: [
      {
        id: "three-axes",
        label: "01 · COIL SETS",
        title: "Three gradient coil sets correspond to the x, y, and z axes.",
        explanation: "Each gradient coil set is designed to produce a controlled change in magnetic field strength along one spatial axis.",
        source: "MRI in Practice, 5e, Ch. 9, pp. 330–333.",
        view: {
          guidedStep: "cutaway",
          selectedComponent: "gradient-assembly",
          focusComponents: ["gradient-assembly", "bore-liner"],
          cutawayMode: "reveal-270",
          b0Visible: false,
          fieldMode: "both",
        },
      },
      {
        id: "gradient-current",
        label: "02 · AMPLIFY",
        title: "Gradient amplifiers rapidly supply controlled current to the coils.",
        explanation: "The gradient system changes current amplitude and direction to create the required gradient strength and polarity.",
        source: "MRI in Practice, 5e, Ch. 9, pp. 332–336.",
        view: {
          guidedStep: "cutaway",
          selectedComponent: "gradient-assembly",
          focusComponents: ["gradient-assembly"],
          cutawayMode: "reveal-270",
          b0Visible: false,
          fieldMode: "both",
        },
      },
      {
        id: "encode-location",
        label: "03 · ENCODE",
        title: "The resulting field variations provide spatial encoding.",
        explanation: "The gradients create linear slopes superimposed on B₀ so signal location can be encoded along the selected axes.",
        source: "MRI in Practice, 5e, Ch. 9, pp. 330–336.",
        view: {
          guidedStep: "cutaway",
          selectedComponent: "gradient-assembly",
          focusComponents: ["gradient-assembly", "bore-liner"],
          cutawayMode: "window-90",
          b0Visible: true,
          fieldMode: "inside",
        },
      },
    ],
    scenario: {
      prompt: "Which hardware changes the magnetic field in controlled x, y, and z directions for spatial encoding?",
      choices: [
        { id: "body", label: "Integrated RF body coil" },
        { id: "gradient", label: "Gradient coil system" },
        { id: "bucking", label: "Active shielding coils" },
      ],
      correctChoiceId: "gradient",
      correctFeedback: "Correct. The gradient coil system produces controlled spatial field variations along the three axes.",
      retryFeedback: "Try again. Look for the system described with x, y, and z coil sets.",
      source: "MRI in Practice, 5e, Ch. 9, pp. 330–336.",
    },
  },
  {
    id: "manage-fringe-field",
    shortLabel: "Manage fringe field",
    title: "From the main field to active magnetic shielding",
    summary: "See why the useful B₀ field and its external return path require a separate shielding concept.",
    accent: "#987226",
    steps: [
      {
        id: "main-field",
        label: "01 · MAIN FIELD",
        title: "The magnet's field extends beyond the useful imaging region.",
        explanation: "The field outside the magnet is the fringe field. The visualization is qualitative and does not define a site-specific field boundary.",
        source: "MRI in Practice, 5e, Ch. 9, pp. 318–319, 325–327.",
        view: {
          guidedStep: "geometry",
          selectedComponent: "main-magnet",
          focusComponents: ["main-magnet", "bore-liner"],
          cutawayMode: "window-90",
          b0Visible: true,
          fieldMode: "both",
        },
      },
      {
        id: "bucking-coils",
        label: "02 · OPPOSE",
        title: "Bucking coils carry current in opposition to the main windings.",
        explanation: "The active shielding coils produce an opposing magnetic field outside the imaging region.",
        source: "MRI in Practice, 5e, Ch. 9, pp. 321, 323, 326–327.",
        view: {
          guidedStep: "geometry",
          selectedComponent: "active-shield",
          focusComponents: ["active-shield", "main-magnet"],
          cutawayMode: "reveal-270",
          b0Visible: true,
          fieldMode: "return",
        },
      },
      {
        id: "constrain-fringe",
        label: "03 · CONSTRAIN",
        title: "Opposing fields reduce the spatial extent of the fringe field.",
        explanation: "This is active magnetic shielding. It is distinct from the scan room's RF shield, which blocks radiofrequency interference.",
        source: "MRI in Practice, 5e, Ch. 9, pp. 326–327, 337–338.",
        view: {
          guidedStep: "geometry",
          selectedComponent: "active-shield",
          focusComponents: ["active-shield", "main-magnet"],
          cutawayMode: "window-90",
          b0Visible: true,
          fieldMode: "return",
        },
      },
    ],
    scenario: {
      prompt: "A student calls the room's Faraday cage the scanner's active magnetic shield. What is the correction?",
      choices: [
        { id: "same", label: "They are two names for the same shielding layer." },
        { id: "distinct", label: "Bucking coils manage static fringe field; the room enclosure blocks RF interference." },
        { id: "reverse", label: "The room contains B₀; bucking coils block incoming RF." },
      ],
      correctChoiceId: "distinct",
      correctFeedback: "Correct. Active magnetic shielding and room RF shielding solve different problems and are not interchangeable.",
      retryFeedback: "Try again. Separate management of the static fringe field from exclusion of outside RF interference.",
      source: "MRI in Practice, 5e, Ch. 9, pp. 326–327, 337–338.",
    },
  },
  {
    id: "transmit-receive",
    shortLabel: "Transmit & receive",
    title: "The integrated RF coil inside the room RF shield",
    summary: "Place B₁ transmission, MR signal reception, and the Faraday cage in their correct system context.",
    accent: "#667f8a",
    steps: [
      {
        id: "rf-transmit",
        label: "01 · TRANSMIT",
        title: "The integrated body coil transmits the B₁ radiofrequency field.",
        explanation: "The RF transmit system transfers energy to hydrogen nuclei at the required frequency.",
        source: "MRI in Practice, 5e, Ch. 9, pp. 337–339.",
        view: {
          guidedStep: "cutaway",
          selectedComponent: "rf-body-coil",
          focusComponents: ["rf-body-coil", "bore-liner"],
          cutawayMode: "reveal-270",
          b0Visible: false,
          fieldMode: "both",
        },
      },
      {
        id: "rf-receive",
        label: "02 · RECEIVE",
        title: "As a transceiver, the integrated body coil can also receive MR signal.",
        explanation: "The text identifies the body coil in a closed-bore system as an integrated transceiver coil.",
        source: "MRI in Practice, 5e, Ch. 9, pp. 337–339.",
        view: {
          guidedStep: "cutaway",
          selectedComponent: "rf-body-coil",
          focusComponents: ["rf-body-coil"],
          cutawayMode: "window-90",
          b0Visible: false,
          fieldMode: "both",
        },
      },
      {
        id: "faraday-cage",
        label: "03 · PROTECT",
        title: "The scan room enclosure forms the RF shield, or Faraday cage.",
        explanation: "This conductive room boundary reduces outside radiofrequency interference. It is environmental infrastructure, not a radial magnet layer.",
        source: "MRI in Practice, 5e, Ch. 9, pp. 337–338.",
        view: {
          guidedStep: "complete",
          selectedComponent: "rf-body-coil",
          focusComponents: ["rf-body-coil", "scanner-cladding"],
          cutawayMode: "closed",
          b0Visible: false,
          fieldMode: "both",
        },
      },
    ],
    scenario: {
      prompt: "Where should a student place the Faraday cage in a system diagram?",
      choices: [
        { id: "magnet-layer", label: "Between the gradient coils and cryostat" },
        { id: "room-boundary", label: "Around the scan room, outside the scanner hardware" },
        { id: "coil-winding", label: "Inside the superconducting winding packs" },
      ],
      correctChoiceId: "room-boundary",
      correctFeedback: "Correct. The Faraday cage is the RF-shielded room enclosure, not a radial layer inside the magnet.",
      retryFeedback: "Try again. The text describes the entire scan room as the shielded enclosure.",
      source: "MRI in Practice, 5e, Ch. 9, pp. 337–338.",
    },
  },
];

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
