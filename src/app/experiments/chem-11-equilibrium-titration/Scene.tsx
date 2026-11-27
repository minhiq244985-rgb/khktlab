"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";

interface SceneProps {
  mode: "equilibrium" | "titration";
  naohVol: number;
  eqTemp: number;
  eqPressure: number;
}

export function calcTitrationPH(naohVol: number) {
  const cAcid = 0.1;
  const vAcid = 20.0;
  const cBase = 0.1;
  const nH = cAcid * vAcid;
  const nOH = cBase * naohVol;
  const vTotal = vAcid + naohVol;

  if (Math.abs(nH - nOH) < 1e-4) return 7.0;
  if (nH > nOH) {
    const hConc = (nH - nOH) / vTotal;
    return -Math.log10(hConc);
  } else {
    const ohConc = (nOH - nH) / vTotal;
    return 14 + Math.log10(ohConc);
  }
}

export default function Scene({ mode, naohVol, eqTemp, eqPressure }: SceneProps) {
  const pH = useMemo(() => calcTitrationPH(naohVol), [naohVol]);

  const flaskColor = useMemo(() => {
    if (pH < 8.2) return "#bae6fd";
    if (pH < 9.5) return "#f9a8d4";
    return "#ec4899";
  }, [pH]);

  const brownRatio = useMemo(() => {
    const tempFactor = (eqTemp - 0) / 100;
    const pressFactor = 1 / eqPressure;
    return Math.min(0.92, Math.max(0.12, 0.45 * (0.6 + tempFactor) * pressFactor));
  }, [eqTemp, eqPressure]);

  return (
    <div className="w-full h-full bg-[#060913]">
      <Canvas camera={{ position: [0, 1.0, 6.2], fov: 44 }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 8, 5]} intensity={1.3} />

        {mode === "titration" ? (
          <group position={[0, -0.3, 0]}>
            <mesh position={[-1.1, 0.2, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 4.4, 16]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.2} />
            </mesh>
            <mesh position={[0, -1.95, 0]}>
              <boxGeometry args={[3.2, 0.16, 2.0]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>

            <mesh position={[0, 1.35, 0]}>
              <cylinderGeometry args={[0.16, 0.16, 2.3, 24]} />
              <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.35} />
            </mesh>
            <mesh position={[0, 1.35 - (naohVol / 40) * 0.9, 0]}>
              <cylinderGeometry args={[0.13, 0.13, Math.max(0.2, 2.1 * (1 - naohVol / 42)), 20]} />
              <meshStandardMaterial color="#38bdf8" transparent opacity={0.75} />
            </mesh>

            <mesh position={[0, -1.1, 0]}>
              <cylinderGeometry args={[0.35, 0.95, 1.5, 32]} />
              <meshPhysicalMaterial color="#ffffff" transparent opacity={0.22} />
            </mesh>
            <mesh position={[0, -1.42, 0]}>
              <cylinderGeometry args={[0.62, 0.9, 0.78, 32]} />
              <meshStandardMaterial color={flaskColor} transparent opacity={0.85} />
            </mesh>

            <Html position={[0, 2.8, 0]} center>
              <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-pink-400/40 text-xs font-bold text-white whitespace-nowrap">
                V(NaOH) = {naohVol.toFixed(1)} mL • pH = <span className="text-pink-300">{pH.toFixed(2)}</span>
              </div>
            </Html>
          </group>
        ) : (
          <group>
            <mesh>
              <sphereGeometry args={[1.65, 36, 36]} />
              <meshPhysicalMaterial color="#f8fafc" transparent opacity={0.18} />
            </mesh>
            <mesh>
              <sphereGeometry args={[1.58, 32, 32]} />
              <meshStandardMaterial color="#9a3412" transparent opacity={brownRatio} />
            </mesh>

            <Html position={[0, 2.15, 0]} center>
              <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-amber-400/40 text-xs font-bold text-amber-200 whitespace-nowrap">
                2NO₂ (nâu đỏ) ⇌ N₂O₄ (không màu) | T = {eqTemp}°C | P = {eqPressure.toFixed(1)} atm
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
