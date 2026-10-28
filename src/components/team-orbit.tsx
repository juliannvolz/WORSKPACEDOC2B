"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";

function Orbit({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (group.current && !reduced) {
      group.current.rotation.y += delta * 0.12;
      group.current.rotation.x += delta * 0.035;
    }
  });
  return <group ref={group} rotation={[0.35, 0.15, 0.2]}>
    <mesh><icosahedronGeometry args={[1.12, 1]} /><meshBasicMaterial color="#a8db24" wireframe transparent opacity={0.25} /></mesh>
    <mesh rotation={[Math.PI / 2.8, 0, 0]}><torusGeometry args={[1.42, 0.008, 4, 100]} /><meshBasicMaterial color="#b9f30a" transparent opacity={0.55} /></mesh>
    <mesh rotation={[0.2, Math.PI / 2.5, 0.25]}><torusGeometry args={[1.65, 0.006, 4, 100]} /><meshBasicMaterial color="#81b732" transparent opacity={0.4} /></mesh>
    <mesh position={[1.18, 0.35, 0.05]}><sphereGeometry args={[0.035, 12, 12]} /><meshBasicMaterial color="#d1ff52" /></mesh>
    <mesh position={[-0.7, -1.1, 0.6]}><sphereGeometry args={[0.025, 12, 12]} /><meshBasicMaterial color="#b5ee1c" /></mesh>
  </group>;
}

export default function TeamOrbit() {
  const [enabled, setEnabled] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (context) { setEnabled(true); context.getExtension("WEBGL_lose_context")?.loseContext(); }
    } catch { setEnabled(false); }
  }, []);
  if (!enabled) return null;
  return <div className="team-orbit" aria-hidden="true"><Canvas camera={{ position: [0, 0, 5], fov: 40 }} gl={{ alpha: true, antialias: true, powerPreference: "low-power" }} dpr={[1, 1.5]} frameloop={reduced ? "demand" : "always"} fallback={<span />}><Orbit reduced={reduced} /></Canvas></div>;
}
