"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html, Line } from "@react-three/drei";
import * as THREE from "three";

interface SceneProps {
  mode: "solid" | "oxyz";
  upperB: number;
  sphereR: number;
}

export default function Scene({ mode, upperB, sphereR }: SceneProps) {
  const lathePoints = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 30; i++) {
      const x = (i / 30) * upperB;
      const r = Math.sqrt(x);
      pts.push(new THREE.Vector2(r, x - upperB / 2));
    }
    return pts;
  }, [upperB]);

  const volume = (Math.PI * upperB * upperB) / 2;

  return (
    <div className="w-full h-full bg-[#060913]">
      <Canvas camera={{ position: [0, 1.5, 6.2], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />

        {mode === "solid" ? (
          <group>
            <Line points={[[-2.8, 0, 0], [2.8, 0, 0]]} color="#64748b" lineWidth={2} />
            <mesh rotation={[0, 0, -Math.PI / 2]}>
              <latheGeometry args={[lathePoints, 40]} />
              <meshPhysicalMaterial color="#fbbf24" transparent opacity={0.62} roughness={0.2} side={2} />
            </mesh>

            <Html position={[0, 2.2, 0]} center>
              <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-amber-400/50 text-xs font-bold text-amber-300 whitespace-nowrap">
                Quay y = √x quanh Ox trên [0; {upperB.toFixed(1)}] → V = π∫₀ᵇ x dx = {volume.toFixed(2)}
              </div>
            </Html>
          </group>
        ) : (
          <group>
            <Line points={[[-2.8, 0, 0], [2.8, 0, 0]]} color="#f43f5e" lineWidth={2} />
            <Line points={[[0, -2.5, 0], [0, 2.5, 0]]} color="#10b981" lineWidth={2} />
            <Line points={[[0, 0, -2.8], [0, 0, 2.8]]} color="#38bdf8" lineWidth={2} />

            <mesh position={[0.5, 0.4, 0.3]}>
              <sphereGeometry args={[sphereR, 32, 32]} />
              <meshPhysicalMaterial color="#a855f7" transparent opacity={0.38} />
            </mesh>
            <mesh position={[0.5, 0.4, 0.3]}>
              <sphereGeometry args={[sphereR, 18, 18]} />
              <meshBasicMaterial color="#c084fc" wireframe />
            </mesh>

            <Html position={[0, 2.35, 0]} center>
              <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-purple-400/50 text-xs font-bold text-purple-200 whitespace-nowrap">
                Mặt cầu Oxyz: (x − 0,5)² + (y − 0,4)² + (z − 0,3)² = {sphereR.toFixed(1)}²
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
