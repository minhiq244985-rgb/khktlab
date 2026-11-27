"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html, Line } from "@react-three/drei";

interface SceneProps {
  mode: "trig" | "pyramid";
  angleDeg: number;
  heightSA: number;
}

export default function Scene({ mode, angleDeg, heightSA }: SceneProps) {
  const rad = (angleDeg * Math.PI) / 180;
  const cx = -2.2 + Math.cos(rad) * 1.2;
  const cy = Math.sin(rad) * 1.2;

  const circlePts = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push([-2.2 + Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0]);
    }
    return pts;
  }, []);

  const sinPts = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 60; i++) {
      const t = (i / 60) * Math.PI * 2;
      pts.push([-0.3 + (t / (Math.PI * 2)) * 3.5, Math.sin(t) * 1.2, 0]);
    }
    return pts;
  }, []);

  const dihedralDeg = (Math.atan(heightSA / 2.4) * 180) / Math.PI;

  return (
    <div className="w-full h-full bg-[#060913]">
      <Canvas camera={{ position: [0, 1.8, 6.2], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />

        {mode === "trig" ? (
          <group>
            <Line points={circlePts} color="#38bdf8" lineWidth={2.5} />
            <Line points={[[-2.2, 0, 0], [cx, cy, 0]]} color="#fbbf24" lineWidth={3} />
            <Line points={sinPts} color="#f472b6" lineWidth={3} />
            <Line points={[[cx, cy, 0], [-0.3 + (rad / (Math.PI * 2)) * 3.5, cy, 0]]} color="#34d399" lineWidth={1.5} dashed />

            <Html position={[0, 2.1, 0]} center>
              <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-amber-400/50 text-xs font-bold text-white whitespace-nowrap">
                α = {angleDeg}° • sin(α) = {Math.sin(rad).toFixed(3)} • cos(α) = {Math.cos(rad).toFixed(3)}
              </div>
            </Html>
          </group>
        ) : (
          <group position={[0, -0.9, 0]}>
            <Line
              points={[
                [-1.2, 0, -1.2],
                [1.2, 0, -1.2],
                [1.2, 0, 1.2],
                [-1.2, 0, 1.2],
                [-1.2, 0, -1.2],
              ]}
              color="#38bdf8"
              lineWidth={3}
            />
            <Line points={[[-1.2, 0, -1.2], [-1.2, heightSA, -1.2]]} color="#f43f5e" lineWidth={4} />
            <Line points={[[-1.2, heightSA, -1.2], [1.2, 0, -1.2]]} color="#fbbf24" lineWidth={2.5} />
            <Line points={[[-1.2, heightSA, -1.2], [1.2, 0, 1.2]]} color="#fbbf24" lineWidth={2.5} />
            <Line points={[[-1.2, heightSA, -1.2], [-1.2, 0, 1.2]]} color="#fbbf24" lineWidth={2.5} />

            <Html position={[0, heightSA + 0.65, 0]} center>
              <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-rose-400/50 text-xs font-bold text-white whitespace-nowrap">
                Chóp S.ABCD (SA ⊥ đáy) • Góc nhị diện [S, BC, A] = ∠SBA = {dihedralDeg.toFixed(1)}°
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
