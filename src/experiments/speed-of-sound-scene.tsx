"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export interface SpeedOfSoundData {
  frequency: number;
  columnLength: number; // m
  temperature: number; // °C
  trueSpeed: number; // m/s
  wavelength: number; // m
  resonanceIntensity: number; // 0 -> 1
  isResonant: boolean;
  harmonicOrder: number | null;
}

interface SpeedOfSoundSceneProps {
  onDataChange?: (data: SpeedOfSoundData) => void;
  frequency?: number; // Hz (400 -> 1000)
  columnLength?: number; // m (0.10 -> 0.95)
  temperature?: number; // °C (15 -> 40)
  isPlaying?: boolean;
  simulationSpeed?: number;
}

export function SpeedOfSoundSceneComponent({
  onDataChange,
  frequency = 680,
  columnLength = 0.38,
  temperature = 25,
  isPlaying = true,
  simulationSpeed = 1,
}: SpeedOfSoundSceneProps) {
  const waveLineRef = useRef<THREE.Line>(null);
  const speakerConeRef = useRef<THREE.Mesh>(null);
  const phaseRef = useRef(0);
  const timerRef = useRef(0);

  // Tốc độ truyền âm phụ thuộc nhiệt độ không khí: v = 331.4 + 0.6 * t (°C)
  const trueSpeed = useMemo(() => 331.4 + 0.6 * temperature, [temperature]);
  const wavelength = useMemo(() => trueSpeed / frequency, [trueSpeed, frequency]);

  // Điều kiện cộng hưởng ống 1 đầu kín 1 đầu hở: l = (2k + 1) * λ / 4
  const { resonanceIntensity, isResonant, harmonicOrder } = useMemo(() => {
    const quarterLambda = wavelength / 4;
    const ratio = columnLength / quarterLambda; // cộng hưởng tại số lẻ 1, 3, 5, 7...
    const nearestOdd = Math.max(1, 2 * Math.round((ratio - 1) / 2) + 1);
    const diff = Math.abs(ratio - nearestOdd);
    const intensity = Math.exp(-(diff * diff) / 0.015);
    return {
      resonanceIntensity: intensity,
      isResonant: intensity > 0.88,
      harmonicOrder: intensity > 0.88 ? (nearestOdd + 1) / 2 : null,
    };
  }, [columnLength, wavelength]);

  // Kích thước hình học 3D: ống thủy tinh từ y = -3.0 đến y = +3.0 (tương ứng 1.00 m)
  const TUBE_TOP = 3.0;
  const TUBE_BOTTOM = -3.0;
  const TUBE_HEIGHT = 6.0; // 1 m = 6 đơn vị 3D

  const waveGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pts = new Float32Array(120 * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    const rawDt = Math.min(delta, 0.02);
    if (isPlaying) {
      phaseRef.current += rawDt * simulationSpeed * 14;
    }

    // Rung màng loa
    if (speakerConeRef.current) {
      const vib = isPlaying ? Math.sin(phaseRef.current * 2) * 0.03 : 0;
      speakerConeRef.current.position.y = TUBE_TOP + 0.38 + vib;
    }

    // Vẽ sóng dừng bên trong cột khí (chiều dài l từ TUBE_TOP xuống pistonY)
    const airLen3D = columnLength * TUBE_HEIGHT;
    const pistonY = TUBE_TOP - airLen3D;
    const kWave = (2 * Math.PI) / (wavelength * TUBE_HEIGHT);

    if (waveLineRef.current) {
      const attr = waveLineRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      const N = 120;
      const amp = 0.08 + resonanceIntensity * 0.34;
      const timeOsc = Math.cos(phaseRef.current);

      for (let i = 0; i < N; i++) {
        const u = i / (N - 1); // 0 tại mặt nước (nút sóng), 1 tại miệng ống
        const y = pistonY + u * airLen3D;
        const distFromNode = u * airLen3D;
        const x = amp * Math.sin(kWave * distFromNode) * timeOsc;
        arr[i * 3] = x;
        arr[i * 3 + 1] = y;
        arr[i * 3 + 2] = 0;
      }
      attr.needsUpdate = true;
    }

    timerRef.current += rawDt;
    if (timerRef.current >= 0.06) {
      timerRef.current = 0;
      onDataChange?.({
        frequency,
        columnLength,
        temperature,
        trueSpeed,
        wavelength,
        resonanceIntensity,
        isResonant,
        harmonicOrder,
      });
    }
  });

  const airLen3D = columnLength * TUBE_HEIGHT;
  const pistonY = TUBE_TOP - airLen3D;
  const waterHeight = Math.max(0.05, pistonY - TUBE_BOTTOM);

  return (
    <group>
      <ambientLight intensity={0.6} />
      <directionalLight position={[8, 12, 10]} intensity={1.1} />
      <pointLight position={[0, 2, 5]} intensity={0.5} color={isResonant ? "#22c55e" : "#a855f7"} />

      {/* Đế máy thí nghiệm */}
      <mesh position={[0, TUBE_BOTTOM - 0.25, 0]}>
        <boxGeometry args={[4.5, 0.3, 3.0]} />
        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.5} />
      </mesh>
      <gridHelper args={[26, 26, "#1e293b", "#0f172a"]} position={[0, TUBE_BOTTOM - 0.41, 0]} />

      {/* Ống cộng hưởng thủy tinh trong suốt */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.52, 0.52, TUBE_HEIGHT, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#bae6fd"
          transparent
          opacity={0.22}
          roughness={0.1}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Thước chia milimét dọc ống */}
      {Array.from({ length: 11 }).map((_, idx) => {
        const cm = idx * 10;
        const y = TUBE_TOP - (cm / 100) * TUBE_HEIGHT;
        return (
          <group key={cm} position={[-0.65, y, 0]}>
            <mesh>
              <boxGeometry args={[0.16, 0.02, 0.02]} />
              <meshBasicMaterial color="#94a3b8" />
            </mesh>
            <Html position={[-0.45, 0, 0]} center>
              <span className="text-[9px] font-mono text-slate-300 bg-slate-900/80 px-1 rounded select-none pointer-events-none">
                {cm}cm
              </span>
            </Html>
          </group>
        );
      })}

      {/* Cột nước bên dưới làm mặt phản xạ kín */}
      <mesh position={[0, TUBE_BOTTOM + waterHeight / 2, 0]}>
        <cylinderGeometry args={[0.49, 0.49, waterHeight, 24]} />
        <meshStandardMaterial color="#0284c7" transparent opacity={0.65} roughness={0.2} />
      </mesh>

      {/* Mặt phân cách nước - không khí (Nút sóng) */}
      <mesh position={[0, pistonY, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.04, 24]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <Html position={[1.45, pistonY, 0]} center>
        <div className="text-[10px] font-mono text-sky-300 bg-black/80 px-2 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
          Mặt nước: l = {(columnLength * 100).toFixed(1)} cm
        </div>
      </Html>

      {/* Sóng dừng biểu diễn bên trong cột khí */}
      <primitive
        object={
          new THREE.Line(
            waveGeometry,
            new THREE.LineBasicMaterial({ color: isResonanceColor(isResonant), linewidth: 2 })
          )
        }
        ref={waveLineRef}
      />

      {/* Loa phát âm tần số f đặt phía trên miệng ống */}
      <group position={[0, TUBE_TOP + 0.55, 0]}>
        <mesh>
          <cylinderGeometry args={[0.65, 0.45, 0.45, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh ref={speakerConeRef} position={[0, -0.17, 0]}>
          <coneGeometry args={[0.55, 0.25, 24]} />
          <meshStandardMaterial color={isResonant ? "#22c55e" : "#a855f7"} />
        </mesh>
        <Html position={[1.55, 0.1, 0]} center>
          <div className="text-[10px] font-semibold text-purple-300 bg-black/80 px-2 py-0.5 rounded whitespace-nowrap pointer-events-none select-none">
            Nguồn âm f = {frequency} Hz
          </div>
        </Html>
      </group>

      {/* Đồng hồ đo cường độ âm (Cộng hưởng) */}
      <Html position={[0, TUBE_TOP + 1.35, 0]} center>
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap pointer-events-none select-none ${
            isResonant
              ? "bg-emerald-500/30 border-emerald-400 text-emerald-200"
              : "bg-slate-900/80 border-slate-700 text-slate-300"
          }`}
        >
          {isResonant
            ? `🔊 ÂM TO CỰC ĐẠI (Cộng hưởng bậc ${harmonicOrder})`
            : `🔉 Cường độ âm cộng hưởng: ${(resonanceIntensity * 100).toFixed(0)}%`}
        </div>
      </Html>
    </group>
  );
}

function isResonanceColor(res: boolean) {
  return res ? 0x22c55e : 0xc084fc;
}

export default SpeedOfSoundSceneComponent;
