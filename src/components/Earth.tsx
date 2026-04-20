// Source: https://threejs.org/examples/?q=earth#webgpu_tsl_earth
import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "three-stdlib";
import * as THREE from "three";

function CameraControls() {
  const controlsRef = useRef<any>(null);
  const { camera, gl } = useThree();

  useMemo(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.minDistance = 0.1;
    controls.maxDistance = 50;
    controlsRef.current = controls;
  }, [camera, gl]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return null;
}

function Globe() {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const { sphereGeometry, globeMaterial, atmosphereMaterial } = useMemo(() => {
    const atmosphereDayColor = new THREE.Color("#4db2ff");
    const atmosphereTwilightColor = new THREE.Color("#bc490b");
    const roughnessLow = 0.25;
    const roughnessHigh = 0.35;

    const textureLoader = new THREE.TextureLoader();

    const dayTexture = textureLoader.load("./textures/earth_day_4096.jpg");
    dayTexture.colorSpace = THREE.SRGBColorSpace;
    dayTexture.anisotropy = 8;

    const nightTexture = textureLoader.load("./textures/earth_night_4096.jpg");
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.anisotropy = 8;

    const bumpRoughnessCloudsTexture = textureLoader.load(
      "./textures/earth_bump_roughness_clouds_4096.jpg",
    );
    bumpRoughnessCloudsTexture.anisotropy = 8;

    const globeMaterial = new THREE.MeshStandardMaterial({
      map: dayTexture,
      roughness: 0.3,
      bumpMap: bumpRoughnessCloudsTexture,
      bumpScale: 0.02,
      emissiveMap: nightTexture,
      emissive: new THREE.Color("#000000"),
      emissiveIntensity: 1,
    });

    const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);

    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: atmosphereDayColor,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide,
    });

    return {
      sphereGeometry,
      globeMaterial,
      atmosphereMaterial,
      dayTexture,
      nightTexture,
      bumpRoughnessCloudsTexture,
      atmosphereDayColor,
      atmosphereTwilightColor,
    };
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const elapsed = clock.getElapsedTime();
      meshRef.current.rotation.y = elapsed * 0.025;
      meshRef.current.rotation.x = Math.sin(elapsed * 0.1) * 0.1;
    }

    if (atmosphereRef.current && meshRef.current) {
      atmosphereRef.current.rotation.copy(meshRef.current.rotation);
    }
  });

  return (
    <>
      <mesh ref={meshRef} geometry={sphereGeometry} material={globeMaterial} />
      <mesh ref={atmosphereRef} geometry={sphereGeometry} scale={1.04}>
        <primitive object={atmosphereMaterial} />
      </mesh>
    </>
  );
}

export default function Earth({
  width = 500,
  height = 500,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <div style={{ width, height }}>
      <Canvas
        camera={{ position: [4.5, 2, 3], fov: 25 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[0, 0, 3]} intensity={2} color="#ffffff" />
        <Globe />
        <CameraControls />
      </Canvas>
    </div>
  );
}
