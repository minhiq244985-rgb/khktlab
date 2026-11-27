'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

export interface DNAReplicationData {
  step: string;
  stage: string;
  nucleotidesAdded: number;
  description: string;
  leadingStrand: number;
  laggingStrand: number;
}

interface DNAReplicationSceneProps {
  onDataChange?: (data: DNAReplicationData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  speed?: number;
  showLabels?: boolean;
  step?: number;
}

// Màu các nuclêôtit: A=đỏ, T=vàng, G=xanh lam, C=xanh ngọc
const BASE_COLORS = {
  A: '#ef4444', // Đỏ
  T: '#fbbf24', // Vàng
  G: '#3b82f6', // Xanh lam
  C: '#06b6d4', // Xanh ngọc
};

const ORIGINAL_STRAND_COLOR = '#3b82f6'; // Xanh lam
const NEW_STRAND_COLOR = '#22c55e'; // Xanh lá

const COMPLEMENTARY: Record<string, string> = {
  A: 'T',
  T: 'A',
  G: 'C',
  C: 'G',
};

// Trình tự DNA mạch khuôn (20 cặp bazơ)
const DNA_SEQUENCE = 'ATGCGATCGATCGATCGATC';

// Định nghĩa các bước với mô tả chi tiết
const STEPS = [
  {
    name: 'Khởi đầu',
    stage: 'DNA ban đầu',
    desc: 'Phân tử DNA mạch kép còn nguyên vẹn. Enzyme helicase tiến tới điểm khởi đầu nhân đôi.',
  },
  {
    name: 'Tháo xoắn',
    stage: 'Chạc ba nhân đôi',
    desc: 'Helicase bẻ gãy liên kết hydro giữa các cặp bazơ, tạo chạc ba nhân đôi. Hai mạch tách nhau.',
  },
  {
    name: 'Gắn đoạn mồi',
    stage: 'Hoạt động của Primase',
    desc: 'Primase tổng hợp các đoạn mồi RNA ngắn. DNA polymerase giờ có thể gắn vào và bắt đầu tổng hợp.',
  },
  {
    name: 'Kéo dài mạch',
    stage: 'DNA Polymerase',
    desc: 'Mạch dẫn: tổng hợp liên tục theo chiều 5'→3'. Mạch muộn: các đoạn Okazaki. Mạch mới màu xanh lá.',
  },
  {
    name: 'Hoàn tất',
    stage: 'Hai DNA con',
    desc: 'Nhân đôi bán bảo toàn hoàn tất! Mỗi phân tử DNA gồm 1 mạch cũ (xanh lam) + 1 mạch mới (xanh lá).',
  },
];

export default function DNAReplicationSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  speed = 1,
  showLabels = true,
  step = 0,
}: DNAReplicationSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Trạng thái vật lý lưu trong ref
  const timeRef = useRef(0);
  const rotationRef = useRef(0);
  const helicasePosRef = useRef(0);
  const primerProgressRef = useRef(0);
  const leadingProgressRef = useRef(0);
  const laggingProgressRef = useRef(0);
  const unwindingAmountRef = useRef(0);

  // Trạng thái React cập nhật giao diện (giới hạn tần suất)
  const [nucleotidesAdded, setNucleotidesAdded] = useState(0);
  const [leadingStrand, setLeadingStrand] = useState(0);
  const [laggingStrand, setLaggingStrand] = useState(0);
  const frameCountRef = useRef(0);

  // Đặt lại trạng thái vật lý
  useEffect(() => {
    timeRef.current = 0;
    rotationRef.current = 0;
    helicasePosRef.current = 0;
    primerProgressRef.current = 0;
    leadingProgressRef.current = 0;
    laggingProgressRef.current = 0;
    unwindingAmountRef.current = 0;
    setNucleotidesAdded(0);
    setLeadingStrand(0);
    setLaggingStrand(0);
  }, [resetTrigger, step]);

  // Tạo dữ liệu cặp bazơ
  const basePairs = useMemo(() => {
    const pairs: any[] = [];
    for (let i = 0; i < 20; i++) {
      const base1 = DNA_SEQUENCE[i % DNA_SEQUENCE.length];
      const base2 = COMPLEMENTARY[base1];
      pairs.push({
        index: i,
        base1,
        base2,
        color1: BASE_COLORS[base1 as keyof typeof BASE_COLORS],
        color2: BASE_COLORS[base2 as keyof typeof BASE_COLORS],
        y: (i - 10) * 0.6,
        angle: i * 0.6,
      });
    }
    return pairs;
  }, []);

  // Tính vị trí mạch theo độ xoắn và độ tháo xoắn
  const getStrandPosition = useCallback((
    index: number,
    angle: number,
    strand: 0 | 1,
    separation: number = 0,
    helicasePos: number = 0
  ) => {
    const baseAngle = angle + rotationRef.current + (strand === 0 ? 0 : Math.PI);
    const distFromHelicase = Math.abs(index - 10);

    // Tháo xoắn diễn ra tại vị trí helicase và lan truyền
    let unwindAmount = 0;
    if (helicasePos > 0 && distFromHelicase < helicasePos + 2) {
      const progress = 1 - (distFromHelicase / (helicasePos + 2));
      unwindAmount = Math.max(0, progress * separation);
    }

    const sep = unwindAmount * (strand === 0 ? -1 : 1);
    return new THREE.Vector3(
      Math.cos(baseAngle) * 1.8 + sep,
      (index - 10) * 0.6,
      Math.sin(baseAngle) * 1.8
    );
  }, []);

  // Tạo các điểm khung xương mạch
  const generateBackbonePoints = useCallback((
    strand: 0 | 1,
    separation: number = 0,
    helicasePos: number = 0
  ) => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 20; i++) {
      const pair = basePairs[i];
      if (pair) {
        const pos = getStrandPosition(i, pair.angle, strand, separation, helicasePos);
        points.push(pos);
      }
    }
    return points;
  }, [basePairs, getStrandPosition]);

  // Cập nhật trạng thái có chu kỳ (mỗi 8 khung hình)
  useFrame((state, delta) => {
    frameCountRef.current++;

    if (groupRef.current && isPlaying) {
      timeRef.current += delta * simulationSpeed * speed;
      rotationRef.current += delta * 0.08 * simulationSpeed;

      // Hoạt ảnh theo từng bước
      if (step === 1) {
        // Helicase tháo xoắn
        helicasePosRef.current = Math.min(12, helicasePosRef.current + delta * 3 * simulationSpeed * speed);
        unwindingAmountRef.current = Math.min(3, unwindingAmountRef.current + delta * 2 * simulationSpeed * speed);
      } else if (step === 2) {
        // Primase gắn đoạn mồi
        helicasePosRef.current = 10;
        unwindingAmountRef.current = 3;
        primerProgressRef.current = Math.min(100, primerProgressRef.current + delta * 20 * simulationSpeed * speed);
      } else if (step === 3) {
        // Polymerase kéo dài mạch
        unwindingAmountRef.current = 3;
        // Mạch dẫn liên tục (5' đến 3' theo chiều helicase)
        leadingProgressRef.current = Math.min(100, leadingProgressRef.current + delta * 12 * simulationSpeed * speed);
        // Mạch muộn tạo các đoạn Okazaki
        laggingProgressRef.current = Math.min(100, laggingProgressRef.current + delta * 8 * simulationSpeed * speed);
      } else if (step === 4) {
        // Hoàn tất
        unwindingAmountRef.current = 3;
        leadingProgressRef.current = 100;
        laggingProgressRef.current = 100;
      }

      // Tính số nuclêôtit đã thêm
      const totalNucleotides = Math.floor(
        ((leadingProgressRef.current + laggingProgressRef.current) / 100) * 20
      );
      const leading = Math.floor((leadingProgressRef.current / 100) * 20);
      const lagging = Math.floor((laggingProgressRef.current / 100) * 20);

      // Cập nhật trạng thái React mỗi 8 khung hình
      if (frameCountRef.current % 8 === 0) {
        setNucleotidesAdded(totalNucleotides);
        setLeadingStrand(leading);
        setLaggingStrand(lagging);

        if (onDataChange) {
          onDataChange({
            step: STEPS[step].name,
            stage: STEPS[step].stage,
            nucleotidesAdded: totalNucleotides,
            description: STEPS[step].desc,
            leadingStrand: leading,
            laggingStrand: lagging,
          });
        }
      }
    }
  });

  const currentSeparation = step >= 1 ? unwindingAmountRef.current : 0;
  const currentHelicasePos = helicasePosRef.current;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={step === 1 ? 0.6 : 0} color="#f59e0b" />
      <pointLight position={[0, 0, 0]} intensity={step === 2 ? 0.4 : 0} color="#8b5cf6" />
      <pointLight position={[0, 0, 0]} intensity={step === 3 ? 0.5 : 0} color="#22c55e" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        {/* ===== CHUỖI XOẮN KÉP DNA ===== */}
        <group>
          {/* Khung xương mạch ban đầu (đường xanh lam) */}
          <Line
            points={generateBackbonePoints(0, currentSeparation, currentHelicasePos)}
            color={ORIGINAL_STRAND_COLOR}
            lineWidth={4}
            opacity={0.8}
            transparent
          />
          <Line
            points={generateBackbonePoints(1, currentSeparation, currentHelicasePos)}
            color={ORIGINAL_STRAND_COLOR}
            lineWidth={4}
            opacity={0.8}
            transparent
          />

          {/* Các cặp bazơ */}
          {basePairs.map((pair) => {
            const pos1 = getStrandPosition(pair.index, pair.angle, 0, currentSeparation, currentHelicasePos);
            const pos2 = getStrandPosition(pair.index, pair.angle, 1, currentSeparation, currentHelicasePos);
            const isSeparated = currentSeparation > 0.5;
            const helicaseProgress = step === 1 ? currentHelicasePos : step > 1 ? 12 : 0;

            // Kiểm tra cặp bazơ đã được nhân đôi chưa
            const isReplicated = step >= 3 && pair.index < (leadingProgressRef.current / 100) * 20;

            return (
              <group key={pair.index}>
                {/* Bazơ ban đầu trên cả hai mạch */}
                <mesh position={pos1}>
                  <sphereGeometry args={[Math.max(0.01, 0.18), 12, 12]} />
                  <meshStandardMaterial
                    color={pair.color1}
                    emissive={pair.color1}
                    emissiveIntensity={0.4}
                  />
                </mesh>
                <mesh position={pos2}>
                  <sphereGeometry args={[Math.max(0.01, 0.18), 12, 12]} />
                  <meshStandardMaterial
                    color={pair.color2}
                    emissive={pair.color2}
                    emissiveIntensity={0.4}
                  />
                </mesh>

                {/* Liên kết hydro (biến mất khi tháo xoắn) */}
                {!isSeparated && pair.index < helicaseProgress && (
                  <Line
                    points={[pos1, pos2]}
                    color="#e2e8f0"
                    lineWidth={2}
                    opacity={0.4}
                    transparent
                  />
                )}

                {/* Đoạn mồi RNA (Bước 2) - màu cam */}
                {step === 2 && pair.index % 4 === 0 && pair.index < (primerProgressRef.current / 100) * 20 && (
                  <>
                    <mesh position={pos1.clone().multiplyScalar(1.08)}>
                      <sphereGeometry args={[Math.max(0.01, 0.14), 10, 10]} />
                      <meshStandardMaterial
                        color="#f97316"
                        emissive="#f97316"
                        emissiveIntensity={0.5}
                      />
                    </mesh>
                    <mesh position={pos2.clone().multiplyScalar(1.08)}>
                      <sphereGeometry args={[Math.max(0.01, 0.14), 10, 10]} />
                      <meshStandardMaterial
                        color="#f97316"
                        emissive="#f97316"
                        emissiveIntensity={0.5}
                      />
                    </mesh>
                  </>
                )}

                {/* Mạch bổ sung mới (Bước 3 & 4) - màu xanh lá */}
                {isReplicated && (
                  <>
                    {/* Mạch mới khớp mạch gốc 1 */}
                    <mesh position={pos1.clone().multiplyScalar(1.2)}>
                      <sphereGeometry args={[Math.max(0.01, 0.14), 10, 10]} />
                      <meshStandardMaterial
                        color={NEW_STRAND_COLOR}
                        opacity={0.9}
                        transparent
                        emissive={NEW_STRAND_COLOR}
                        emissiveIntensity={0.3}
                      />
                    </mesh>
                    {/* Mạch mới khớp mạch gốc 2 */}
                    <mesh position={pos2.clone().multiplyScalar(1.2)}>
                      <sphereGeometry args={[Math.max(0.01, 0.14), 10, 10]} />
                      <meshStandardMaterial
                        color={NEW_STRAND_COLOR}
                        opacity={0.9}
                        transparent
                        emissive={NEW_STRAND_COLOR}
                        emissiveIntensity={0.3}
                      />
                    </mesh>
                  </>
                )}
              </group>
            );
          })}
        </group>

        {/* ===== ENZYME HELICASE (Bước 1) ===== */}
        {step === 1 && showLabels && (
          <group position={[0, 0, 0]}>
            {/* Thân helicase - dạng nêm */}
            <mesh position={[0, 0, 2.2]}>
              <coneGeometry args={[1.2, 2, 16]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#f59e0b"
                emissiveIntensity={0.5}
                roughness={0.3}
              />
            </mesh>
            {/* Đế helicase */}
            <mesh position={[0, 0, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.8, 1, 0.5, 16]} />
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#fbbf24"
                emissiveIntensity={0.4}
              />
            </mesh>
            <Html position={[0, 0, 3.5]} distanceFactor={10}>
              <div className="bg-amber-500/95 text-white px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap shadow-lg border-2 border-amber-400">
                🧬 Helicase
              </div>
            </Html>
          </group>
        )}

        {/* ===== ENZYME PRIMASE (Bước 2) ===== */}
        {step === 2 && showLabels && (
          <>
            {/* Primase ở phía mạch dẫn */}
            <group position={[2, 2, 0]}>
              <mesh>
                <sphereGeometry args={[Math.max(0.01, 0.6), 16, 16]} />
                <meshStandardMaterial
                  color="#8b5cf6"
                  emissive="#8b5cf6"
                  emissiveIntensity={0.5}
                />
              </mesh>
              <Html position={[0, 1, 0]} distanceFactor={10}>
                <div className="bg-purple-500/95 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                  Primase
                </div>
              </Html>
            </group>
            {/* Primase ở phía mạch muộn */}
            <group position={[-2, -2, 0]}>
              <mesh>
                <sphereGeometry args={[Math.max(0.01, 0.6), 16, 16]} />
                <meshStandardMaterial
                  color="#8b5cf6"
                  emissive="#8b5cf6"
                  emissiveIntensity={0.5}
                />
              </mesh>
              <Html position={[0, -1, 0]} distanceFactor={10}>
                <div className="bg-purple-500/95 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                  Primase
                </div>
              </Html>
            </group>
          </>
        )}

        {/* ===== ENZYME DNA POLYMERASE (Bước 3) ===== */}
        {step === 3 && showLabels && (
          <>
            {/* Polymerase trên mạch dẫn (tổng hợp liên tục) */}
            <group position={[2.5, 3, 0]}>
              <mesh>
                <sphereGeometry args={[Math.max(0.01, 0.8), 16, 16]} />
                <meshStandardMaterial
                  color="#22c55e"
                  emissive="#22c55e"
                  emissiveIntensity={0.5}
                  roughness={0.3}
                />
              </mesh>
              <Html position={[0, 1.2, 0]} distanceFactor={10}>
                <div className="bg-green-600/95 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg whitespace-nowrap">
                  DNA Polymerase III
                </div>
              </Html>
              <Html position={[0, -1.2, 0]} distanceFactor={10}>
                <div className="bg-green-900/90 text-white px-1.5 py-0.5 rounded text-[10px]">
                  Mạch dẫn (5&apos;→3&apos;)
                </div>
              </Html>
            </group>
            {/* Polymerase trên mạch muộn (các đoạn Okazaki) */}
            <group position={[-2.5, -3, 0]}>
              <mesh>
                <sphereGeometry args={[Math.max(0.01, 0.8), 16, 16]} />
                <meshStandardMaterial
                  color="#22c55e"
                  emissive="#22c55e"
                  emissiveIntensity={0.5}
                  roughness={0.3}
                />
              </mesh>
              <Html position={[0, -1.2, 0]} distanceFactor={10}>
                <div className="bg-green-600/95 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg whitespace-nowrap">
                  DNA Polymerase III
                </div>
              </Html>
              <Html position={[0, 1.2, 0]} distanceFactor={10}>
                <div className="bg-green-900/90 text-white px-1.5 py-0.5 rounded text-[10px]">
                  Mạch muộn (Okazaki)
                </div>
              </Html>
            </group>
          </>
        )}

        {/* ===== CHÚ THÍCH ===== */}
        {showLabels && step >= 3 && (
          <Html position={[6, -5, 0]} distanceFactor={10}>
            <div className="bg-gray-900/95 px-3 py-2 rounded-lg border border-gray-700 text-xs shadow-lg">
              <div className="text-white font-bold mb-2">Màu mạch DNA</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 rounded" style={{ backgroundColor: ORIGINAL_STRAND_COLOR }} />
                  <span className="text-gray-300">Mạch ban đầu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 rounded" style={{ backgroundColor: NEW_STRAND_COLOR }} />
                  <span className="text-gray-300">Mạch mới</span>
                </div>
              </div>
              <div className="text-white font-bold mt-3 mb-2">Cặp bazơ</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BASE_COLORS.A }} />
                  <span className="text-gray-300 text-[10px]">A</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BASE_COLORS.T }} />
                  <span className="text-gray-300 text-[10px]">T</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BASE_COLORS.G }} />
                  <span className="text-gray-300 text-[10px]">G</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BASE_COLORS.C }} />
                  <span className="text-gray-300 text-[10px]">C</span>
                </div>
              </div>
            </div>
          </Html>
        )}

        {/* ===== NHÃN BÁN BẢO TOÀN (Bước 4) ===== */}
        {step === 4 && showLabels && (
          <Html position={[-5, 0, 0]} distanceFactor={10}>
            <div className="bg-gradient-to-br from-green-600 to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-white/30">
              ✓ Bán bảo toàn
              <div className="text-xs font-normal mt-1">Mỗi DNA = 1 mạch cũ + 1 mạch mới</div>
            </div>
          </Html>
        )}
      </group>
    </>
  );
}
