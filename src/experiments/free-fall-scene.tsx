"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";

export interface FreeFallData {
  elapsedTime: number;
  fallDistance: number;
  instantVelocity: number;
  gate1Time: number | null;
  gate2Time: number | null;
  deltaT: number | null;
  measuredG: number | null;
  isLanded: boolean;
}

interface FreeFallSceneProps {
  onDataChange?: (data: FreeFallData) => void;
  trueG?: number;
  gate1Pos?: number; // mét (0.05 -> 0.50)
  gate2Pos?: number; // mét (0.20 -> 1.00)
  ballDiameter?: number; // mm (15 -> 30)
  enableNoise?: boolean;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
}

export function FreeFallSceneComponent({
  onDataChange,
  trueG = 9.81,
  gate1Pos = 0.2,
  gate2Pos = 0.8,
  ballDiameter = 20,
  enableNoise = true,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
}: FreeFallSceneProps) {
  const ballRef = useRef<THREE.Mesh>(null);
  const beam1Ref = useRef<THREE.Mesh>(null);
  const beam2Ref = useRef<THREE.Mesh>(null);

  // Tỉ lệ hiển thị 3D: 1 mét thực tế = 6 đơn vị 3D; đỉnh thả ở y = 3.5, đế chạm ở y = -2.8
  const SCALE = 6.0;
  const TOP_Y = 3.4;
  const MAX_DROP = 1.05; // m

  const stateRef = useRef({
    t: 0,
    s: 0,
    v: 0,
    t1: null as number | null,
    t2: null as number | null,
    noise1: 0,
    noise2: 0,
    landed: false,
    timerAccum: 0,
  });

  useEffect(() => {
    stateRef.current = {
      t: 0,
      s: 0,
      v: 0,
      t1: null,
      t2: null,
      noise1: enableNoise ? (Math.random() - 0.5) * 0.0016 : 0,
      noise2: enableNoise ? (Math.random() - 0.5) * 0.0016 : 0,
      landed: false,
      timerAccum: 0,
    };
  }, [resetTrigger, gate1Pos, gate2Pos, trueG, enableNoise]);

  useFrame((_, delta) => {
    const rawDt = Math.min(delta, 0.02);
    const dt = rawDt * simulationSpeed;
    const st = stateRef.current;

    if (isPlaying && !st.landed && dt > 0) {
      const subSteps = 6;
      const subDt = dt / subSteps;
      for (let i = 0; i < subSteps; i++) {
        if (st.landed) break;
        st.t += subDt;
        st.s = 0.5 * trueG * st.t * st.t;
        st.v = trueG * st.t;

        if (st.t1 === null && st.s >= gate1Pos) {
          const exactT1 = Math.sqrt((2 * gate1Pos) / trueG);
          st.t1 = Math.max(0.001, exactT1 + st.noise1);
        }
        if (st.t2 === null && st.s >= gate2Pos) {
          const exactT2 = Math.sqrt((2 * gate2Pos) / trueG);
          st.t2 = Math.max((st.t1 ?? 0) + 0.005, exactT2 + st.noise2);
        }
        if (st.s >= MAX_DROP) {
          st.s = MAX_DROP;
          st.landed = true;
        }
      }
    }

    const ballRadius3D = (ballDiameter / 1000 / 2) * SCALE * 2.2;
    const ballY = TOP_Y - st.s * SCALE;

    if (ballRef.current) {
      ballRef.current.position.set(0, ballY, 0);
    }

    // Đổi màu tia hồng ngoại cổng quang khi bi đi qua
    const g1Y = TOP_Y - gate1Pos * SCALE;
    const g2Y = TOP_Y - gate2Pos * SCALE;
    const blocked1 = Math.abs(ballY - g1Y) <= ballRadius3D + 0.05;
    const blocked2 = Math.abs(ballY - g2Y) <= ballRadius3D + 0.05;

    if (beam1Ref.current) {
      const mat = beam1Ref.current.material as THREE.MeshBasicMaterial;
      mat.color.set(blocked1 ? "#ef4444" : "#22c55e");
    }
    if (beam2Ref.current) {
      const mat = beam2Ref.current.material as THREE.MeshBasicMaterial;
      mat.color.set(blocked2 ? "#ef4444" : "#22c55e");
    }

    st.timerAccum += rawDt;
    if (st.timerAccum >= 0.05) {
      st.timerAccum = 0;
      let measuredG: number | null = null;
      let deltaT: number | null = null;
      if (st.t1 !== null && st.t2 !== null && gate2Pos > gate1Pos) {
        deltaT = st.t2 - st.t1;
        // Từ s = 1/2 g t^2 => t2 - t1 = sqrt(2*s2/g) - sqrt(2*s1/g)
        const factor = Math.sqrt(2 * gate2Pos) - Math.sqrt(2 * gate1Pos);
        measuredG = (factor / deltaT) ** 2;
      }

      onDataChange?.({
        elapsedTime: st.t,
        fallDistance: st.s,
        instantVelocity: st.v,
        gate1Time: st.t1,
        gate2Time: st.t2,
        deltaT,
        measuredG,
        isLanded: st.landed,
      });
    }
  });

  const g1Y = TOP_Y - gate1Pos * SCALE;
  const g2Y = TOP_Y - gate2Pos * SCALE;
  const baseY = TOP_Y - MAX_DROP * SCALE - 0.15;
  const ballRadius3D = (ballDiameter / 1000 / 2) * SCALE * 2.2;

  return (
    <group>
      {/* Ánh sáng phòng thí nghiệm */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[8, 15, 10]} intensity={1.1} castShadow />
      <pointLight position={[-6, 5, 6]} intensity={0.4} color="#38bdf8" />

      {/* Mặt bàn & sàn phòng thí nghiệm */}
      <mesh position={[0, baseY - 0.15, 0]} receiveShadow>
        <boxGeometry args={[9, 0.3, 5]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.7} />
      </mesh>
      <gridHelper args={[30, 30, "#1e293b", "#0f172a"]} position={[0, baseY - 0.31, 0]} />

      {/* Đế gang nặng của giá đỡ */}
      <mesh position={[-0.7, baseY + 0.08, 0]} castShadow>
        <boxGeometry args={[2.4, 0.16, 1.8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Trụ đứng có thước chia milimét */}
      <mesh position={[-1.1, (TOP_Y + baseY) / 2 + 0.25, 0]} castShadow>
        <boxGeometry args={[0.24, TOP_Y - baseY + 0.7, 0.24]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.35} />
      </mesh>

      {/* Vạch chia mỗi 10 cm trên thước */}
      {Array.from({ length: 11 }).map((_, idx) => {
        const cm = idx * 10;
        const y = TOP_Y - (cm / 100) * SCALE;
        return (
          <group key={cm} position={[-0.97, y, 0.13]}>
            <mesh>
              <boxGeometry args={[0.14, 0.02, 0.02]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
            <Html position={[-0.45, 0, 0]} center>
              <span className="text-[9px] font-mono text-slate-300 bg-slate-900/80 px-1 rounded select-none pointer-events-none">
                {cm}cm
              </span>
            </Html>
          </group>
        );
      })}

      {/* Tay kẹp & Nam châm điện giữ bi thép tại s = 0 */}
      <group position={[0, TOP_Y + 0.28, 0]}>
        <mesh position={[-0.55, 0, 0]}>
          <boxGeometry args={[1.2, 0.14, 0.2]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.22, 20]} />
          <meshStandardMaterial color="#b45309" metalness={0.6} roughness={0.3} />
        </mesh>
        <Html position={[0.95, 0, 0]} center>
          <div className="text-[10px] font-semibold text-amber-300 bg-black/75 px-2 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
            Nam châm điện (s = 0)
          </div>
        </Html>
      </group>

      {/* Viên bi thép rơi tự do */}
      <mesh ref={ballRef} position={[0, TOP_Y, 0]} castShadow>
        <sphereGeometry args={[ballRadius3D, 24, 24]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Cổng quang điện 1 (E1) */}
      <PhotogateAssembly
        y={g1Y}
        label={`Cổng quang 1 (s₁ = ${(gate1Pos * 100).toFixed(0)} cm)`}
        color="#38bdf8"
        beamRef={beam1Ref}
      />

      {/* Cổng quang điện 2 (E2) */}
      <PhotogateAssembly
        y={g2Y}
        label={`Cổng quang 2 (s₂ = ${(gate2Pos * 100).toFixed(0)} cm)`}
        color="#a855f7"
        beamRef={beam2Ref}
      />

      {/* Đường gióng khoảng cách Δs = s2 - s1 */}
      <Line
        points={[[0.95, g1Y, 0], [0.95, g2Y, 0]]}
        color="#facc15"
        lineWidth={2}
        dashed
        dashSize={0.12}
        gapSize={0.08}
      />
      <Html position={[1.7, (g1Y + g2Y) / 2, 0]} center>
        <div className="text-[10px] font-mono text-yellow-300 bg-slate-900/85 border border-yellow-500/40 px-2 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
          Δs = {((gate2Pos - gate1Pos) * 100).toFixed(0)} cm
        </div>
      </Html>

      {/* Hộp đệm hứng bi dưới đáy */}
      <mesh position={[0, baseY + 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[0.45, 0.5, 0.12, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* Đồng hồ đo thời gian hiện số đặt trên bàn */}
      <group position={[2.6, baseY + 0.45, 0.6]} rotation={[0, -0.35, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.6, 0.9, 1.0]} />
          <meshStandardMaterial color="#0f172a" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.05, 0.51]}>
          <planeGeometry args={[1.35, 0.55]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
        <Html position={[0, 0.05, 0.53]} center distanceFactor={7}>
          <div className="text-center font-mono select-none pointer-events-none">
            <div className="text-[9px] text-slate-400">ĐỒNG HỒ HIỆN SỐ (s)</div>
            <div className="text-sm font-bold text-emerald-400">
              {stateRef.current.t2 !== null && stateRef.current.t1 !== null
                ? (stateRef.current.t2 - stateRef.current.t1).toFixed(4)
                : stateRef.current.t.toFixed(4)}
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

function PhotogateAssembly({
  y,
  label,
  color,
  beamRef,
}: {
  y: number;
  label: string;
  color: string;
  beamRef: React.RefObject<THREE.Mesh | null>;
}) {
  return (
    <group position={[0, y, 0]}>
      {/* Thanh ngang nối với trụ thước */}
      <mesh position={[-0.62, 0, 0]}>
        <boxGeometry args={[1.0, 0.1, 0.14]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Khung chữ U cổng quang */}
      <mesh position={[0, 0, -0.28]}>
        <boxGeometry args={[0.55, 0.14, 0.08]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0.24, 0, 0]}>
        <boxGeometry args={[0.08, 0.14, 0.6]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[-0.24, 0, 0]}>
        <boxGeometry args={[0.08, 0.14, 0.6]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Tia hồng ngoại */}
      <mesh ref={beamRef} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.44, 8]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      <Html position={[-1.95, 0, 0]} center>
        <div
          className="text-[10px] font-semibold px-2 py-0.5 rounded bg-black/80 whitespace-nowrap pointer-events-none select-none border"
          style={{ color, borderColor: color }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

export default FreeFallSceneComponent;
