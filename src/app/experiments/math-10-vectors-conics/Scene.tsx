"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html, Line } from "@react-three/drei";

interface SceneProps {
  mode: "conic" | "vector";
  planeAngle: number;
  vecAx: number;
  vecAy: number;
  vecBx: number;
  vecBy: number;
}

export default function Scene({ mode, planeAngle, vecAx, vecAy, vecBx, vecBy }: SceneProps) {
  const rad = (planeAngle * Math.PI) / 180;
  const conicName =
    planeAngle < 5
      ? "Đường Tròn (e = 0)"
      : planeAngle < 42
      ? "Đường Elip (0 < e < 1)"
      : planeAngle < 52
      ? "Đường Parabol (e = 1)"
      : "Đường Hypebol (e > 1)";

  const sumX = vecAx + vecBx;
  const sumY = vecAy + vecBy;
  const dot = vecAx * vecBx + vecAy * vecBy;

  return (
    <div className="w-full h-full bg-[#060913]">
      <Canvas camera={{ position: [0, 1.5, 6.2], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />

        {mode === "conic" ? (
          <group>
            <mesh position={[0, 1.1, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[1.3, 2.2, 36, 1, true]} />
              <meshPhysicalMaterial color="#fbbf24" transparent opacity={0.28} side={2} />
            </mesh>
            <mesh position={[0, -1.1, 0]}>
              <coneGeometry args={[1.3, 2.2, 36, 1, true]} />
              <meshPhysicalMaterial color="#fbbf24" transparent opacity={0.28} side={2} />
            </mesh>

            <mesh position={[0, 0.55, 0]} rotation={[rad, 0, 0]}>
              <boxGeometry args={[3.4, 0.04, 3.4]} />
              <meshStandardMaterial color="#38bdf8" transparent opacity={0.45} />
            </mesh>

            <Html position={[0, 2.45, 0]} center>
              <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-amber-400/50 text-xs font-bold text-amber-300 whitespace-nowrap">
                Góc nghiêng mặt phẳng α = {planeAngle}° → Thiết diện: {conicName}
              </div>
            </Html>
          </group>
        ) : (
          <group>
            <Line points={[[-3.5, 0, 0], [3.5, 0, 0]]} color="#475569" lineWidth={1.5} />
            <Line points={[[0, -2.5, 0], [0, 2.5, 0]]} color="#475569" lineWidth={1.5} />

            <Line points={[[0, 0, 0], [vecAx, vecAy, 0]]} color="#38bdf8" lineWidth={4} />
            <Line points={[[0, 0, 0], [vecBx, vecBy, 0]]} color="#f472b6" lineWidth={4} />
            <Line points={[[0, 0, 0], [sumX, sumY, 0]]} color="#fbbf24" lineWidth={4} />
            <Line points={[[vecAx, vecAy, 0], [sumX, sumY, 0]]} color="#94a3b8" lineWidth={1.5} dashed />
            <Line points={[[vecBx, vecBy, 0], [sumX, sumY, 0]]} color="#94a3b8" lineWidth={1.5} dashed />

            <Html position={[0, 2.35, 0]} center>
              <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-sky-400/50 text-xs font-bold text-white whitespace-nowrap">
                u⃗ + v⃗ = ({sumX.toFixed(1)}; {sumY.toFixed(1)}) • Tích vô hướng u⃗·v⃗ = {dot.toFixed(2)}
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
