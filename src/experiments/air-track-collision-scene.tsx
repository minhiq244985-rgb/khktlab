"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export interface AirTrackData {
  x1: number;
  x2: number;
  v1: number;
  v2: number;
  p1: number;
  p2: number;
  pTotal: number;
  ke1: number;
  ke2: number;
  keTotal: number;
  hasCollided: boolean;
  elapsedTime: number;
}

interface AirTrackSceneProps {
  onDataChange?: (data: AirTrackData) => void;
  m1?: number; // kg
  m2?: number; // kg
  v1Init?: number; // m/s
  v2Init?: number; // m/s
  collisionType?: "elastic" | "inelastic";
  airFriction?: number; // hệ số cản khi tắt/giảm đệm khí
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
}

export function AirTrackCollisionSceneComponent({
  onDataChange,
  m1 = 0.4,
  m2 = 0.4,
  v1Init = 1.2,
  v2Init = 0,
  collisionType = "elastic",
  airFriction = 0,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
}: AirTrackSceneProps) {
  const cart1Ref = useRef<THREE.Group>(null);
  const cart2Ref = useRef<THREE.Group>(null);

  const TRACK_HALF = 4.6; // Chiều dài băng đệm khí 3D: -4.6 -> +4.6 (tương ứng ~2m)
  const CART_HALF_W = 0.42;

  const stateRef = useRef({
    x1: -2.4,
    x2: 0.6,
    v1: v1Init,
    v2: v2Init,
    collided: false,
    stuck: false,
    t: 0,
    timerAccum: 0,
  });

  useEffect(() => {
    stateRef.current = {
      x1: -2.4,
      x2: 0.6,
      v1: v1Init,
      v2: v2Init,
      collided: false,
      stuck: false,
      t: 0,
      timerAccum: 0,
    };
  }, [resetTrigger, m1, m2, v1Init, v2Init, collisionType, airFriction]);

  useFrame((_, delta) => {
    const rawDt = Math.min(delta, 0.02);
    const dt = rawDt * simulationSpeed;
    const st = stateRef.current;

    if (isPlaying && dt > 0) {
      const steps = 6;
      const subDt = dt / steps;
      const scalePos = 2.6; // tỉ lệ vận tốc m/s sang đơn vị/giây trên thanh 3D

      for (let i = 0; i < steps; i++) {
        st.t += subDt;

        // Ma sát đệm khí (nếu airFriction > 0)
        if (airFriction > 0) {
          const decel = airFriction * 9.81 * subDt;
          st.v1 = Math.abs(st.v1) <= decel ? 0 : st.v1 - Math.sign(st.v1) * decel;
          st.v2 = Math.abs(st.v2) <= decel ? 0 : st.v2 - Math.sign(st.v2) * decel;
        }

        st.x1 += st.v1 * scalePos * subDt;
        st.x2 += st.v2 * scalePos * subDt;

        // Kiểm tra va chạm giữa 2 xe trượt
        const minGap = CART_HALF_W * 2;
        if (st.x2 - st.x1 <= minGap) {
          const overlap = minGap - (st.x2 - st.x1);
          st.x1 -= overlap * 0.5;
          st.x2 += overlap * 0.5;

          if (!st.stuck && st.v1 > st.v2) {
            st.collided = true;
            if (collisionType === "elastic") {
              // Va chạm đàn hồi 1D: bảo toàn động lượng & động năng
              const newV1 = ((m1 - m2) * st.v1 + 2 * m2 * st.v2) / (m1 + m2);
              const newV2 = ((m2 - m1) * st.v2 + 2 * m1 * st.v1) / (m1 + m2);
              st.v1 = newV1;
              st.v2 = newV2;
            } else {
              // Va chạm mềm (dính vào nhau)
              const vCommon = (m1 * st.v1 + m2 * st.v2) / (m1 + m2);
              st.v1 = vCommon;
              st.v2 = vCommon;
              st.stuck = true;
            }
          }
        }

        // Chạm đầu mút đệm khí thì dừng lại
        if (st.x1 < -TRACK_HALF + CART_HALF_W) {
          st.x1 = -TRACK_HALF + CART_HALF_W;
          st.v1 = 0;
          if (st.stuck) st.v2 = 0;
        }
        if (st.x2 > TRACK_HALF - CART_HALF_W) {
          st.x2 = TRACK_HALF - CART_HALF_W;
          st.v2 = 0;
          if (st.stuck) st.v1 = 0;
        }
      }
    }

    if (cart1Ref.current) cart1Ref.current.position.x = st.x1;
    if (cart2Ref.current) cart2Ref.current.position.x = st.x2;

    st.timerAccum += rawDt;
    if (st.timerAccum >= 0.05) {
      st.timerAccum = 0;
      const p1 = m1 * st.v1;
      const p2 = m2 * st.v2;
      const ke1 = 0.5 * m1 * st.v1 * st.v1;
      const ke2 = 0.5 * m2 * st.v2 * st.v2;

      onDataChange?.({
        x1: st.x1,
        x2: st.x2,
        v1: st.v1,
        v2: st.v2,
        p1,
        p2,
        pTotal: p1 + p2,
        ke1,
        ke2,
        keTotal: ke1 + ke2,
        hasCollided: st.collided,
        elapsedTime: st.t,
      });
    }
  });

  return (
    <group>
      <ambientLight intensity={0.55} />
      <directionalLight position={[8, 14, 10]} intensity={1.1} castShadow />
      <pointLight position={[0, 5, 5]} intensity={0.4} color="#38bdf8" />

      {/* Mặt bàn thí nghiệm */}
      <mesh position={[0, -0.75, 0]} receiveShadow>
        <boxGeometry args={[12, 0.25, 4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
      <gridHelper args={[28, 28, "#1e293b", "#0f172a"]} position={[0, -0.88, 0]} />

      {/* Băng đệm khí tiết diện tam giác */}
      <mesh position={[0, -0.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, TRACK_HALF * 2 + 0.4, 3]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.75} roughness={0.25} />
      </mesh>

      {/* Chân đế băng đệm khí */}
      {[-3.6, 3.6].map((px) => (
        <mesh key={px} position={[px, -0.52, 0]}>
          <boxGeometry args={[0.35, 0.25, 0.9]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Máy thổi khí (Air Blower) ở đầu trái */}
      <group position={[-TRACK_HALF - 0.75, -0.25, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.38, 0.42, 0.75, 20]} />
          <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.3} />
        </mesh>
        <Html position={[0, 0.7, 0]} center>
          <div className="text-[10px] text-sky-300 bg-black/75 px-2 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
            Máy thổi đệm khí {airFriction === 0 ? "(Bật)" : "(Giảm khí)"}
          </div>
        </Html>
      </group>

      {/* Hai cổng quang điện trên băng đệm khí */}
      {[-1.5, 1.8].map((gx, i) => (
        <group key={gx} position={[gx, 0.25, 0]}>
          <mesh position={[0, 0, -0.42]}>
            <boxGeometry args={[0.12, 0.85, 0.08]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <boxGeometry args={[0.14, 0.08, 0.85]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0, 0, 0.42]}>
            <boxGeometry args={[0.12, 0.85, 0.08]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <Html position={[0, 0.75, 0]} center>
            <div className="text-[9px] text-emerald-300 bg-black/70 px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
              Cổng quang {i + 1}
            </div>
          </Html>
        </group>
      ))}

      {/* Xe trượt 1 (Màu xanh dương) */}
      <group ref={cart1Ref} position={[-2.4, 0.06, 0]}>
        <mesh castShadow>
          <boxGeometry args={[CART_HALF_W * 2, 0.26, 0.56]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.25} />
        </mesh>
        {/* Tấm chắn sáng chữ U */}
        <mesh position={[0, 0.26, 0]}>
          <boxGeometry args={[0.18, 0.26, 0.04]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Đầu va chạm (lò xo hoặc băng nhám Velcro) */}
        <mesh position={[CART_HALF_W + 0.03, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 12]} />
          <meshStandardMaterial color={collisionType === "elastic" ? "#facc15" : "#ef4444"} />
        </mesh>
        <Html position={[0, 0.65, 0]} center>
          <div className="text-[10px] font-bold text-blue-300 bg-black/80 px-2 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
            Xe 1 ({m1.toFixed(2)} kg)
          </div>
        </Html>
      </group>

      {/* Xe trượt 2 (Màu cam/đỏ) */}
      <group ref={cart2Ref} position={[0.6, 0.06, 0]}>
        <mesh castShadow>
          <boxGeometry args={[CART_HALF_W * 2, 0.26, 0.56]} />
          <meshStandardMaterial color="#f97316" metalness={0.5} roughness={0.25} />
        </mesh>
        {/* Tấm chắn sáng */}
        <mesh position={[0, 0.26, 0]}>
          <boxGeometry args={[0.18, 0.26, 0.04]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Đầu va chạm */}
        <mesh position={[-CART_HALF_W - 0.03, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 12]} />
          <meshStandardMaterial color={collisionType === "elastic" ? "#facc15" : "#ef4444"} />
        </mesh>
        <Html position={[0, 0.65, 0]} center>
          <div className="text-[10px] font-bold text-orange-300 bg-black/80 px-2 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
            Xe 2 ({m2.toFixed(2)} kg)
          </div>
        </Html>
      </group>
    </group>
  );
}

export default AirTrackCollisionSceneComponent;
