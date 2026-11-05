import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { Template } from "../lib/types";

function SkillCard({ skill, index, template }: { skill: string; index: number; template: Template }) {
  const ref = useRef<THREE.Group>(null);
  const angle = (index / 8) * Math.PI * 2;
  const radius = 2.25 + (index % 2) * 0.32;
  const colors = template === "cyber" ? ["#c5f467", "#8effd0"] : template === "hologram" ? ["#6de8ff", "#ca9bff"] : ["#b7a3ff", "#e7d8ff"];
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y += Math.sin(clock.elapsedTime * 0.7 + index) * 0.0015;
      ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.35 + index) * 0.14;
    }
  });
  return (
    <group ref={ref} position={[Math.cos(angle) * radius, Math.sin(angle) * radius * 0.62, (index % 3) - 1]}>
      <Float speed={1.3 + index * 0.04} rotationIntensity={0.16} floatIntensity={0.4}>
        <RoundedBox rotation={[0.08, 0.1, index % 2 ? -0.1 : 0.1]} args={[1.45, 0.47, 0.06]} radius={0.08} smoothness={4}>
          <meshStandardMaterial color={colors[index % 2]} emissive={colors[index % 2]} emissiveIntensity={0.3} roughness={0.22} metalness={0.65} />
        </RoundedBox>
      </Float>
    </group>
  );
}

function Scene({ skills, template }: { skills: string[]; template: Template }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ mouse }) => {
    if (group.current) {
      group.current.rotation.y += (mouse.x * 0.11 - group.current.rotation.y) * 0.025;
      group.current.rotation.x += (-mouse.y * 0.07 - group.current.rotation.x) * 0.025;
    }
  });
  return (
    <>
      <ambientLight intensity={1.4} />
      <pointLight position={[3, 3, 5]} color={template === "cyber" ? "#c5f467" : "#b7a3ff"} intensity={14} />
      <pointLight position={[-4, -3, 2]} color="#5e5aff" intensity={10} />
      <group ref={group}>{skills.slice(0, 8).map((skill, i) => <SkillCard key={skill} skill={skill} index={i} template={template} />)}</group>
      <Sparkles count={120} scale={10} size={1.5} speed={0.25} color={template === "hologram" ? "#6de8ff" : "#c5f467"} />
    </>
  );
}

export function PublicScene({ skills, template }: { skills: string[]; template: Template }) {
  return <div className="public-scene"><Canvas camera={{ position: [0, 0, 8], fov: 42 }}><Scene skills={skills} template={template} /></Canvas></div>;
}
