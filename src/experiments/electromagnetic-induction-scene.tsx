"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";

export interface InductionData {
  magnetX: number; // m
  magnetSpeed: number; // m/s
  magneticFlux: number; // mWb
  dFluxDt: number; // mWb/s
  inducedEmf: number; // V
  inducedCurrent: number; // mA
  bulbBrightness: number; // 0 -> 1
}

interface InductionSceneProps {
  onDataChange?: (data: InductionData) => void;
  motionMode?: "oscillate" | "manual" | "generator";
  manualMagnetX?: number; // -3.2 -> +3.2
  oscillationFreq?: number; // Hz (0.2 -> 1.5)
  coilTurns?: number; // N (50 -> 400)
  magnetStrength?: number; // T (0.2 -> 1.2)
  reversePolarity?: boolean;
  isPlaying?: boolean;
  simulationSpeed?: number;
}

export function ElectromagneticInductionSceneComponent({
  onDataChange,
  motionMode = "oscillate",
  manualMagnetX = -2.2,
  oscillationFreq = 0.6,
  coilTurns = 200,
  magnetStrength = 0.6,
  reversePolarity = false,
  isPlaying = true,
  simulationSpeed = 1,
}: InductionSceneProps) {
  const magnetGroupRef = useRef<THREE.Group>(null);
  const needleRef = useRef<THREE.Mesh>(null);
  const bulbMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const stateRef = useRef({
    t: 0,
    prevX: manualMagnetX,
    prevFlux: 0,
    smoothEmf: 0,
    timerAccum: 0,
  });

  // Vẽ các vòng dây đồng của ống dây đặt cố định tại x = 0
  const coilRings = useMemo(() => {
    const count = Math.min(22, Math.max(8, Math.round(coilTurns / 18)));
    return Array.from({ length: count }, (_, i) => -0.9 + (i / (count - 1)) * 1.8);
  }, [coilTurns]);

  // Đường sức từ của nam châm thanh
  const fieldCurves = useMemo(() => {
    const curves: [number, number, number][][] = [];
    const radii = [0.42, 0.78, 1.15];
    for (const r of radii) {
      for (const sign of [-1, 1]) {
        const pts: [number, number, number][] = [];
        for (let i = 0; i <= 24; i++) {
          const a = (i / 24) * Math.PI;
          const x = -Math.cos(a) * (1.2 + r * 0.9);
          const y = sign * Math.sin(a) * r;
          pts.push([x, y, 0]);
        }
        curves.push(pts);
      }
    }
    return curves;
  }, []);

  useFrame((_, delta) => {
    const rawDt = Math.min(delta, 0.02);
    const dt = rawDt * simulationSpeed;
    const st = stateRef.current;

    let currentX = manualMagnetX;
    let rotAngle = 0;

    if (motionMode === "oscillate") {
      if (isPlaying && dt > 0) st.t += dt;
      currentX = -2.35 * Math.cos(2 * Math.PI * oscillationFreq * st.t);
    } else if (motionMode === "generator") {
      if (isPlaying && dt > 0) st.t += dt;
      currentX = -2.1;
      rotAngle = 2 * Math.PI * oscillationFreq * st.t;
    }

    const polaritySign = reversePolarity ? -1 : 1;

    // Từ thông Φ qua tiết diện ống dây (cực đại khi nam châm ở tâm x = 0)
    const coilArea = 0.012; // m^2
    const spatialFactor =
      motionMode === "generator"
        ? 0.65 * Math.cos(rotAngle)
        : Math.exp(-(currentX * currentX) / 1.45);
    const fluxWb = polaritySign * coilTurns * magnetStrength * coilArea * spatialFactor;

    const effDt = Math.max(rawDt, 0.008);
    const speed = (currentX - st.prevX) / effDt;
    const rawEmf = -(fluxWb - st.prevFlux) / effDt; // Định luật Faraday: e_c = -dΦ/dt
    st.smoothEmf = THREE.MathUtils.lerp(st.smoothEmf, rawEmf, 0.25);

    st.prevX = currentX;
    st.prevFlux = fluxWb;

    if (magnetGroupRef.current) {
      magnetGroupRef.current.position.x = currentX;
      magnetGroupRef.current.rotation.y = rotAngle;
    }

    // Kim điện kế G lệch theo chiều và độ lớn dòng điện cảm ứng
    const circuitR = 8.0; // Ω
    const inducedCurrentA = st.smoothEmf / circuitR;
    if (needleRef.current) {
      const targetAngle = THREE.MathUtils.clamp(-inducedCurrentA * 3.2, -0.75, 0.75);
      needleRef.current.rotation.z = THREE.MathUtils.lerp(needleRef.current.rotation.z, targetAngle, 0.25);
    }

    // Độ sáng bóng đèn tải nhỏ
    const brightness = THREE.MathUtils.clamp(Math.abs(st.smoothEmf) / 1.5, 0, 1);
    if (bulbMatRef.current) {
      bulbMatRef.current.emissiveIntensity = brightness * 2.2;
    }

    st.timerAccum += rawDt;
    if (st.timerAccum >= 0.05) {
      st.timerAccum = 0;
      onDataChange?.({
        magnetX: currentX,
        magnetSpeed: speed,
        magneticFlux: fluxWb * 1000, // mWb
        dFluxDt: -st.smoothEmf * 1000, // mWb/s
        inducedEmf: st.smoothEmf,
        inducedCurrent: inducedCurrentA * 1000, // mA
        bulbBrightness: brightness,
      });
    }
  });

  return (
    <group>
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 12, 10]} intensity={1.1} />
      <pointLight position={[0, 3, 4]} intensity={0.4} color="#10b981" />

      {/* Mặt bàn thí nghiệm */}
      <mesh position={[0, -1.75, 0]} receiveShadow>
        <boxGeometry args={[11, 0.25, 5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
      <gridHelper args={[26, 26, "#1e293b", "#0f172a"]} position={[0, -1.88, 0]} />

      {/* Ống dây đồng cố định tại x = 0 */}
      <group position={[0, 0, 0]}>
        {/* Lõi nhựa cách điện trong suốt */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.72, 0.72, 2.0, 28, 1, true]} />
          <meshPhysicalMaterial
            color="#94a3b8"
            transparent
            opacity={0.22}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Các vòng dây đồng */}
        {coilRings.map((rx, idx) => (
          <mesh key={idx} position={[rx, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.75, 0.035, 10, 32]} />
            <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.2} />
          </mesh>
        ))}

        {/* Chân đỡ ống dây */}
        <mesh position={[0, -1.18, 0]}>
          <boxGeometry args={[1.6, 0.9, 0.9]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        <Html position={[0, 1.25, 0]} center>
          <div className="text-[11px] font-bold text-amber-300 bg-black/80 px-2.5 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
            Cuộn dây dẫn kín ({coilTurns} vòng)
          </div>
        </Html>
      </group>

      {/* Nam châm vĩnh cửu N - S & Đường sức từ */}
      <group ref={magnetGroupRef} position={[-2.2, 0, 0]}>
        {/* Cực Bắc (N - Đỏ) và Cực Nam (S - Xanh) */}
        <mesh position={[reversePolarity ? -0.55 : 0.55, 0, 0]} castShadow>
          <boxGeometry args={[1.1, 0.42, 0.42]} />
          <meshStandardMaterial color="#ef4444" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[reversePolarity ? 0.55 : -0.55, 0, 0]} castShadow>
          <boxGeometry args={[1.1, 0.42, 0.42]} />
          <meshStandardMaterial color="#2563eb" metalness={0.4} roughness={0.3} />
        </mesh>

        {/* Đường sức từ bao quanh nam châm */}
        {fieldCurves.map((pts, idx) => (
          <Line key={idx} points={pts} color="#38bdf8" lineWidth={1.2} transparent opacity={0.45} />
        ))}

        <Html position={[0, 0.65, 0]} center>
          <div className="text-[10px] font-bold text-white bg-black/80 px-2 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
            {reversePolarity ? "N ← [Nam châm] → S" : "S ← [Nam châm] → N"}
          </div>
        </Html>
      </group>

      {/* Dây nối cuộn dây tới Điện kế G và Bóng đèn chỉ thị */}
      <Line
        points={[
          [-0.85, -0.75, 0],
          [-0.85, -1.5, 1.4],
          [2.4, -1.5, 1.4],
          [2.4, -0.75, 0.4],
        ]}
        color="#d97706"
        lineWidth={3}
      />
      <Line
        points={[
          [0.85, -0.75, 0],
          [0.85, -1.5, -1.2],
          [2.4, -1.5, -1.2],
          [2.4, -0.75, -0.4],
        ]}
        color="#d97706"
        lineWidth={3}
      />

      {/* Điện kế G (Galvanometer) đo dòng cảm ứng */}
      <group position={[2.65, -0.85, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 1.4, 0.9]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Mặt đồng hồ trắng */}
        <mesh position={[0, 0.15, 0.46]}>
          <planeGeometry args={[0.95, 0.85]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
        {/* Kim điện kế xoay quanh số 0 ở giữa */}
        <mesh ref={needleRef} position={[0, -0.15, 0.48]}>
          <boxGeometry args={[0.03, 0.58, 0.02]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <Html position={[0, 1.05, 0]} center>
          <div className="text-[11px] font-bold text-emerald-300 bg-black/85 border border-emerald-500/40 px-2 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
            Điện kế G (0 ở giữa)
          </div>
        </Html>
      </group>

      {/* Bóng đèn chỉ thị dòng điện cảm ứng */}
      <group position={[1.45, -1.35, 1.4]}>
        <mesh>
          <sphereGeometry args={[0.24, 16, 16]} />
          <meshStandardMaterial
            ref={bulbMatRef}
            color="#fef08a"
            emissive="#facc15"
            emissiveIntensity={0}
          />
        </mesh>
      </group>
    </group>
  );
}

export default ElectromagneticInductionSceneComponent;
