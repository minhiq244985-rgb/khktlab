"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Html, Line } from "@react-three/drei";
import * as THREE from "three";

interface SceneProps {
  mode: "orbital" | "enthalpy" | "rate";
  orbitalType: "1s" | "2px" | "2py" | "2pz";
  reactionType: "exo" | "endo";
  tempC: number;
  concM: number;
  hasCatalyst: boolean;
}

function OrbitalCloud({ orbitalType }: { orbitalType: "1s" | "2px" | "2py" | "2pz" }) {
  const ptsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 900;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 0.3 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      let x = r * Math.sin(phi) * Math.cos(theta);
      let y = r * Math.sin(phi) * Math.sin(theta);
      let z = r * Math.cos(phi);

      const sign = i % 2 === 0 ? 1 : -1;
      if (orbitalType === "2px") x = sign * (0.35 + Math.abs(x) * 1.15);
      if (orbitalType === "2py") y = sign * (0.35 + Math.abs(y) * 1.15);
      if (orbitalType === "2pz") z = sign * (0.35 + Math.abs(z) * 1.15);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      if (orbitalType === "1s") {
        col[i * 3] = 0.22; col[i * 3 + 1] = 0.74; col[i * 3 + 2] = 0.97;
      } else if (sign > 0) {
        col[i * 3] = 0.96; col[i * 3 + 1] = 0.45; col[i * 3 + 2] = 0.71;
      } else {
        col[i * 3] = 0.66; col[i * 3 + 1] = 0.33; col[i * 3 + 2] = 0.97;
      }
    }
    return { positions: pos, colors: col };
  }, [orbitalType]);

  useFrame((_, delta) => {
    if (ptsRef.current) {
      ptsRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <group>
      <Line points={[[-2.4, 0, 0], [2.4, 0, 0]]} color="#64748b" lineWidth={1.5} />
      <Line points={[[0, -2.4, 0], [0, 2.4, 0]]} color="#64748b" lineWidth={1.5} />
      <Line points={[[0, 0, -2.4], [0, 0, 2.4]]} color="#64748b" lineWidth={1.5} />
      <mesh>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.6} />
      </mesh>
      <points ref={ptsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.065} vertexColors transparent opacity={0.85} />
      </points>
      <Html position={[0, 2.3, 0]} center>
        <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-pink-400/40 text-xs font-bold text-pink-300 whitespace-nowrap">
          Obitan {orbitalType} — {orbitalType === "1s" ? "Hình cầu" : "Hình số 8 nổi"}
        </div>
      </Html>
    </group>
  );
}

function EnthalpyDiagram({ reactionType, hasCatalyst }: { reactionType: "exo" | "endo"; hasCatalyst: boolean }) {
  const curvePts = useMemo(() => {
    const startY = reactionType === "exo" ? 0.8 : -0.8;
    const endY = reactionType === "exo" ? -0.9 : 0.9;
    const peakY = (hasCatalyst ? 1.35 : 2.1) + Math.max(startY, endY) * 0.3;
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const x = -2.5 + t * 5.0;
      const base = startY * (1 - t) + endY * t;
      const bump = Math.sin(Math.PI * t) * (peakY - (startY + endY) / 2);
      pts.push([x, base + bump, 0]);
    }
    return pts;
  }, [reactionType, hasCatalyst]);

  const startY = reactionType === "exo" ? 0.8 : -0.8;
  const endY = reactionType === "exo" ? -0.9 : 0.9;

  return (
    <group>
      <Line points={[[-2.8, -1.8, 0], [-2.8, 2.5, 0]]} color="#94a3b8" lineWidth={2} />
      <Line points={[[-2.8, -1.8, 0], [2.8, -1.8, 0]]} color="#94a3b8" lineWidth={2} />
      <Line points={curvePts} color={reactionType === "exo" ? "#f43f5e" : "#38bdf8"} lineWidth={4} />
      <Line points={[[-2.5, startY, 0], [0.2, startY, 0]]} color="#fbbf24" lineWidth={1.5} dashed dashSize={0.15} gapSize={0.1} />
      <Line points={[[0.2, endY, 0], [2.5, endY, 0]]} color="#34d399" lineWidth={1.5} dashed dashSize={0.15} gapSize={0.1} />

      <Html position={[-1.9, startY + 0.3, 0]} center>
        <div className="px-2 py-0.5 rounded bg-slate-900/90 text-amber-300 text-[11px] font-semibold whitespace-nowrap">
          Chất đầu (H₁)
        </div>
      </Html>
      <Html position={[1.8, endY + 0.3, 0]} center>
        <div className="px-2 py-0.5 rounded bg-slate-900/90 text-emerald-300 text-[11px] font-semibold whitespace-nowrap">
          Sản phẩm (H₂)
        </div>
      </Html>
      <Html position={[0, 2.25, 0]} center>
        <div className="px-3 py-1 rounded-full bg-slate-900/95 border border-white/15 text-xs font-bold text-white whitespace-nowrap">
          {reactionType === "exo"
            ? "Phản ứng TỎA NHIỆT: ΔrH°₂₉₈ < 0"
            : "Phản ứng THU NHIỆT: ΔrH°₂₉₈ > 0"}
          {hasCatalyst ? " (Có xúc tác: giảm Ea)" : " (Không xúc tác)"}
        </div>
      </Html>
    </group>
  );
}

function ReactionRateVessel({ tempC, concM, hasCatalyst }: { tempC: number; concM: number; hasCatalyst: boolean }) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const count = Math.min(48, Math.max(12, Math.round(concM * 18)));

  const seeds = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        vx: (((i * 19) % 10) - 5) * 0.35,
        vy: (((i * 23) % 10) - 5) * 0.35,
        vz: (((i * 29) % 10) - 5) * 0.35,
      })),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const speedFactor = (0.5 + tempC / 35) * (hasCatalyst ? 1.45 : 1.0);
    for (let i = 0; i < count; i++) {
      const m = meshRefs.current[i];
      if (!m) continue;
      const s = seeds[i];
      m.position.x = Math.sin(t * speedFactor * Math.abs(s.vx + 0.4) + i) * 1.25;
      m.position.y = Math.cos(t * speedFactor * Math.abs(s.vy + 0.4) + i * 1.3) * 1.25;
      m.position.z = Math.sin(t * speedFactor * Math.abs(s.vz + 0.4) + i * 0.7) * 1.25;
    }
  });

  return (
    <group>
      <mesh>
        <boxGeometry args={[3.0, 3.0, 3.0]} />
        <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.12} roughness={0.1} metalness={0.1} />
      </mesh>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#f472b6" : i % 3 === 1 ? "#38bdf8" : "#34d399"}
            emissive={hasCatalyst ? "#a855f7" : "#000000"}
            emissiveIntensity={hasCatalyst ? 0.3 : 0}
          />
        </mesh>
      ))}
      <Html position={[0, 1.9, 0]} center>
        <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-400/40 text-xs font-bold text-emerald-300 whitespace-nowrap">
          T = {tempC}°C | C = {concM.toFixed(1)}M | Xúc tác: {hasCatalyst ? "Có" : "Không"}
        </div>
      </Html>
    </group>
  );
}

export default function Scene(props: SceneProps) {
  return (
    <div className="w-full h-full bg-[#060913]">
      <Canvas camera={{ position: [0, 0.8, 5.6], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.65} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        {props.mode === "orbital" && <OrbitalCloud orbitalType={props.orbitalType} />}
        {props.mode === "enthalpy" && (
          <EnthalpyDiagram reactionType={props.reactionType} hasCatalyst={props.hasCatalyst} />
        )}
        {props.mode === "rate" && (
          <ReactionRateVessel tempC={props.tempC} concM={props.concM} hasCatalyst={props.hasCatalyst} />
        )}
        <OrbitControls enableDamping />
        <Environment files="/hdri/dikhololo_night_1k.hdr" />
      </Canvas>
    </div>
  );
}
