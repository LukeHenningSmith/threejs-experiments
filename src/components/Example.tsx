import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RotatingCubeProps {
  position: [number, number, number];
  delay: number;
}

function createRoundedFrontGeometry(
  width: number,
  height: number,
  depth: number,
  radius: number,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const w = width / 2;
  const h = height / 2;
  const r = Math.min(radius, w, h);

  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);

  const extrudeSettings = {
    depth: depth,
    bevelEnabled: false,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

function createGradientMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vPosition;
      void main() {
        vec3 darkGreen = vec3(0.035, 0.255, 0.129);
        vec3 lightGreen = vec3(0.2, 0.8, 0.4);
        float gradient = (vPosition.y + 0.25);
        vec3 color = mix(darkGreen, lightGreen, gradient);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

function RotatingCube({ position, delay }: RotatingCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(
    () => createRoundedFrontGeometry(1, 1, 0.3, 0.1),
    [],
  );

  const material = useMemo(() => createGradientMaterial(), []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const elapsed = clock.getElapsedTime();

      const initialDelay = 0.5;
      const rotateDuration = 1.5;
      const pause = 2;
      const totalCycle = initialDelay + rotateDuration + pause;

      const cycleTime = elapsed % totalCycle;

      if (cycleTime < initialDelay + delay) {
        meshRef.current.rotation.z = 0;
        return;
      }

      const animTime = cycleTime - initialDelay - delay;

      if (animTime < 0 || animTime > rotateDuration + pause) {
        meshRef.current.rotation.z = 0;
        return;
      }

      const normalizedTime = animTime / rotateDuration;
      const targetAngle = Math.PI * 2;

      if (animTime > rotateDuration) {
        meshRef.current.rotation.z = targetAngle;
        return;
      }

      const overshoot = 0.45;
      const overshootPeak = 1 - overshoot * 2;

      const eased = (1 - Math.cos(normalizedTime * Math.PI)) / 2;
      let overshootOffset = 0;
      if (normalizedTime > overshootPeak) {
        const overshootProgress =
          (normalizedTime - overshootPeak) / (1 - overshootPeak);
        overshootOffset = overshoot * Math.sin(overshootProgress * Math.PI);
      }
      meshRef.current.rotation.z = eased * targetAngle + overshootOffset;
    }
  });

  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      <primitive object={material} />
    </mesh>
  );
}

function generatePositions(
  zOffset: number,
  xOffset: number,
  yOffset: number,
  squareCount: number,
): [number, number, number][] {
  const half = Math.floor(squareCount / 2);
  return Array.from({ length: squareCount }, (_, i) => [
    xOffset * i,
    yOffset * i,
    i === half ? 0 : i < half ? -zOffset * (half - i) : zOffset * (i - half),
  ]);
}

export default function Example({
  width = 500,
  height = 500,
}: {
  width?: number;
  height?: number;
}) {
  const zOffset = 0.45;
  const xOffset = 0;
  const yOffset = 0;
  const squareCount = 6;

  const positions = generatePositions(zOffset, xOffset, yOffset, squareCount);

  return (
    <div style={{ width: width, height: height }}>
      <Canvas camera={{ position: [4, 3, 4], fov: 45 }}>
        {[...positions].reverse().map((pos, i) => (
          <RotatingCube key={i} position={pos} delay={i * 0.1} />
        ))}
      </Canvas>
    </div>
  );
}
