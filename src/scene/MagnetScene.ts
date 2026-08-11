import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type {
  CutawayMode,
  FieldMode,
  LayerId,
  SelectionId,
  StepId,
} from "../content/lesson.ts";
import type { ComponentState } from "../labState.ts";

export interface MagnetSceneState {
  step: StepId;
  components: Record<SelectionId, ComponentState>;
  selectedComponent: SelectionId | null;
  explode: number;
  radialExplode: number;
  cutawayMode: CutawayMode;
  sectionEnabled: boolean;
  sectionPlane: number;
  b0Visible: boolean;
  fieldMode: FieldMode;
  reducedMotion: boolean;
}

export interface LabelPosition {
  id: string;
  x: number;
  y: number;
  visible: boolean;
}

export interface MagnetSceneCallbacks {
  onSelect: (id: SelectionId) => void;
  onHover: (id: SelectionId | null, x: number, y: number) => void;
  onLabels: (positions: LabelPosition[]) => void;
}

interface SceneMaterial extends THREE.MeshPhysicalMaterial {
  userData: {
    baseOpacity?: number;
    baseEmissive?: number;
    selectionId?: SelectionId;
  };
}

interface ComponentVisual {
  id: SelectionId;
  kind: "layer" | "service";
  order: number;
  group: THREE.Group;
  materials: SceneMaterial[];
}

interface CutawayVariants {
  closed: THREE.Group;
  window90: THREE.Group;
  reveal270: THREE.Group;
}

const MODEL_LENGTH = 10.8;
const FRONT_Z = MODEL_LENGTH / 2;
const BACK_Z = -MODEL_LENGTH / 2;
const CUT_START = 0.5;
const WINDOW_START = THREE.MathUtils.degToRad(112);
const WINDOW_END = WINDOW_START + THREE.MathUtils.degToRad(270);
const REVEAL_START = THREE.MathUtils.degToRad(135);
const REVEAL_END = REVEAL_START + THREE.MathUtils.degToRad(90);
const COPPER = 0xc86324;
const FIELD = 0x25aebe;

const radial: Record<LayerId, [number, number]> = {
  "bore-liner": [2.0, 2.25],
  "rf-body-coil": [2.34, 2.58],
  "gradient-assembly": [2.68, 3.38],
  "cryostat-inner": [3.49, 3.82],
  "main-magnet": [3.92, 4.42],
  "active-shield": [4.66, 4.94],
  housing: [5.21, 5.57],
  "scanner-cladding": [5.71, 6.27],
};

const cameraPresets: Record<StepId, { position: THREE.Vector3; target: THREE.Vector3 }> = {
  complete: {
    position: new THREE.Vector3(13.5, 9.1, 21.1),
    target: new THREE.Vector3(0, 0.2, 0.2),
  },
  cutaway: {
    position: new THREE.Vector3(12.2, 8.5, 19.6),
    target: new THREE.Vector3(0, 0.1, 1.1),
  },
  windings: {
    position: new THREE.Vector3(10.6, 7.1, 17.2),
    target: new THREE.Vector3(0, 0, 0.5),
  },
  field: {
    position: new THREE.Vector3(12.7, 7.4, 21.4),
    target: new THREE.Vector3(0, 0, 0),
  },
  geometry: {
    position: new THREE.Vector3(14.3, 8.8, 24.6),
    target: new THREE.Vector3(0, 0, 0),
  },
  reassembled: {
    position: new THREE.Vector3(13.5, 9.1, 21.1),
    target: new THREE.Vector3(0, 0.2, 0.2),
  },
};

export class MagnetScene {
  readonly failed: boolean;

  private readonly canvas: HTMLCanvasElement;
  private readonly callbacks: MagnetSceneCallbacks;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private root = new THREE.Group();
  private components = new Map<SelectionId, ComponentVisual>();
  private cutawayVariants = new Map<LayerId, CutawayVariants>();
  private pickables: THREE.Object3D[] = [];
  private centralField = new THREE.Group();
  private returnField = new THREE.Group();
  private currentCues = new THREE.Group();
  private quenchInternal: THREE.Group | null = null;
  private clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), FRONT_Z + 1);
  private clipVisual!: THREE.Mesh;
  private pointer = new THREE.Vector2();
  private raycaster = new THREE.Raycaster();
  private disposed = false;
  private previousStep: StepId = "complete";
  private cameraAnimation = 0;
  private currentAnimation = 0;
  private latestState: MagnetSceneState | null = null;
  private labelAnchors = new Map<string, THREE.Object3D>();

  constructor(canvas: HTMLCanvasElement, callbacks: MagnetSceneCallbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    let failed = false;
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
      this.renderer.localClippingEnabled = true;
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.08;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
    } catch {
      failed = true;
    }
    this.failed = failed;
    if (failed) return;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xede9e2);
    this.scene.fog = new THREE.Fog(0xede9e2, 30, 52);

    this.camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);
    this.camera.position.copy(cameraPresets.complete.position);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.copy(cameraPresets.complete.target);
    this.controls.enableDamping = false;
    this.controls.enablePan = false;
    this.controls.minDistance = 13;
    this.controls.maxDistance = 40;
    this.controls.minPolarAngle = 0.52;
    this.controls.maxPolarAngle = 1.78;
    this.controls.minAzimuthAngle = -1.05;
    this.controls.maxAzimuthAngle = 1.05;
    this.controls.addEventListener("change", () => this.renderNow());

    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(environment, 0.04).texture;
    environment.dispose();
    pmrem.dispose();

    this.buildLighting();
    this.buildMagnet();
    this.buildField();
    this.buildSectionPlane();
    this.buildGround();
    this.scene.add(this.root, this.centralField, this.returnField, this.currentCues);
    this.attachInput();
    this.resize();
  }

  private material(
    color: number,
    options: Partial<THREE.MeshPhysicalMaterialParameters> = {},
  ): SceneMaterial {
    const material = new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.28,
      roughness: 0.38,
      clearcoat: 0.12,
      clearcoatRoughness: 0.35,
      side: THREE.DoubleSide,
      transparent: true,
      ...options,
    }) as SceneMaterial;
    material.userData.baseOpacity = material.opacity;
    material.userData.baseEmissive = material.emissive.getHex();
    return material;
  }

  private fullRingShape(rIn: number, rOut: number): THREE.Shape {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, rOut, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, rIn, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    return shape;
  }

  private sectorShape(rIn: number, rOut: number, start: number, end: number): THREE.Shape {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, rOut, start, end, false);
    shape.absarc(0, 0, rIn, end, start, true);
    shape.closePath();
    return shape;
  }

  private extrude(
    shape: THREE.Shape,
    depth: number,
    z: number,
    material: SceneMaterial,
    bevel = false,
  ): THREE.Mesh {
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      curveSegments: 120,
      bevelEnabled: bevel,
      bevelSegments: bevel ? 3 : 0,
      bevelSize: bevel ? 0.035 : 0,
      bevelThickness: bevel ? 0.035 : 0,
    });
    geometry.translate(0, 0, z);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private register(
    id: SelectionId,
    order: number,
    object: THREE.Object3D,
    materials: SceneMaterial[],
    kind: "layer" | "service" = "layer",
  ): void {
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.userData.selectionId = id;
      this.pickables.push(child);
      const material = child.material as SceneMaterial;
      material.userData.selectionId = id;
    });
    this.components.set(id, { id, kind, order, group: object as THREE.Group, materials });
  }

  private addLayerShell(
    id: LayerId,
    order: number,
    color: number,
    options: Partial<THREE.MeshPhysicalMaterialParameters> = {},
  ): THREE.Group {
    const [rIn, rOut] = radial[id];
    const group = new THREE.Group();
    const material = this.material(color, options);
    const rear = this.extrude(this.fullRingShape(rIn, rOut), CUT_START - BACK_Z, BACK_Z, material, true);
    const closed = new THREE.Group();
    const window90 = new THREE.Group();
    const reveal270 = new THREE.Group();
    closed.add(this.extrude(this.fullRingShape(rIn, rOut), FRONT_Z - CUT_START, CUT_START, material, true));
    window90.add(
      this.extrude(
        this.sectorShape(rIn, rOut, WINDOW_START, WINDOW_END),
        FRONT_Z - CUT_START,
        CUT_START,
        material,
        true,
      ),
    );
    reveal270.add(
      this.extrude(
        this.sectorShape(rIn, rOut, REVEAL_START, REVEAL_END),
        FRONT_Z - CUT_START,
        CUT_START,
        material,
        true,
      ),
    );
    window90.visible = false;
    reveal270.visible = false;
    group.add(rear, closed, window90, reveal270);
    this.root.add(group);
    this.register(id, order, group, [material]);
    this.cutawayVariants.set(id, { closed, window90, reveal270 });
    return group;
  }

  private buildLighting(): void {
    const hemisphere = new THREE.HemisphereLight(0xfffbf2, 0x55616a, 2.1);
    this.scene.add(hemisphere);

    const key = new THREE.DirectionalLight(0xfff5e9, 5.2);
    key.position.set(8, 14, 15);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -15;
    key.shadow.camera.right = 15;
    key.shadow.camera.top = 15;
    key.shadow.camera.bottom = -15;
    key.shadow.bias = -0.0002;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xbfdcf2, 2.4);
    fill.position.set(-12, 7, 5);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffd9b6, 3.4);
    rim.position.set(3, 6, -14);
    this.scene.add(rim);
  }

  private buildMagnet(): void {
    const bore = this.addLayerShell("bore-liner", 1, 0xb9c1c5, {
      metalness: 0.86,
      roughness: 0.2,
      clearcoat: 0.35,
    });
    this.addBoreNozzle(bore);

    this.addLayerShell("rf-body-coil", 2, 0x708892, {
      metalness: 0.42,
      roughness: 0.5,
    });

    const gradient = this.addLayerShell("gradient-assembly", 3, 0x285c96, {
      metalness: 0.18,
      roughness: 0.3,
      clearcoat: 0.6,
      clearcoatRoughness: 0.18,
    });
    this.addGradientRibs(gradient);

    const cryostat = this.addLayerShell("cryostat-inner", 4, 0x4f9695, {
      metalness: 0.36,
      roughness: 0.31,
      clearcoat: 0.34,
    });
    this.addCryostatBands(cryostat);

    this.buildMainWindings();
    this.buildShieldWindings();
    this.buildOuterHousing();
    this.buildScannerCladding();
    this.buildServiceHardware();
    this.buildSupports();
    this.buildLabelAnchors();
  }

  private addGradientRibs(_group: THREE.Group): void {
    const variants = this.cutawayVariants.get("gradient-assembly");
    if (!variants) return;
    const materials: SceneMaterial[] = [];
    for (let i = 0; i < 7; i += 1) {
      const z = CUT_START + 0.42 + i * 0.62;
      const material = this.material(0x4578ad, {
        metalness: 0.2,
        roughness: 0.26,
        clearcoat: 0.7,
      });
      const variantMeshes = [
        {
          parent: variants.closed,
          mesh: new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.045, 8, 96), material),
          rotation: 0,
        },
        {
          parent: variants.window90,
          mesh: new THREE.Mesh(
            new THREE.TorusGeometry(3.5, 0.045, 8, 96, WINDOW_END - WINDOW_START),
            material,
          ),
          rotation: WINDOW_START,
        },
        {
          parent: variants.reveal270,
          mesh: new THREE.Mesh(
            new THREE.TorusGeometry(3.5, 0.045, 8, 96, REVEAL_END - REVEAL_START),
            material,
          ),
          rotation: REVEAL_START,
        },
      ];
      variantMeshes.forEach(({ parent, mesh, rotation }) => {
        mesh.rotation.z = rotation;
        mesh.position.z = z;
        mesh.castShadow = true;
        mesh.userData.selectionId = "gradient-assembly";
        this.pickables.push(mesh);
        parent.add(mesh);
      });
      materials.push(material);
    }
    this.components.get("gradient-assembly")?.materials.push(...materials);
  }

  private addBoreNozzle(group: THREE.Group): void {
    const material = this.material(0xaeb8bd, {
      metalness: 0.9,
      roughness: 0.18,
      clearcoat: 0.38,
    });
    const nozzle = this.extrude(this.fullRingShape(1.98, 2.25), 1.55, FRONT_Z - 0.12, material, true);
    nozzle.userData.selectionId = "bore-liner";
    group.add(nozzle);
    this.pickables.push(nozzle);
    this.components.get("bore-liner")?.materials.push(material);
  }

  private addCryostatBands(_group: THREE.Group): void {
    const variants = this.cutawayVariants.get("cryostat-inner");
    if (!variants) return;
    const materials: SceneMaterial[] = [];
    const addBars = (parent: THREE.Group, start: number, end: number, count: number) => {
      for (let i = 0; i < count; i += 1) {
        const angle = start + 0.18 + i * ((end - start - 0.36) / Math.max(1, count - 1));
        const material = this.material(0xbed0c9, {
          metalness: 0.74,
          roughness: 0.32,
        });
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.32, FRONT_Z - CUT_START),
          material,
        );
        const radius = 3.91;
        bar.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          (FRONT_Z + CUT_START) / 2,
        );
        bar.rotation.z = angle;
        bar.userData.selectionId = "cryostat-inner";
        bar.castShadow = true;
        this.pickables.push(bar);
        materials.push(material);
        parent.add(bar);
      }
    };
    addBars(variants.closed, 0, Math.PI * 2, 16);
    addBars(variants.window90, WINDOW_START, WINDOW_END, 12);
    addBars(variants.reveal270, REVEAL_START, REVEAL_END, 5);
    this.components.get("cryostat-inner")?.materials.push(...materials);
  }

  private buildMainWindings(): void {
    const id: LayerId = "main-magnet";
    const group = new THREE.Group();
    const materials: SceneMaterial[] = [];
    const packCenters = [-4.35, -3.45, -1.9, 0.25, 2.25, 3.55, 4.3];
    const packWidths = [0.52, 0.6, 0.72, 0.9, 0.74, 0.56, 0.48];

    packCenters.forEach((center, packIndex) => {
      const turns = 9;
      for (let turn = 0; turn < turns; turn += 1) {
        const z = center - packWidths[packIndex] / 2 + (turn / (turns - 1)) * packWidths[packIndex];
        const material = this.material(COPPER, {
          metalness: 0.9,
          roughness: 0.23,
          clearcoat: 0.24,
          emissive: new THREE.Color(0x2b0b00),
          emissiveIntensity: 0.16,
        });
        const wire = new THREE.Mesh(new THREE.TorusGeometry(4.18, 0.07, 10, 112), material);
        wire.position.z = z;
        wire.castShadow = true;
        wire.receiveShadow = true;
        materials.push(material);
        group.add(wire);
      }
      const formerMaterial = this.material(0x555d62, {
        metalness: 0.68,
        roughness: 0.3,
      });
      const former = new THREE.Mesh(
        new THREE.TorusGeometry(4.15, 0.105, 12, 112),
        formerMaterial,
      );
      former.scale.set(1.01, 1.01, 1);
      former.position.z = center;
      former.renderOrder = -1;
      materials.push(formerMaterial);
      group.add(former);
    });

    this.root.add(group);
    this.register(id, 5, group, materials);
  }

  private buildShieldWindings(): void {
    const id: LayerId = "active-shield";
    const group = new THREE.Group();
    const materials: SceneMaterial[] = [];
    [-3.8, -2.95, 2.95, 3.8].forEach((center) => {
      for (let turn = 0; turn < 5; turn += 1) {
        const material = this.material(0x79612f, {
          metalness: 0.62,
          roughness: 0.43,
        });
        const wire = new THREE.Mesh(new THREE.TorusGeometry(4.82, 0.035, 8, 112), material);
        wire.position.z = center + (turn - 2) * 0.095;
        wire.castShadow = true;
        materials.push(material);
        group.add(wire);
      }
    });
    this.root.add(group);
    this.register(id, 6, group, materials);
  }

  private buildOuterHousing(): void {
    const id: LayerId = "housing";
    const group = new THREE.Group();
    const metal = this.material(0x8b9297, {
      metalness: 0.94,
      roughness: 0.22,
      clearcoat: 0.22,
      clearcoatRoughness: 0.18,
    });
    const dark = this.material(0x22272a, {
      metalness: 0.72,
      roughness: 0.29,
    });
    const mli = this.material(0xc8c7bd, {
      metalness: 0.88,
      roughness: 0.48,
    });

    const closed = new THREE.Group();
    const window90 = new THREE.Group();
    const reveal270 = new THREE.Group();

    const complete = this.extrude(
      this.fullRingShape(radial.housing[0], radial.housing[1]),
      MODEL_LENGTH,
      BACK_Z,
      metal,
      true,
    );
    const frontFascia = this.extrude(
      this.fullRingShape(radial["bore-liner"][1] + 0.06, radial.housing[1]),
      0.3,
      FRONT_Z - 0.05,
      metal,
      true,
    );
    closed.add(complete, frontFascia);

    const addCutaway = (parent: THREE.Group, start: number, end: number) => {
      const rear = this.extrude(
        this.fullRingShape(radial.housing[0], radial.housing[1]),
        CUT_START - BACK_Z,
        BACK_Z,
        metal,
        true,
      );
      const front = this.extrude(
        this.sectorShape(radial.housing[0], radial.housing[1], start, end),
        FRONT_Z - CUT_START,
        CUT_START,
        metal,
        true,
      );
      const insulation = this.extrude(
        this.sectorShape(5.03, 5.19, start, end),
        FRONT_Z - CUT_START - 0.18,
        CUT_START + 0.1,
        mli,
      );
      const vacuumBand = this.extrude(
        this.sectorShape(4.99, 5.04, start, end),
        FRONT_Z - CUT_START - 0.1,
        CUT_START + 0.05,
        dark,
      );
      parent.add(rear, front, insulation, vacuumBand);
    };
    addCutaway(window90, WINDOW_START, WINDOW_END);
    addCutaway(reveal270, REVEAL_START, REVEAL_END);
    window90.visible = false;
    reveal270.visible = false;

    group.add(closed, window90, reveal270);
    this.root.add(group);
    this.register(id, 7, group, [metal, dark, mli]);
    this.cutawayVariants.set(id, { closed, window90, reveal270 });
  }

  private buildScannerCladding(): void {
    const id: LayerId = "scanner-cladding";
    const group = new THREE.Group();
    const closed = new THREE.Group();
    const window90 = new THREE.Group();
    const reveal270 = new THREE.Group();
    const white = this.material(0xd9d8d2, {
      metalness: 0.04,
      roughness: 0.28,
      clearcoat: 0.72,
      clearcoatRoughness: 0.2,
    });
    const trim = this.material(0xaeb8bc, {
      metalness: 0.48,
      roughness: 0.3,
      clearcoat: 0.3,
    });
    const dark = this.material(0x30383c, {
      metalness: 0.2,
      roughness: 0.42,
    });
    const accent = this.material(0x7895a4, {
      metalness: 0.32,
      roughness: 0.34,
      clearcoat: 0.35,
    });
    const screen = this.material(0x11191d, {
      metalness: 0.18,
      roughness: 0.24,
      emissive: new THREE.Color(0x081418),
      emissiveIntensity: 0.2,
    });
    const interfaceFace = this.material(0x9fb1b9, {
      metalness: 0.18,
      roughness: 0.34,
      clearcoat: 0.32,
    });

    closed.add(
      this.extrude(this.fullRingShape(5.62, 6.28), MODEL_LENGTH + 0.35, BACK_Z - 0.18, white, true),
      this.extrude(this.fullRingShape(2.08, 6.43), 0.42, FRONT_Z - 0.05, white, true),
      this.extrude(this.fullRingShape(1.97, 2.12), 0.55, FRONT_Z + 0.22, trim, true),
    );
    const fasciaAccent = new THREE.Mesh(new THREE.TorusGeometry(5.72, 0.1, 12, 128), accent);
    fasciaAccent.position.z = FRONT_Z + 0.39;
    fasciaAccent.castShadow = true;

    const displayBezel = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.78, 0.17), trim);
    displayBezel.position.set(0, 4.48, FRONT_Z + 0.48);
    const displayFace = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.49, 0.045), screen);
    displayFace.position.set(0, 4.48, FRONT_Z + 0.59);
    closed.add(fasciaAccent, displayBezel, displayFace);

    [-1, 1].forEach((side) => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.94, 0.16), trim);
      panel.position.set(side * 4.72, 0.15, FRONT_Z + 0.48);
      const face = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.69, 0.045), interfaceFace);
      face.position.set(side * 4.72, 0.15, FRONT_Z + 0.59);
      closed.add(panel, face);
      [-0.15, 0, 0.15].forEach((xOffset) => {
        [-0.17, 0.12].forEach((yOffset) => {
          const control = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.075, 0.025), screen);
          control.position.set(
            side * 4.72 + xOffset,
            0.15 + yOffset,
            FRONT_Z + 0.625,
          );
          closed.add(control);
        });
      });
    });
    const addCutaway = (parent: THREE.Group, start: number, end: number) => {
      parent.add(
        this.extrude(this.fullRingShape(5.62, 6.28), CUT_START - BACK_Z, BACK_Z, white, true),
        this.extrude(
          this.sectorShape(5.62, 6.28, start, end),
          FRONT_Z - CUT_START + 0.18,
          CUT_START,
          white,
          true,
        ),
        this.extrude(this.sectorShape(2.08, 6.43, start, end), 0.42, FRONT_Z - 0.05, white, true),
        this.extrude(this.sectorShape(1.97, 2.12, start, end), 0.55, FRONT_Z + 0.22, trim, true),
      );
    };
    addCutaway(window90, WINDOW_START, WINDOW_END);
    addCutaway(reveal270, REVEAL_START, REVEAL_END);
    window90.visible = false;
    reveal270.visible = false;

    const baseSkirt = new THREE.Mesh(new THREE.BoxGeometry(10.8, 1.25, 9.2), white);
    baseSkirt.position.set(0, -5.78, -0.3);
    baseSkirt.castShadow = true;
    const baseShadow = new THREE.Mesh(new THREE.BoxGeometry(9.9, 0.24, 8.45), dark);
    baseShadow.position.set(0, -6.42, -0.3);
    group.add(closed, window90, reveal270, baseSkirt, baseShadow);
    this.root.add(group);
    this.register(id, 8, group, [white, trim, dark, accent, screen, interfaceFace]);
    this.cutawayVariants.set(id, { closed, window90, reveal270 });
  }

  private buildServiceHardware(): void {
    const vent = new THREE.Group();
    const ventMetal = this.material(0x9aa2a5, {
      metalness: 0.92,
      roughness: 0.22,
    });
    const ventDark = this.material(0x4c5357, {
      metalness: 0.9,
      roughness: 0.24,
    });
    const upperPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 1.8, 32), ventMetal);
    upperPipe.position.set(-1.85, 6.9, -1.1);
    upperPipe.castShadow = true;
    const lowerPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, 1.7, 32), ventMetal);
    lowerPipe.position.set(-1.85, 5.15, -1.1);
    lowerPipe.castShadow = true;
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.11, 12, 48), ventDark);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(-1.85, 7.3, -1.1);
    const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.2, 36), ventDark);
    flange.position.set(-1.85, 4.42, -1.1);
    const internal = new THREE.Group();
    internal.add(lowerPipe, flange);
    this.quenchInternal = internal;
    vent.add(upperPipe, collar, internal);
    this.root.add(vent);
    this.register("quench-vent", 10, vent, [ventMetal, ventDark], "service");

    const chiller = new THREE.Group();
    const chillerMetal = this.material(0x899296, {
      metalness: 0.9,
      roughness: 0.2,
    });
    const chillerDark = this.material(0x465055, {
      metalness: 0.82,
      roughness: 0.3,
    });
    const canister = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 2.5, 40), chillerMetal);
    canister.rotation.z = Math.PI / 2;
    canister.position.set(1.55, 5.15, -1.2);
    canister.castShadow = true;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.83, 0.83, 0.17, 40), chillerDark);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(2.83, 5.15, -1.2);
    chiller.add(canister, cap);
    [0.75, 2.35].forEach((x) => {
      const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.52, 1.25), chillerDark);
      saddle.position.set(x, 4.45, -1.2);
      chiller.add(saddle);
    });
    [0.34, 2.66].forEach((x) => {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.77, 0.055, 10, 48), chillerDark);
      band.rotation.y = Math.PI / 2;
      band.position.set(x, 5.15, -1.2);
      chiller.add(band);
    });
    this.root.add(chiller);
    this.register("cryogenic-chiller", 10, chiller, [chillerMetal, chillerDark], "service");
  }

  private buildSupports(): void {
    const housing = this.components.get("housing")?.group;
    if (!housing) return;
    const supportMaterial = this.material(0x5d6366, {
      metalness: 0.83,
      roughness: 0.27,
    });
    [-3.6, 3.25].forEach((z) => {
      [-3.75, 3.75].forEach((x) => {
        const foot = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.15, 1.6), supportMaterial);
        foot.position.set(x, -5.65, z);
        foot.castShadow = true;
        foot.userData.selectionId = "housing";
        housing.add(foot);
        this.pickables.push(foot);
      });
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.42, 8.8), supportMaterial);
    base.position.set(0, -6.27, -0.2);
    base.castShadow = true;
    base.userData.selectionId = "housing";
    housing.add(base);
    this.pickables.push(base);
    this.components.get("housing")?.materials.push(supportMaterial);
  }

  private buildLabelAnchors(): void {
    const anchors: Record<string, THREE.Vector3> = {
      "bore-liner": new THREE.Vector3(-1.1, -0.55, 6.9),
      "main-magnet": new THREE.Vector3(4.2, 0.35, 3.8),
      "cryostat-inner": new THREE.Vector3(-2.6, 2.9, 3.8),
      housing: new THREE.Vector3(4.8, 2.8, -1.2),
      "scanner-cladding": new THREE.Vector3(5.65, 2.9, 1.7),
      "quench-vent": new THREE.Vector3(-1.85, 7.5, -1.1),
      "cryogenic-chiller": new THREE.Vector3(1.75, 5.7, -1.2),
      isocenter: new THREE.Vector3(0, 0, 0),
      b0: new THREE.Vector3(0.55, 0.2, 7.8),
    };
    Object.entries(anchors).forEach(([id, position]) => {
      const anchor = new THREE.Object3D();
      anchor.position.copy(position);
      const component = this.components.get(id as SelectionId);
      (component?.group ?? this.root).add(anchor);
      this.labelAnchors.set(id, anchor);
    });
  }

  private buildField(): void {
    const centralMaterial = new THREE.MeshBasicMaterial({
      color: FIELD,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
    });
    const returnMaterial = new THREE.MeshBasicMaterial({
      color: FIELD,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    });

    const offsets = [
      [0, 0],
      [0.54, 0],
      [-0.54, 0],
      [0, 0.54],
      [0, -0.54],
    ];
    offsets.forEach(([x, y]) => {
      const curve = new THREE.LineCurve3(new THREE.Vector3(x, y, -10), new THREE.Vector3(x, y, 10));
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.035, 7, false), centralMaterial);
      this.centralField.add(tube);
      const arrow = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.46, 16),
        centralMaterial,
      );
      arrow.rotation.x = Math.PI / 2;
      arrow.position.set(x, y, 8.9);
      this.centralField.add(arrow);
    });
    const usefulVolume = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.35, 11.8, 48, 1, true),
      new THREE.MeshBasicMaterial({
        color: FIELD,
        transparent: true,
        opacity: 0.065,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    usefulVolume.rotation.x = Math.PI / 2;
    this.centralField.add(usefulVolume);

    [-1.3, -0.65, 0, 0.65, 1.3].forEach((y, index) => {
      const side = index % 2 === 0 ? 1 : -1;
      const points = [
        new THREE.Vector3(0, y, 8.6),
        new THREE.Vector3(7.8 * side, y * 1.3, 6.2),
        new THREE.Vector3(8.8 * side, y * 1.3, -5.8),
        new THREE.Vector3(0, y, -8.6),
      ];
      const curve = new THREE.CubicBezierCurve3(points[0], points[1], points[2], points[3]);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 0.025, 6, false), returnMaterial);
      this.returnField.add(tube);

      const mirror = points.map((point) => new THREE.Vector3(-point.x, point.y, point.z));
      const mirrorCurve = new THREE.CubicBezierCurve3(mirror[0], mirror[1], mirror[2], mirror[3]);
      const mirrorTube = new THREE.Mesh(
        new THREE.TubeGeometry(mirrorCurve, 90, 0.025, 6, false),
        returnMaterial,
      );
      this.returnField.add(mirrorTube);
    });

    for (let i = 0; i < 10; i += 1) {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.095, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffb166 }),
      );
      marker.userData.offset = i / 10;
      marker.visible = false;
      this.currentCues.add(marker);
    }
    this.centralField.visible = false;
    this.returnField.visible = false;
  }

  private buildSectionPlane(): void {
    const material = new THREE.MeshBasicMaterial({
      color: 0x1d7887,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.clipVisual = new THREE.Mesh(new THREE.CircleGeometry(7.0, 80), material);
    this.clipVisual.visible = false;
    this.scene.add(this.clipVisual);
  }

  private buildGround(): void {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(55, 55),
      new THREE.ShadowMaterial({ color: 0x5d6265, opacity: 0.2 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -6.5;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  update(state: MagnetSceneState): void {
    if (this.failed || this.disposed) return;
    const stepChanged = state.step !== this.previousStep;
    this.latestState = state;

    this.cutawayVariants.forEach((variants) => {
      variants.closed.visible = state.cutawayMode === "closed";
      variants.window90.visible = state.cutawayMode === "window-90";
      variants.reveal270.visible = state.cutawayMode === "reveal-270";
    });

    this.components.forEach((component, id) => {
      const componentState = state.components[id];
      const concealedByClosedCladding =
        id === "cryogenic-chiller"
        && state.components["scanner-cladding"].visible
        && state.cutawayMode === "closed";
      component.group.visible = componentState.visible && !concealedByClosedCladding;
      const explodeOffset = component.kind === "layer"
        ? (4.5 - component.order) * state.explode * 1.08
        : 0;
      component.group.position.z = explodeOffset;
      if (component.kind === "layer") {
        const [rIn, rOut] = radial[id as LayerId];
        const nominalRadius = (rIn + rOut) / 2;
        const addedRadius = (component.order - 1) * state.radialExplode * 0.44;
        const radialScale = 1 + addedRadius / nominalRadius;
        component.group.position.x = 0;
        component.group.position.y = 0;
        component.group.scale.set(radialScale, radialScale, 1);
      } else {
        component.group.position.x = 0;
        component.group.position.y = 0;
        component.group.scale.set(1, 1, 1);
      }
      component.materials.forEach((material) => {
        const selected = state.selectedComponent === id;
        material.opacity = componentState.opacity;
        material.depthWrite = componentState.opacity > 0.92;
        material.emissive.setHex(selected ? 0x183c40 : material.userData.baseEmissive ?? 0x000000);
        material.emissiveIntensity = selected ? 0.38 : id === "main-magnet" ? 0.16 : 0;
        material.needsUpdate = true;
      });
    });
    if (this.quenchInternal) {
      this.quenchInternal.visible = !(
        state.components["scanner-cladding"].visible && state.cutawayMode === "closed"
      );
    }

    const clipZ = BACK_Z - 0.2 + state.sectionPlane * (MODEL_LENGTH + 0.4);
    this.clipPlane.constant = clipZ;
    this.clipVisual.visible = state.sectionEnabled;
    this.clipVisual.position.z = clipZ;
    this.components.forEach((component) => {
      component.materials.forEach((material) => {
        material.clippingPlanes = state.sectionEnabled ? [this.clipPlane] : null;
      });
    });

    this.centralField.visible = state.b0Visible && state.fieldMode !== "return";
    this.returnField.visible = state.b0Visible && state.fieldMode !== "inside";

    if (stepChanged) {
      this.moveCamera(state.step, state.reducedMotion);
      if (state.step === "field") this.triggerCurrentCue(state.reducedMotion);
      this.previousStep = state.step;
    }
    this.renderNow();
  }

  private moveCamera(step: StepId, reducedMotion: boolean): void {
    cancelAnimationFrame(this.cameraAnimation);
    const preset = cameraPresets[step];
    if (reducedMotion) {
      this.camera.position.copy(preset.position);
      this.controls.target.copy(preset.target);
      this.controls.update();
      return;
    }
    const startPosition = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const start = performance.now();
    const duration = 680;
    const animate = (now: number) => {
      const raw = Math.min(1, (now - start) / duration);
      const t = 1 - Math.pow(1 - raw, 3);
      this.camera.position.lerpVectors(startPosition, preset.position, t);
      this.controls.target.lerpVectors(startTarget, preset.target, t);
      this.controls.update();
      this.renderNow();
      if (raw < 1 && !this.disposed) this.cameraAnimation = requestAnimationFrame(animate);
    };
    this.cameraAnimation = requestAnimationFrame(animate);
  }

  private triggerCurrentCue(reducedMotion: boolean): void {
    cancelAnimationFrame(this.currentAnimation);
    if (reducedMotion) {
      this.currentCues.children.forEach((child) => {
        child.visible = false;
      });
      return;
    }
    const start = performance.now();
    const duration = 1650;
    const animate = (now: number) => {
      const progress = (now - start) / duration;
      this.currentCues.children.forEach((child, index) => {
        const marker = child as THREE.Mesh;
        const phase = ((progress * 1.7 + Number(marker.userData.offset)) % 1) * Math.PI * 2;
        marker.position.set(Math.cos(phase) * 4.18, Math.sin(phase) * 4.18, -3.9 + index * 0.86);
        marker.visible = progress < 1;
      });
      this.renderNow();
      if (progress < 1 && !this.disposed) {
        this.currentAnimation = requestAnimationFrame(animate);
      } else {
        this.currentCues.children.forEach((child) => {
          child.visible = false;
        });
        this.renderNow();
      }
    };
    this.currentAnimation = requestAnimationFrame(animate);
  }

  private attachInput(): void {
    const pointer = (event: PointerEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    this.canvas.addEventListener("pointermove", (event) => {
      const local = pointer(event);
      const hit = this.pick();
      this.canvas.style.cursor = hit ? "pointer" : "grab";
      this.callbacks.onHover(hit, local.x, local.y);
    });
    this.canvas.addEventListener("pointerleave", () => this.callbacks.onHover(null, 0, 0));
    this.canvas.addEventListener("click", (event) => {
      pointer(event);
      const hit = this.pick();
      if (hit) this.callbacks.onSelect(hit);
    });
    this.canvas.addEventListener("keydown", (event) => {
      const rotate = 0.075;
      if (event.key === "ArrowLeft") this.controls.rotateLeft(rotate);
      else if (event.key === "ArrowRight") this.controls.rotateLeft(-rotate);
      else if (event.key === "ArrowUp") this.controls.rotateUp(rotate);
      else if (event.key === "ArrowDown") this.controls.rotateUp(-rotate);
      else if (event.key === "+" || event.key === "=") this.controls.dollyOut(1.08);
      else if (event.key === "-" || event.key === "_") this.controls.dollyIn(1.08);
      else return;
      event.preventDefault();
      this.controls.update();
    });
  }

  private pick(): SelectionId | null {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.pickables, false).find((result) => result.object.visible);
    return (hit?.object.userData.selectionId as SelectionId | undefined) ?? null;
  }

  private projectLabels(): void {
    const rect = this.canvas.getBoundingClientRect();
    const positions: LabelPosition[] = [];
    this.labelAnchors.forEach((anchor, id) => {
      const point = new THREE.Vector3();
      anchor.getWorldPosition(point);
      const projected = point.project(this.camera);
      positions.push({
        id,
        x: (projected.x * 0.5 + 0.5) * rect.width,
        y: (-projected.y * 0.5 + 0.5) * rect.height,
        visible: projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 1.08 && Math.abs(projected.y) < 1.08,
      });
    });
    this.callbacks.onLabels(positions);
  }

  renderNow(): void {
    if (this.failed || this.disposed) return;
    this.renderer.render(this.scene, this.camera);
    this.projectLabels();
  }

  resize(): void {
    if (this.failed || this.disposed) return;
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    const pixelRatio = Math.min(window.devicePixelRatio, 1.75);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.fov = this.camera.aspect < 0.92 ? 43 : 33;
    this.camera.updateProjectionMatrix();
    this.renderNow();
  }

  resetCamera(reducedMotion = false): void {
    this.moveCamera(this.latestState?.step ?? "complete", reducedMotion);
  }

  zoom(direction: "in" | "out"): void {
    if (this.failed || this.disposed) return;
    if (direction === "in") this.controls.dollyOut(1.12);
    else this.controls.dollyIn(1.12);
    this.controls.update();
    this.renderNow();
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.cameraAnimation);
    cancelAnimationFrame(this.currentAnimation);
    this.controls?.dispose();
    this.scene?.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
    this.renderer?.dispose();
  }
}
