import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, OrbitControls, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";

function Card({ position, rotation, color, label }: { position: [number, number, number]; rotation: [number, number, number]; color: string; label: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z += Math.sin(clock.elapsedTime + position[0]) * 0.0007;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.28} floatIntensity={0.7}>
      <RoundedBox ref={ref} position={position} rotation={rotation} args={[1.8, 1.05, 0.08]} radius={0.1} smoothness={5}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} transparent opacity={0.88} roughness={0.25} metalness={0.7} />
        <mesh position={[0, -0.25, 0.06]}>
          <planeGeometry args={[1.1, 0.04]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.38} />
        </mesh>
        <mesh position={[-0.55, 0.28, 0.06]}>
          <circleGeometry args={[0.08, 24]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.22, 0.29, 0.06]}>
          <planeGeometry args={[0.75, 0.07]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
        </mesh>
      </RoundedBox>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={1.5} />
      <pointLight position={[3, 3, 4]} color="#c5f467" intensity={8} />
      <pointLight position={[-4, -2, 2]} color="#917bff" intensity={9} />
      <Float speed={0.6} rotationIntensity={0.15} floatIntensity={0.6}>
        <mesh rotation={[0.3, 0.2, 0.2]}>
          <icosahedronGeometry args={[1.35, 2]} />
          <MeshTransmissionMaterial backside thickness={0.6} roughness={0.08} transmission={0.96} chromaticAberration={0.12} color="#d3cdfb" />
        </mesh>
      </Float>
      <Card position={[-1.42, 0.66, 0.3]} rotation={[0.1, 0.35, -0.18]} color="#c5f467" label="React" />
      <Card position={[1.42, 0.18, 0.1]} rotation={[-0.1, -0.25, 0.2]} color="#8f7dff" label="Design" />
      <Card position={[-0.5, -1.35, 0.2]} rotation={[0.2, 0.1, 0.12]} color="#65dff2" label="AI / ML" />
      <Sparkles count={70} scale={6} size={1.7} speed={0.35} color="#c5f467" />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.55} />
    </>
  );
}

export function OrbitalPreview() {
  return <div className="orbital-preview"><Canvas camera={{ position: [0, 0, 6], fov: 36 }}><Scene /></Canvas><div className="preview-glow" /></div>;
}
