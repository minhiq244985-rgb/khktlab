"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";

export interface EmfCircuitData {
  emf: number; // V
  internalResistance: number; // Ω
  externalResistance: number; // Ω
  current: number; // A
  terminalVoltage: number; // V
  internalDrop: number; // V (I*r)
  efficiency: number; // %
  switchClosed: boolean;
}

interface EmfSceneProps {
  onDataChange?: (data: EmfCircuitData) => void;
  emf?: number;
  internalResistance?: number;
  externalResistance?: number;
  switchClosed?: boolean;
  isPlaying?: boolean;
  simulationSpeed?: number;
}

export function EmfInternalResistanceSceneComponent({
  onDataChange,
  emf = 6.0,
  internalResistance = 1.2,
  externalResistance = 4.0,
  switchClosed = true,
  isPlaying = true,
  simulationSpeed = 1,
}: EmfSceneProps) {
  const chargesRef = useRef<THREE.InstancedMesh>(null);
  const wiperRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);
  const timerRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Tính toán định luật Ohm cho toàn mạch: I = E / (R + r), U = E - I*r
  const current = switchClosed ? emf / (externalResistance + internalResistance) : 0;
  const terminalVoltage = switchClosed ? emf - current * internalResistance : emf;
  const internalDrop = switchClosed ? current * internalResistance : 0;
  const efficiency = switchClosed ? (terminalVoltage / emf) * 100 : 100;

  // Chu vi mạch hình chữ nhật: x từ -3.2 đến +3.2, z từ -2.0 đến +2.0
  const W = 3.2;
  const D = 2.0;
  const NUM_CHARGES = 36;

  const getPointOnLoop = (u: number): [number, number, number] => {
    const t = ((u % 1) + 1) % 1;
    if (t < 0.25) {
      const k = t / 0.25;
      return [-W + k * (2 * W), 0.12, -D];
    } else if (t < 0.5) {
      const k = (t - 0.25) / 0.25;
      return [W, 0.12, -D + k * (2 * D)];
    } else if (t < 0.75) {
      const k = (t - 0.5) / 0.25;
      return [W - k * (2 * W), 0.12, D];
    } else {
      const k = (t - 0.75) / 0.25;
      return [-W, 0.12, D - k * (2 * D)];
    }
  };

  useFrame((_, delta) => {
    const rawDt = Math.min(delta, 0.02);
    if (isPlaying && switchClosed) {
      progressRef.current += rawDt * simulationSpeed * current * 0.12;
    }

    if (chargesRef.current) {
      for (let i = 0; i < NUM_CHARGES; i++) {
        const u = i / NUM_CHARGES + progressRef.current;
        const [x, y, z] = getPointOnLoop(u);
        dummy.position.set(x, y, z);
        dummy.scale.setScalar(switchClosed ? 1 : 0.6);
        dummy.updateMatrix();
        chargesRef.current.setMatrixAt(i, dummy.matrix);
      }
      chargesRef.current.instanceMatrix.needsUpdate = true;
    }

    // Vị trí con chạy biến trở R
    if (wiperRef.current) {
      const ratio = THREE.MathUtils.clamp((externalResistance - 0.5) / 19.5, 0, 1);
      wiperRef.current.position.x = -1.3 + ratio * 2.6;
    }

    timerRef.current += rawDt;
    if (timerRef.current >= 0.06) {
      timerRef.current = 0;
      onDataChange?.({
        emf,
        internalResistance,
        externalResistance,
        current,
        terminalVoltage,
        internalDrop,
        efficiency,
        switchClosed,
      });
    }
  });

  return (
    <group>
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 12, 8]} intensity={1.1} />

      {/* Bảng mạch thực hành */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[8.5, 0.2, 5.6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.75} />
      </mesh>
      <gridHelper args={[24, 24, "#1e293b", "#0f172a"]} position={[0, -0.21, 0]} />

      {/* Dây dẫn đồng bao quanh mạch */}
      <Line
        points={[
          [-W, 0.08, -D],
          [W, 0.08, -D],
          [W, 0.08, D],
          [-W, 0.08, D],
          [-W, 0.08, -D],
        ]}
        color="#f59e0b"
        lineWidth={4}
      />

      {/* Dây mắc Vôn kế song song với hai cực nguồn điện */}
      <Line
        points={[
          [-1.5, 0.08, -D],
          [-1.5, 0.08, -D - 1.0],
          [1.5, 0.08, -D - 1.0],
          [1.5, 0.08, -D],
        ]}
        color="#38bdf8"
        lineWidth={2.5}
      />

      {/* Hạt tải điện dịch chuyển trong mạch */}
      <instancedMesh ref={chargesRef} args={[undefined, undefined, NUM_CHARGES]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#38bdf8" />
      </instancedMesh>

      {/* Nguồn điện (Pin / Ắc quy có E, r) ở cạnh trên */}
      <group position={[0, 0.35, -D]}>
        <mesh castShadow>
          <boxGeometry args={[2.2, 0.65, 0.85]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.35} />
        </mesh>
        {/* Cực dương (+) và cực âm (-) */}
        <mesh position={[0.7, 0.42, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.2, 16]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <mesh position={[-0.7, 0.42, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.2, 16]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        <Html position={[0, 0.85, 0]} center>
          <div className="text-[11px] font-bold text-amber-300 bg-black/85 border border-amber-500/40 px-2.5 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
            Nguồn điện: E = {emf.toFixed(1)}V | r = {internalResistance.toFixed(1)}Ω
          </div>
        </Html>
      </group>

      {/* Vôn kế số (V) mắc hai đầu nguồn điện */}
      <group position={[0, 0.35, -D - 1.0]}>
        <mesh castShadow>
          <boxGeometry args={[1.3, 0.65, 0.7]} />
          <meshStandardMaterial color="#0284c7" metalness={0.4} roughness={0.4} />
        </mesh>
        <Html position={[0, 0.65, 0]} center>
          <div className="text-[11px] font-mono font-bold text-sky-200 bg-slate-950/90 border border-sky-400 px-2 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
            Vôn kế: U = {terminalVoltage.toFixed(2)} V
          </div>
        </Html>
      </group>

      {/* Ampe kế số (A) mắc nối tiếp ở nhánh phải */}
      <group position={[W, 0.35, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.85, 0.65, 1.1]} />
          <meshStandardMaterial color="#059669" metalness={0.4} roughness={0.4} />
        </mesh>
        <Html position={[1.25, 0.35, 0]} center>
          <div className="text-[11px] font-mono font-bold text-emerald-200 bg-slate-950/90 border border-emerald-400 px-2 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
            Ampe kế: I = {current.toFixed(2)} A
          </div>
        </Html>
      </group>

      {/* Biến trở con chạy R ở cạnh dưới */}
      <group position={[0, 0.32, D]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.28, 0.28, 2.8, 20]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh ref={wiperRef} position={[0, 0.38, 0]}>
          <boxGeometry args={[0.25, 0.25, 0.45]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <Html position={[0, 0.85, 0]} center>
          <div className="text-[11px] font-bold text-purple-300 bg-black/85 px-2.5 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
            Biến trở R = {externalResistance.toFixed(1)} Ω
          </div>
        </Html>
      </group>

      {/* Khóa K ở nhánh trái */}
      <group position={[-W, 0.2, 0]}>
        <mesh>
          <boxGeometry args={[0.45, 0.2, 0.9]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[switchClosed ? 0 : 0.55, 0, 0]}>
          <boxGeometry args={[0.1, 0.08, 0.75]} />
          <meshStandardMaterial color={switchClosed ? "#22c55e" : "#ef4444"} />
        </mesh>
        <Html position={[-1.1, 0.35, 0]} center>
          <div className="text-[10px] font-semibold text-gray-200 bg-black/80 px-2 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
            Khóa K: {switchClosed ? "Đóng" : "Ngắt (U = E)"}
          </div>
        </Html>
      </group>
    </group>
  );
}

export default EmfInternalResistanceSceneComponent;
