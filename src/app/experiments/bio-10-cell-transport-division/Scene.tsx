"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import * as THREE from "three";

interface SceneProps {
  mode: "transport" | "mitosis";
  tonicity: "isotonic" | "hypotonic" | "hypertonic";
  phase: "prophase" | "metaphase" | "anaphase" | "telophase";
}

function OsmosisCell({ tonicity }: { tonicity: "isotonic" | "hypotonic" | "hypertonic" }) {
  const cellRef = useRef<THREE.Mesh>(null);
  const targetScale = tonicity === "isotonic" ? 1.0 : tonicity === "hypotonic" ? 1.38 : 0.68;

  useFrame((_, delta) => {
    if (!cellRef.current) return;
    const s = THREE.MathUtils.lerp(cellRef.current.scale.x, targetScale, delta * 3);
    cellRef.current.scale.set(s, s, s);
  });

  return (
    <group>
      <mesh ref={cellRef}>
        <sphereGeometry args={[1.35, 36, 36]} />
        <meshPhysicalMaterial
          color={tonicity === "hypertonic" ? "#f43f5e" : "#10b981"}
          roughness={0.35}
          transparent
          opacity={0.78}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.45, 24, 24]} />
        <meshStandardMaterial color="#a855f7" />
      </mesh>

      <Html position={[0, 2.2, 0]} center>
        <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-emerald-400/40 text-xs font-bold text-emerald-200 whitespace-nowrap">
          {tonicity === "isotonic" && "Môi trường ĐẲNG TRƯƠNG: Nước ra = Nước vào"}
          {tonicity === "hypotonic" && "Môi trường NHƯỢC TRƯƠNG: Nước ồ ạt vào → Tế bào trương phồng"}
          {tonicity === "hypertonic" && "Môi trường ƯU TRƯƠNG: Nước thoát ra → Tế bào co nguyên sinh"}
        </div>
      </Html>
    </group>
  );
}

function MitosisStage({ phase }: { phase: "prophase" | "metaphase" | "anaphase" | "telophase" }) {
  const sep = phase === "anaphase" ? 0.95 : phase === "telophase" ? 1.45 : 0.08;
  const labels: Record<typeof phase, string> = {
    prophase: "Kỳ đầu: NST kép co xoắn, màng nhân tiêu biến",
    metaphase: "Kỳ giữa: NST kép xếp 1 hàng trên mặt phẳng xích đạo",
    anaphase: "Kỳ sau: Nhiễm sắc tử chị em tách nhau về 2 cực tế bào",
    telophase: "Kỳ cuối: NST dãn xoắn, hình thành 2 nhân mới",
  };

  return (
    <group>
      <mesh scale={[phase === "telophase" ? 1.55 : 1.25, 1.0, 1.0]}>
        <sphereGeometry args={[1.65, 32, 32]} />
        <meshPhysicalMaterial color="#34d399" transparent opacity={0.18} />
      </mesh>

      {[-0.75, -0.25, 0.25, 0.75].map((y, idx) => (
        <group key={idx} position={[0, y, 0]}>
          <mesh position={[-sep, 0, 0]} rotation={[0, 0, phase === "metaphase" ? 0 : 0.3]}>
            <capsuleGeometry args={[0.07, 0.34, 8, 12]} />
            <meshStandardMaterial color="#f472b6" />
          </mesh>
          <mesh position={[sep, 0, 0]} rotation={[0, 0, phase === "metaphase" ? 0 : -0.3]}>
            <capsuleGeometry args={[0.07, 0.34, 8, 12]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
        </group>
      ))}

      <Html position={[0, 2.2, 0]} center>
        <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-purple-400/40 text-xs font-bold text-purple-200 whitespace-nowrap">
          {labels[phase]}
        </div>
      </Html>
    </group>
  );
}

export default function Scene({ mode, tonicity, phase }: SceneProps) {
  return (
    <div className="w-full h-full bg-[#060913]">
      <Canvas camera={{ position: [0, 0.5, 5.6], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        {mode === "transport" ? <OsmosisCell tonicity={tonicity} /> : <MitosisStage phase={phase} />}
        <OrbitControls enableDamping />
        <Environment files="/hdri/dikhololo_night_1k.hdr" />
      </Canvas>
    </div>
  );
}
