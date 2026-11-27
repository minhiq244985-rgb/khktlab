"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import * as THREE from "three";

interface SceneProps {
  lightLux: number;
  co2Ppm: number;
  heartRate: number;
}

export default function Scene({ lightLux, co2Ppm, heartRate }: SceneProps) {
  const o2Ref = useRef<THREE.Group>(null);
  const photoRate = Math.min(100, Math.round((lightLux / 100) * (co2Ppm / 600) * 100));

  useFrame(({ clock }) => {
    if (o2Ref.current) {
      o2Ref.current.position.y = ((clock.getElapsedTime() * (0.4 + photoRate / 70)) % 2.0) - 0.5;
    }
  });

  return (
    <div className="w-full h-full bg-[#060913]">
      <Canvas camera={{ position: [0, 1.1, 6.0], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.4 + lightLux / 120} />
        <directionalLight position={[4, 7, 5]} intensity={0.6 + lightLux / 60} color="#fef08a" />

        <mesh scale={[1.8, 0.85, 1.1]}>
          <sphereGeometry args={[1.35, 32, 32]} />
          <meshPhysicalMaterial color="#10b981" transparent opacity={0.35} />
        </mesh>

        {[-1.0, 0, 1.0].map((x, colIdx) => (
          <group key={colIdx} position={[x, -0.1, 0]}>
            {[0, 0.22, 0.44].map((y, rowIdx) => (
              <mesh key={rowIdx} position={[0, y, 0]}>
                <cylinderGeometry args={[0.38, 0.38, 0.14, 24]} />
                <meshStandardMaterial color="#059669" />
              </mesh>
            ))}
          </group>
        ))}

        <group ref={o2Ref}>
          {[-0.8, 0.2, 0.9].map((x, idx) => (
            <mesh key={idx} position={[x, 0.8 + idx * 0.2, 0.3]}>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
            </mesh>
          ))}
        </group>

        <Html position={[0, 2.05, 0]} center>
          <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-emerald-400/40 text-xs font-bold text-emerald-200 whitespace-nowrap">
            Cường độ quang hợp: {photoRate}% • Nhịp tim tuần hoàn: {heartRate} nhịp/phút
          </div>
        </Html>

        <OrbitControls enableDamping />
        <Environment files="/hdri/dikhololo_night_1k.hdr" />
      </Canvas>
    </div>
  );
}
