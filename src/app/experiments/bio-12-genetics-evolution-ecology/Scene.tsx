"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";

interface SceneProps {
  mode: "operon" | "ecology";
  hasLactose: boolean;
  producerEnergy: number;
}

export default function Scene({ mode, hasLactose, producerEnergy }: SceneProps) {
  return (
    <div className="w-full h-full bg-[#060913]">
      <Canvas camera={{ position: [0, 1.2, 6.4], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />

        {mode === "operon" ? (
          <group>
            {[
              { name: "P", x: -2.2, color: "#38bdf8", w: 0.7 },
              { name: "O", x: -1.35, color: "#f59e0b", w: 0.7 },
              { name: "lacZ", x: -0.35, color: "#10b981", w: 1.0 },
              { name: "lacY", x: 0.8, color: "#34d399", w: 1.0 },
              { name: "lacA", x: 1.95, color: "#6ee7b7", w: 1.0 },
            ].map((seg) => (
              <group key={seg.name} position={[seg.x, 0, 0]}>
                <mesh>
                  <boxGeometry args={[seg.w, 0.36, 0.36]} />
                  <meshStandardMaterial color={seg.color} />
                </mesh>
                <Html position={[0, -0.45, 0]} center>
                  <span className="text-[11px] font-bold text-white">{seg.name}</span>
                </Html>
              </group>
            ))}

            <mesh position={hasLactose ? [-1.35, 1.25, 0.6] : [-1.35, 0.42, 0]}>
              <sphereGeometry args={[0.38, 24, 24]} />
              <meshStandardMaterial color="#f43f5e" />
            </mesh>

            <mesh position={hasLactose ? [0.5, 0.52, 0] : [-2.2, 0.52, 0]}>
              <sphereGeometry args={[0.45, 24, 24]} />
              <meshStandardMaterial color="#a855f7" />
            </mesh>

            <Html position={[0, 2.0, 0]} center>
              <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-emerald-400/40 text-xs font-bold text-white whitespace-nowrap">
                {hasLactose
                  ? "CÓ Lactose: Protein ức chế bất hoạt → RNA Polymerase phiên mã Z, Y, A"
                  : "KHÔNG Lactose: Protein ức chế bám vùng O → Ngăn cản phiên mã"}
              </div>
            </Html>
          </group>
        ) : (
          <group position={[0, -1.2, 0]}>
            {[
              { level: "Bậc 1: Sinh vật sản xuất", energy: producerEnergy, w: 3.6, y: 0, color: "#10b981" },
              { level: "Bậc 2: Tiêu thụ bậc 1", energy: producerEnergy * 0.1, w: 2.5, y: 0.72, color: "#38bdf8" },
              { level: "Bậc 3: Tiêu thụ bậc 2", energy: producerEnergy * 0.01, w: 1.6, y: 1.44, color: "#a855f7" },
              { level: "Bậc 4: Tiêu thụ bậc 3", energy: producerEnergy * 0.001, w: 0.9, y: 2.16, color: "#f59e0b" },
            ].map((tier) => (
              <group key={tier.level} position={[0, tier.y, 0]}>
                <mesh>
                  <boxGeometry args={[tier.w, 0.58, 1.4]} />
                  <meshStandardMaterial color={tier.color} />
                </mesh>
                <Html position={[0, 0, 0.85]} center>
                  <div className="px-2 py-0.5 rounded bg-slate-950/85 text-[11px] font-semibold text-white whitespace-nowrap">
                    {tier.level}: {tier.energy.toLocaleString("vi-VN")} kcal
                  </div>
                </Html>
              </group>
            ))}
          </group>
        )}

        <OrbitControls enableDamping />
        <Environment files="/hdri/dikhololo_night_1k.hdr" />
      </Canvas>
    </div>
  );
}
