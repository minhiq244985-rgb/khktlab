"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export type CalorimetryMode = "specific_heat" | "fusion" | "vaporization";

export interface CalorimetryData {
  mode: CalorimetryMode;
  temperature: number; // °C
  elapsedTime: number; // s
  suppliedEnergy: number; // J (Q = P * t)
  phaseState: "Rắn (Nước đá)" | "Đang nóng chảy (0°C)" | "Lỏng (Nước)" | "Đang sôi (100°C)";
  meltedFraction: number; // 0 -> 1
  vaporizedMass: number; // kg
  measuredConstant: number | null;
}

interface CalorimetrySceneProps {
  onDataChange?: (data: CalorimetryData) => void;
  mode?: CalorimetryMode;
  mass?: number; // kg (0.1 -> 0.5)
  heaterPower?: number; // W (50 -> 500)
  initialTemp?: number; // °C
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
}

// Hằng số chuẩn SGK Vật lí 12
const C_WATER = 4180; // J/(kg.K)
const C_ICE = 2100; // J/(kg.K)
const LAMBDA_ICE = 334000; // J/kg (nhiệt nóng chảy riêng nước đá)
const L_WATER = 2260000; // J/kg (nhiệt hóa hơi riêng của nước)

export function CalorimetrySceneComponent({
  onDataChange,
  mode = "specific_heat",
  mass = 0.25,
  heaterPower = 200,
  initialTemp = 25,
  isPlaying = true,
  simulationSpeed = 5,
  resetTrigger = 0,
}: CalorimetrySceneProps) {
  const bubblesRef = useRef<THREE.InstancedMesh>(null);
  const stirrerRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const bubbleSeeds = useMemo(
    () =>
      Array.from({ length: 30 }, () => ({
        x: (Math.random() - 0.5) * 1.4,
        z: (Math.random() - 0.5) * 1.4,
        offset: Math.random() * 10,
        speed: 0.7 + Math.random() * 0.8,
      })),
    []
  );

  const stateRef = useRef({
    t: 0,
    temp: initialTemp,
    qTotal: 0,
    meltedMass: 0,
    vaporizedMass: 0,
    timerAccum: 0,
  });

  useEffect(() => {
    const startT =
      mode === "fusion" ? -10 : mode === "vaporization" ? 80 : initialTemp;
    stateRef.current = {
      t: 0,
      temp: startT,
      qTotal: 0,
      meltedMass: 0,
      vaporizedMass: 0,
      timerAccum: 0,
    };
  }, [resetTrigger, mode, mass, heaterPower, initialTemp]);

  useFrame((_, delta) => {
    const rawDt = Math.min(delta, 0.02);
    const dt = rawDt * simulationSpeed;
    const st = stateRef.current;

    if (isPlaying && dt > 0) {
      const steps = 5;
      const subDt = dt / steps;
      for (let i = 0; i < steps; i++) {
        st.t += subDt;
        const dQ = heaterPower * subDt;
        st.qTotal += dQ;

        if (mode === "specific_heat") {
          // Đun nước lỏng từ initialTemp lên tối đa 100°C
          if (st.temp < 100) {
            st.temp = Math.min(100, st.temp + dQ / (mass * C_WATER));
          }
        } else if (mode === "fusion") {
          // Nước đá từ -10°C -> 0°C -> nóng chảy hoàn toàn -> ấm lên
          if (st.temp < 0) {
            st.temp = Math.min(0, st.temp + dQ / (mass * C_ICE));
          } else if (st.meltedMass < mass) {
            st.meltedMass = Math.min(mass, st.meltedMass + dQ / LAMBDA_ICE);
            st.temp = 0;
          } else if (st.temp < 100) {
            st.temp = Math.min(100, st.temp + dQ / (mass * C_WATER));
          }
        } else if (mode === "vaporization") {
          // Nước từ 80°C -> 100°C -> sôi và hóa hơi
          if (st.temp < 100) {
            st.temp = Math.min(100, st.temp + dQ / (mass * C_WATER));
          } else if (st.vaporizedMass < mass * 0.8) {
            st.temp = 100;
            st.vaporizedMass = Math.min(mass * 0.8, st.vaporizedMass + dQ / L_WATER);
          }
        }
      }
    }

    // Khuấy đều nhiệt lượng kế
    if (stirrerRef.current && isPlaying) {
      stirrerRef.current.rotation.y += rawDt * 2.5;
    }

    // Bọt khí khi nước nóng hoặc sôi
    if (bubblesRef.current) {
      const boilingFactor = THREE.MathUtils.clamp((st.temp - 65) / 35, 0, 1);
      for (let i = 0; i < bubbleSeeds.length; i++) {
        const b = bubbleSeeds[i];
        if (boilingFactor <= 0.05) {
          dummy.scale.setScalar(0);
        } else {
          const yProg = ((st.t * b.speed + b.offset) % 1.8) - 0.9;
          dummy.position.set(b.x, yProg, b.z);
          dummy.scale.setScalar(0.03 + boilingFactor * 0.05);
        }
        dummy.updateMatrix();
        bubblesRef.current.setMatrixAt(i, dummy.matrix);
      }
      bubblesRef.current.instanceMatrix.needsUpdate = true;
    }

    st.timerAccum += rawDt;
    if (st.timerAccum >= 0.06) {
      st.timerAccum = 0;
      let phaseState: CalorimetryData["phaseState"] = "Lỏng (Nước)";
      if (mode === "fusion") {
        if (st.temp < 0) phaseState = "Rắn (Nước đá)";
        else if (st.meltedMass < mass) phaseState = "Đang nóng chảy (0°C)";
      } else if (mode === "vaporization" && st.temp >= 99.9) {
        phaseState = "Đang sôi (100°C)";
      }

      let measuredConstant: number | null = null;
      if (mode === "specific_heat" && st.temp - initialTemp > 1) {
        measuredConstant = st.qTotal / (mass * (st.temp - initialTemp));
      } else if (mode === "fusion" && st.meltedMass > 0.01) {
        measuredConstant = LAMBDA_ICE;
      } else if (mode === "vaporization" && st.vaporizedMass > 0.002) {
        measuredConstant = L_WATER;
      }

      onDataChange?.({
        mode,
        temperature: st.temp,
        elapsedTime: st.t,
        suppliedEnergy: st.qTotal,
        phaseState,
        meltedFraction: mode === "fusion" ? st.meltedMass / mass : 1,
        vaporizedMass: st.vaporizedMass,
        measuredConstant,
      });
    }
  });

  const st = stateRef.current;
  const meltedRatio = mode === "fusion" ? st.meltedMass / mass : 1;
  const remainingLiquidRatio = mode === "vaporization" ? Math.max(0.25, 1 - st.vaporizedMass / mass) : 1;

  return (
    <group>
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 12, 8]} intensity={1.1} />
      <pointLight position={[0, 1, 3]} intensity={0.6} color="#10b981" />

      {/* Mặt bàn phòng thí nghiệm */}
      <mesh position={[0, -1.65, 0]} receiveShadow>
        <boxGeometry args={[9, 0.25, 5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
      <gridHelper args={[24, 24, "#1e293b", "#0f172a"]} position={[0, -1.78, 0]} />

      {/* Vỏ ngoài nhiệt lượng kế cách nhiệt (mặt cắt trước trong suốt) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.35, 1.35, 2.9, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#cbd5e1"
          transparent
          opacity={0.28}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Đáy và nắp cách nhiệt */}
      <mesh position={[0, -1.45, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 0.16, 32]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 1.48, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 0.16, 32]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Khối nước lỏng bên trong */}
      <mesh position={[0, -1.35 + (2.1 * remainingLiquidRatio) / 2, 0]}>
        <cylinderGeometry args={[1.22, 1.22, 2.1 * remainingLiquidRatio, 28]} />
        <meshStandardMaterial
          color={st.temp > 75 ? "#38bdf8" : "#0284c7"}
          transparent
          opacity={0.55}
          roughness={0.15}
        />
      </mesh>

      {/* Các viên nước đá nổi (chế độ đo nhiệt nóng chảy riêng λ) */}
      {mode === "fusion" && meltedRatio < 0.99 && (
        <group position={[0, 0.45, 0]}>
          {[
            [-0.45, 0, -0.3],
            [0.42, 0.05, -0.25],
            [-0.1, -0.05, 0.45],
            [0.35, 0, 0.35],
          ].map(([ix, iy, iz], idx) => {
            const scale = Math.max(0.05, (1 - meltedRatio) * 0.52);
            return (
              <mesh key={idx} position={[ix, iy, iz]} scale={[scale, scale, scale]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.85} roughness={0.1} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Bọt khí sôi */}
      <instancedMesh ref={bubblesRef} args={[undefined, undefined, bubbleSeeds.length]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
      </instancedMesh>

      {/* Dây điện trở đun nóng công suất P */}
      <group position={[0, -0.65, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.07, 12, 32]} />
          <meshStandardMaterial
            color="#f97316"
            emissive="#ef4444"
            emissiveIntensity={isPlaying ? 0.85 : 0.1}
          />
        </mesh>
        {/* Hai thanh dẫn điện lên nắp */}
        {[-0.45, 0.45].map((px) => (
          <mesh key={px} position={[px, 1.15, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 2.3, 10]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Que khuấy nhiệt lượng kế */}
      <group ref={stirrerRef} position={[-0.65, 0.2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.03, 0.03, 2.9, 10]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0, -0.9, 0]}>
          <boxGeometry args={[0.45, 0.08, 0.04]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </group>

      {/* Nhiệt kế điện tử cắm xuyên nắp */}
      <group position={[0.68, 0.65, 0]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.04, 2.7, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.7} />
        </mesh>
        <Html position={[0.95, 1.25, 0]} center>
          <div className="px-2.5 py-1 rounded bg-slate-950/90 border border-emerald-400 text-emerald-300 font-mono text-xs font-bold whitespace-nowrap pointer-events-none select-none">
            🌡️ T = {st.temp.toFixed(1)} °C
          </div>
        </Html>
      </group>

      {/* Oát kế & Đồng hồ bấm giờ đặt bên cạnh */}
      <group position={[2.65, -0.95, 0.3]} rotation={[0, -0.35, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.6, 1.1, 1.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <Html position={[0, 0.1, 0.58]} center distanceFactor={7}>
          <div className="text-center font-mono select-none pointer-events-none">
            <div className="text-[9px] text-amber-300">OÁT KẾ & ĐỒNG HỒ</div>
            <div className="text-xs font-bold text-white">P = {heaterPower} W</div>
            <div className="text-xs text-sky-300">t = {st.t.toFixed(1)} s</div>
          </div>
        </Html>
      </group>
    </group>
  );
}

export default CalorimetrySceneComponent;
