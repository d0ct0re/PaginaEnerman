import { Suspense, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Line } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// ── Constantes de escena ────────────────────────────────────────────────────
const TOWER_COUNT = 8;

// Cámara en el lado derecho apuntando hacia la izquierda ~40°
const CAM_POS  = new THREE.Vector3(10, 3.5, 8);
const LOOK_AT  = new THREE.Vector3(-4, 1.2, -18);
const SCENE_Y  = -3.2;

// ── Materiales compartidos ──────────────────────────────────────────────────
const BLACK_MESH_MAT = new THREE.MeshBasicMaterial({
  color: new THREE.Color(0x000000),
  side: THREE.FrontSide,
});

const GOLD_EDGE_MAT = new THREE.LineBasicMaterial({
  color: new THREE.Color(4.0, 2.8, 0.0), // HDR dorado intenso → activa Bloom
  toneMapped: false,
  transparent: true,
  opacity: 0.92,
});

const GOLD_PULSE_MAT = new THREE.MeshBasicMaterial({
  color: new THREE.Color(5.0, 3.5, 0.0),
  toneMapped: false,
});

const PULSE_GEO = new THREE.SphereGeometry(0.038, 7, 7);

// Cables: material dorado tenue para las catenarias
const CABLE_COLOR = "#B8860B";

// ── Aplica estilo wireframe-gold a un nodo clonado ─────────────────────────
function wireframeGold(node) {
  node.traverse((child) => {
    if (!child.isMesh) return;

    // Material base negro
    child.material = BLACK_MESH_MAT;
    child.castShadow    = false;
    child.receiveShadow = false;

    // Recorre cada geometría del mesh y agrega EdgeLines encima
    const geo   = child.geometry;
    const edges = new THREE.EdgesGeometry(geo, 12); // 12° umbral → solo aristas estructurales
    const lines = new THREE.LineSegments(edges, GOLD_EDGE_MAT);
    lines.raycast = () => {}; // no interferir con interactividad
    child.add(lines);
  });
}

// ── Pulso eléctrico individual ──────────────────────────────────────────────
function Pulse({ curve, speed, initialT }) {
  const ref = useRef();
  const t   = useRef(initialT);

  useFrame((_, delta) => {
    t.current = (t.current + speed * delta) % 1;
    if (ref.current) ref.current.position.copy(curve.getPoint(t.current));
  });

  return (
    <mesh
      ref={ref}
      geometry={PULSE_GEO}
      material={GOLD_PULSE_MAT}
      frustumCulled={false}
    />
  );
}

// ── Rig de cámara: posición diagonal + paralaje suave con el mouse ──────────
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef([0, 0]);

  useEffect(() => {
    camera.position.copy(CAM_POS);
    camera.lookAt(LOOK_AT);

    const onMove = (e) => {
      mouse.current = [
        (e.clientX / window.innerWidth)  * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      ];
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [camera]);

  useFrame(() => {
    // Paralaje sutil desde la posición diagonal base
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      CAM_POS.x + mouse.current[0] * 0.35,
      0.04
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      CAM_POS.y + mouse.current[1] * 0.20,
      0.04
    );
    camera.lookAt(LOOK_AT);
  });

  return null;
}

// ── Corredor diagonal de torres ────────────────────────────────────────────
function DiagonalCorridor() {
  const { scene: gltfScene } = useGLTF("/torre.glb");

  const { clones, towerScale, pOffset, cables } = useMemo(() => {
    // Escala automática desde bounding box
    const box    = new THREE.Box3().setFromObject(gltfScene);
    const size   = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const towerScale = 8.0 / size.y;
    const scaledH    = size.y * towerScale;
    const scaledW    = size.x * towerScale;

    const pOffset = [
      -center.x * towerScale,
      -box.min.y * towerScale,
      -center.z * towerScale,
    ];

    // Anclajes de cables: 72% de altura, ±52% del ancho
    const armY = scaledH * 0.72;
    const armX = scaledW * 0.52;

    // Posiciones diagonales: nacen en esquina inferior-derecha,
    // viajan hacia la izquierda y al fondo (eje -X y -Z simultáneamente)
    const positions = Array.from({ length: TOWER_COUNT }, (_, i) => ({
      x: i * -2.0,
      z: i * -4.5,
    }));

    // Clonar y aplicar wireframe-gold a cada clon
    const clones = positions.map(() => {
      const clone = gltfScene.clone(true);
      wireframeGold(clone);
      return clone;
    });

    // Curvas de catenaria entre torres adyacentes (adaptadas a la diagonal)
    const cables = [];
    for (let i = 0; i < TOWER_COUNT - 1; i++) {
      const p1x = positions[i].x;
      const p1z = positions[i].z;
      const p2x = positions[i + 1].x;
      const p2z = positions[i + 1].z;

      [-armX, 0, armX].forEach((xOff, ci) => {
        const a1  = new THREE.Vector3(p1x + xOff, armY, p1z);
        const a2  = new THREE.Vector3(p2x + xOff, armY, p2z);
        const mid = new THREE.Vector3(
          (p1x + p2x) / 2 + xOff,
          armY - 0.35,
          (p1z + p2z) / 2
        );
        const curve = new THREE.QuadraticBezierCurve3(a1, mid, a2);
        cables.push({
          curve,
          points: curve.getPoints(48),
          key: `${i}-${ci}`,
          speed: 0.13 + ((i * 3 + ci) % 5) * 0.020,
        });
      });
    }

    return { clones, towerScale, pOffset, cables, positions };
  }, [gltfScene]);

  // Re-extraer positions para el JSX (viene del memo pero necesitamos acceso)
  const positions = Array.from({ length: TOWER_COUNT }, (_, i) => ({
    x: i * -2.0,
    z: i * -4.5,
  }));

  return (
    <group position={[0, SCENE_Y, 0]}>

      {/* Torres en disposición diagonal */}
      {clones.map((clone, i) => (
        <group key={i} position={[positions[i].x, 0, positions[i].z]}>
          <primitive
            object={clone}
            scale={towerScale}
            position={pOffset}
            frustumCulled={false}
          />
        </group>
      ))}

      {/* Cables de catenaria — dorado tenue */}
      {cables.map(({ points, key }) => (
        <Line
          key={key}
          points={points}
          color={CABLE_COLOR}
          transparent
          opacity={0.55}
          lineWidth={0.4}
        />
      ))}

      {/* Pulsos eléctricos dorados: 2 por tramo */}
      {cables.map(({ curve, key, speed }) =>
        [0.05, 0.55].map((offset, j) => (
          <Pulse
            key={`p-${key}-${j}`}
            curve={curve}
            speed={speed}
            initialT={offset}
          />
        ))
      )}
    </group>
  );
}

// ── Canvas principal ────────────────────────────────────────────────────────
export default function HeroTower3D() {
  return (
    <Canvas
      camera={{ position: [10, 3.5, 8], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
    >
      {/* Fondo y niebla negros */}
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 12, 50]} />

      {/* Iluminación mínima — el wireframe es esencialmente emissivo */}
      <ambientLight intensity={0.06} />

      <Suspense fallback={null}>
        <DiagonalCorridor />

        {/* Bloom para los pulsos y aristas doradas HDR */}
        <EffectComposer>
          <Bloom
            intensity={1.35}
            luminanceThreshold={0.18}
            luminanceSmoothing={0.80}
            mipmapBlur
          />
        </EffectComposer>
      </Suspense>

      {/* Paralaje de cámara diagonal */}
      <CameraRig />
    </Canvas>
  );
}

useGLTF.preload("/torre.glb");
