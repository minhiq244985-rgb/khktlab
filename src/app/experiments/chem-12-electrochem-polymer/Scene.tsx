"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Html, Line } from "@react-three/drei";
import * as THREE from "three";

export const E0_TABLE: Record<string, number> = {
  Mg: -2.356,
  Zn: -0.763,
  Fe: -0.44,
  Cu: 0.34,
  Ag: 0.799,
};

interface SceneProps {
  mode: "galvanic" | "electrolysis";
  anodeMetal: "Zn" | "Fe" | "Mg";
  cathodeMetal: "Cu" | "Ag";
  currentA: number;
  timeMin: number;
}

function ElectronFlow() {
  const dotRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!dotRef.current) return;
    const t = (clock.getElapsedTime() * 0.6) % 1;
    dotRef.current.position.x = -1.5 + t * 3.0;
  });
  return (
    <mesh ref={dotRef} position={[-1.5, 2.05, 0]}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={0.9} />
    </mesh>
  );
}

export default function Scene({ mode, anodeMetal, cathodeMetal, currentA, timeMin }: SceneProps) {
  const ePin = E0_TABLE[cathodeMetal] - E0_TABLE[anodeMetal];
  const mCu = (64 * currentA * timeMin * 60) / (2 * 96500);

  return (
    <div className="w-full h-full bg-[#060913]">
      <Canvas camera={{ position: [0, 1.3, 6.4], fov: 44 }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.3} />

        {mode === "galvanic" ? (
          <group position={[0, -0.3, 0]}>
            <mesh position={[-1.5, -0.3, 0]}>
              <cylinderGeometry args={[0.9, 0.9, 2.1, 32]} />
              <meshPhysicalMaterial color="#e2e8f0" transparent opacity={0.22} />
            </mesh>
            <mesh position={[-1.5, -0.6, 0]}>
              <cylinderGeometry args={[0.85, 0.85, 1.4, 32]} />
              <meshStandardMaterial color="#93c5fd" transparent opacity={0.45} />
            </mesh>
            <mesh position={[-1.5, 0.25, 0]}>
              <boxGeometry args={[0.28, 2.2, 0.08]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.25} />
            </mesh>

            <mesh position={[1.5, -0.3, 0]}>
              <cylinderGeometry args={[0.9, 0.9, 2.1, 32]} />
              <meshPhysicalMaterial color="#e2e8f0" transparent opacity={0.22} />
            </mesh>
            <mesh position={[1.5, -0.6, 0]}>
              <cylinderGeometry args={[0.85, 0.85, 1.4, 32]} />
              <meshStandardMaterial color="#38bdf8" transparent opacity={0.55} />
            </mesh>
            <mesh position={[1.5, 0.25, 0]}>
              <boxGeometry args={[0.28, 2.2, 0.08]} />
              <meshStandardMaterial
                color={cathodeMetal === "Cu" ? "#ea580c" : "#e2e8f0"}
                metalness={0.85}
                roughness={0.2}
              />
            </mesh>

            <Line
              points={[
                [-1.0, -0.2, 0],
                [-1.0, 0.95, 0],
                [1.0, 0.95, 0],
                [1.0, -0.2, 0],
              ]}
              color="#f8fafc"
              lineWidth={8}
            />

            <Line
              points={[
                [-1.5, 1.35, 0],
                [-1.5, 2.05, 0],
                [1.5, 2.05, 0],
                [1.5, 1.35, 0],
              ]}
              color="#fbbf24"
              lineWidth={2.5}
            />
            <ElectronFlow />

            <Html position={[0, 2.55, 0]} center>
              <div className="px-4 py-1.5 rounded-full bg-slate-950/90 border border-amber-400/50 text-xs font-bold text-amber-300 whitespace-nowrap">
                Pin {anodeMetal} – {cathodeMetal} | E°pin = {ePin.toFixed(3)} V (e⁻ chạy Anode → Cathode)
              </div>
            </Html>
          </group>
        ) : (
          <group position={[0, -0.3, 0]}>
            <mesh position={[0, -0.3, 0]}>
              <boxGeometry args={[3.4, 2.2, 1.8]} />
              <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.25} />
            </mesh>
            <mesh position={[-0.95, 0.2, 0]}>
              <boxGeometry args={[0.24 + Math.min(0.25, mCu * 0.15), 2.3, 0.8]} />
              <meshStandardMaterial color="#ea580c" metalness={0.75} roughness={0.25} />
            </mesh>
            <mesh position={[0.95, 0.2, 0]}>
              <boxGeometry args={[0.22, 2.3, 0.8]} />
              <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.5} />
            </mesh>
            <Html position={[0, 2.1, 0]} center>
              <div className="px-4 py-1.5 rounded-full bg-slate-950/90 border border-pink-400/50 text-xs font-bold text-pink-200 whitespace-nowrap">
                Điện phân CuSO₄ (điện cực trơ) • m(Cu) bám Cathode = {mCu.toFixed(3)} g
              </div>
            </Html>
          </group>
        )}

        <OrbitControls enableDamping />
        <Environment files="/hdri/dikhololo_night_1k.hdr" />
      </Canvas>
    </div>
  );
}
