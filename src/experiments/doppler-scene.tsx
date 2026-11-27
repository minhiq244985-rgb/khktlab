"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface DopplerSceneProps {
  onDataChange?: (data: DopplerData) => void;
  sourceFrequency?: number;
  sourceVelocity?: number;
  sourceDirection?: number; // -1 (trái) đến 1 (phải), 0 = dừng
  autoOscillate?: boolean;
  observerPosition?: number; // vị trí x
  waveSpeed?: number;
  showWavefronts?: boolean;
  resetTrigger?: number;
}

export interface DopplerData {
  sourceFrequency: number;
  observedFrequency: number;
  dopplerShiftRatio: number;
  machNumber: number;
  waveSpeed: number;
  shiftType: "blueshift" | "redshift" | "none";
}

/**
 * Mô phỏng Hiệu ứng Doppler
 *
 * Vật lý: Dùng ref cho mọi trạng thái, cập nhật trạng thái React chỉ mỗi 8 khung hình.
 * Mặt sóng được tô màu dựa trên độ nén/giãn:
 * - Xanh lam: Nén phía trước nguồn chuyển động (tần số cảm nhận cao hơn)
 * - Đỏ: Giãn phía sau nguồn chuyển động (tần số cảm nhận thấp hơn)
 */
export function DopplerSceneComponent({
  onDataChange,
  sourceFrequency = 2,
  sourceVelocity = 5,
  sourceDirection = 0,
  autoOscillate = true,
  observerPosition = 15,
  waveSpeed = 10,
  showWavefronts = true,
  resetTrigger,
}: DopplerSceneProps) {
  // === CÁC REF CHO TRẠNG THÁI VẬT LÝ ===
  const timeRef = useRef(0);
  const frameCountRef = useRef(0);
  const sourceXRef = useRef(0);
  const sourceVelRef = useRef(0);

  // Sóng: mỗi sóng lưu vị trí phát (emissionX) và thời điểm phát (emissionTime)
  const wavesRef = useRef<Array<{ emissionX: number; emissionTime: number }>>([]);

  // Trạng thái React để hiển thị (chỉ cập nhật mỗi 8 khung hình)
  const [data, setData] = useState<DopplerData>({
    sourceFrequency,
    observedFrequency: sourceFrequency,
    dopplerShiftRatio: 1,
    machNumber: 0,
    waveSpeed,
    shiftType: "none",
  });

  // Xử lý đặt lại
  useEffect(() => {
    if (resetTrigger !== undefined) {
      timeRef.current = 0;
      frameCountRef.current = 0;
      sourceXRef.current = 0;
      sourceVelRef.current = 0;
      wavesRef.current = [];
    }
  }, [resetTrigger]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    frameCountRef.current++;

    // === CẬP NHẬT VẬT LÝ NGUỒN ===
    if (autoOscillate) {
      // Dao động tự động: nguồn chuyển động qua lại hình sin
      const oscillationSpeed = 0.5;
      const amplitude = 10;
      sourceXRef.current = Math.sin(timeRef.current * oscillationSpeed) * amplitude;
      sourceVelRef.current = Math.cos(timeRef.current * oscillationSpeed) * amplitude * oscillationSpeed;
    } else {
      // Điều khiển thủ công: nguồn di chuyển theo hướng nhập vào
      const maxPos = 18;
      sourceVelRef.current = sourceDirection * sourceVelocity;
      sourceXRef.current += sourceVelRef.current * delta;

      // Giới hạn trong biên
      if (sourceXRef.current > maxPos) sourceXRef.current = maxPos;
      if (sourceXRef.current < -maxPos) sourceXRef.current = -maxPos;
    }

    // === PHÁT SÓNG MỚI ===
    const waveInterval = 1 / sourceFrequency;
    const lastWave = wavesRef.current[wavesRef.current.length - 1];

    if (!lastWave || timeRef.current - lastWave.emissionTime >= waveInterval) {
      wavesRef.current.push({
        emissionX: sourceXRef.current,
        emissionTime: timeRef.current,
      });
      // Chỉ giữ 25 sóng gần nhất để tối ưu hiệu năng
      if (wavesRef.current.length > 25) {
        wavesRef.current.shift();
      }
    }

    // === CẬP NHẬT TRẠNG THÁI REACT MỖI 8 KHUNG HÌNH ===
    if (frameCountRef.current % 8 === 0) {
      // Tính dịch chuyển Doppler cho người quan sát
      const obsX = observerPosition;
      const srcX = sourceXRef.current;
      const srcVel = sourceVelRef.current;

      // Công thức Doppler: f_obs = f_src * (v_wave / (v_wave - v_source))
      // với v_source dương khi chuyển động VỀ PHÍA người quan sát
      const sourceToObserver = obsX - srcX;
      const sourceVelTowardObserver = sourceToObserver > 0 ? srcVel : -srcVel;

      let observedFreq: number;
      let shiftType: "blueshift" | "redshift" | "none";

      if (Math.abs(srcVel) < 0.1) {
        observedFreq = sourceFrequency;
        shiftType = "none";
      } else if (sourceVelTowardObserver > 0) {
        // Nguồn tiến lại gần người quan sát: dịch xanh
        observedFreq = sourceFrequency * (waveSpeed / (waveSpeed - sourceVelTowardObserver));
        shiftType = "blueshift";
      } else {
        // Nguồn ra xa người quan sát: dịch đỏ
        observedFreq = sourceFrequency * (waveSpeed / (waveSpeed + Math.abs(sourceVelTowardObserver)));
        shiftType = "redshift";
      }

      const machNumber = Math.abs(srcVel) / waveSpeed;
      const dopplerShiftRatio = observedFreq / sourceFrequency;

      const newData: DopplerData = {
        sourceFrequency,
        observedFrequency: Math.max(0, observedFreq),
        dopplerShiftRatio,
        machNumber,
        waveSpeed,
        shiftType,
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  // Lấy màu sóng theo hiệu ứng Doppler
  // Sóng phía trước nguồn (theo hướng chuyển động) bị nén -> xanh lam
  // Sóng phía sau nguồn bị giãn -> đỏ
  const getWaveColor = (waveEmissionX: number): string => {
    const currentSourceX = sourceXRef.current;
    const sourceVel = sourceVelRef.current;

    if (Math.abs(sourceVel) < 0.1) return "#22c55e"; // Xanh lá khi đứng yên

    const relativePos = waveEmissionX - currentSourceX;
    const movingRight = sourceVel > 0;

    // Sóng nằm "phía sau" nguồn nếu ở phía ngược hướng chuyển động
    const isBehind = movingRight ? relativePos < 0 : relativePos > 0;

    return isBehind ? "#ef4444" : "#3b82f6"; // Đỏ phía sau, xanh lam phía trước
  };

  return (
    <group>
      {/* Sàn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[80, 50]} />
        <meshStandardMaterial color="#050510" roughness={0.98} />
      </mesh>
      <gridHelper args={[80, 80, "#1a1a3e", "#0a0a1e"]} position={[0, -1.99, 0]} />

      {/* Người quan sát - vị trí có thể điều chỉnh */}
      <group position={[observerPosition, 0, 0]}>
        {/* Đế người quan sát */}
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.8, 1, 0.5, 32]} />
          <meshStandardMaterial color="#4a5568" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Đầu/cảm biến người quan sát */}
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.6}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        {/* Chỉ báo "tai" */}
        <mesh position={[0.4, 0.4, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#c4b5fd" />
        </mesh>
        {/* Hiệu ứng phát sáng */}
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.9, 32, 32]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.15} />
        </mesh>
        {/* Cột nhãn người quan sát */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        {/* Nhãn */}
        <mesh position={[0, 2.2, 0]} rotation={[0, 0, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial color="#8b5cf6" />
        </mesh>
      </group>

      {/* Nguồn âm - di chuyển trái/phải */}
      <group position={[sourceXRef.current, 0, 0]}>
        {/* Khối cầu nguồn (loa) */}
        <mesh castShadow>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.8}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
        {/* Vầng sáng ngoài */}
        <mesh>
          <sphereGeometry args={[1.3, 32, 32]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.2} />
        </mesh>
        {/* Chỉ báo hướng */}
        {Math.abs(sourceVelRef.current) > 0.1 && (
          <group rotation={[0, 0, sourceVelRef.current > 0 ? -Math.PI / 2 : Math.PI / 2]}>
            <mesh position={[1.8, 0, 0]}>
              <coneGeometry args={[0.4, 0.8, 8]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
          </group>
        )}
      </group>

      {/* Mặt sóng - sóng tròn lan tỏa từ các điểm phát */}
      {showWavefronts && (
        <group>
          {wavesRef.current.map((wave, i) => {
            const age = timeRef.current - wave.emissionTime;
            const radius = age * waveSpeed;
            const maxRadius = 35;

            if (radius > maxRadius || radius < 0.1) return null;

            const opacity = Math.max(0, 0.7 - (age / 6));
            const waveColor = getWaveColor(wave.emissionX);

            return (
              <group key={i} position={[wave.emissionX, 0, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[radius - 0.1, radius + 0.1, 64]} />
                  <meshBasicMaterial
                    color={waveColor}
                    transparent
                    opacity={opacity}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* Đường tham chiếu trung tâm */}
      <Line
        points={[[-35, 0, 0], [35, 0, 0]]}
        color="#333355"
        lineWidth={2}
        opacity={0.6}
        transparent
      />

      {/* Chỉ báo hướng trên sàn */}
      <Line
        points={[[-25, -1.95, 5], [-20, -1.95, 5]]}
        color="#4a5568"
        lineWidth={3}
        dashed
        dashSize={0.5}
        gapSize={0.3}
      />
      <mesh position={[-26, -1.9, 5]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.3, 0.6, 8]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      <mesh position={[-19, -1.9, 5]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.3, 0.6, 8]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>

      {/* Nón Mach cho tốc độ siêu âm */}
      {data.machNumber >= 1 && (
        <group position={[sourceXRef.current, 0, 0]}>
          <mesh rotation={[0, sourceVelRef.current > 0 ? 0 : Math.PI, 0]}>
            <coneGeometry args={[20, 40, 2]} />
            <meshBasicMaterial
              color="#ff00ff"
              transparent
              opacity={0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default DopplerSceneComponent;
