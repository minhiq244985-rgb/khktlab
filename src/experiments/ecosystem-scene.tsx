'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

export interface EcosystemData {
  producerCount: number;
  primaryCount: number;
  secondaryCount: number;
  apexCount: number;
  totalEnergy: number;
  generation: number;
  biodiversityIndex: number;
}

interface EcosystemSceneProps {
  onDataChange?: (data: EcosystemData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  initialProducerPop?: number;
  initialPrimaryPop?: number;
  initialSecondaryPop?: number;
  initialApexPop?: number;
  reproductionRate?: number;
  predationRate?: number;
  speed?: number;
}

interface Organism {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
  trophicLevel: 0 | 1 | 2 | 3; // 0=sinh vật sản xuất, 1=bậc 1, 2=bậc 2, 3=đầu bảng
  alive: boolean;
  energy: number;
  age: number;
}

// Cấu hình bậc dinh dưỡng
const TROPHIC_INFO = {
  0: { name: 'Sinh vật sản xuất', color: '#22c55e', size: 0.18, speed: 0, energyValue: 100 },
  1: { name: 'Sinh vật tiêu thụ bậc 1', color: '#3b82f6', size: 0.3, speed: 0.018, energyValue: 10 },
  2: { name: 'Sinh vật tiêu thụ bậc 2', color: '#f59e0b', size: 0.45, speed: 0.025, energyValue: 1 },
  3: { name: 'Động vật săn mồi đầu bảng', color: '#ef4444', size: 0.65, speed: 0.03, energyValue: 0.1 },
};

export default function EcosystemSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  initialProducerPop = 30,
  initialPrimaryPop = 15,
  initialSecondaryPop = 6,
  initialApexPop = 2,
  reproductionRate = 0.5,
  predationRate = 0.3,
  speed = 1,
}: EcosystemSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frameCountRef = useRef(0);

  // Trạng thái vật lý trong refs
  const organismsRef = useRef<Organism[]>([]);
  const populationHistoryRef = useRef<{ p: number; pr: number; s: number; a: number }[]>([]);
  const timeRef = useRef(0);
  const generationRef = useRef(0);

  // Trạng thái React để cập nhật UI (được điều tiết)
  const [displayData, setDisplayData] = useState<EcosystemData>({
    producerCount: initialProducerPop,
    primaryCount: initialPrimaryPop,
    secondaryCount: initialSecondaryPop,
    apexCount: initialApexPop,
    totalEnergy: 1000,
    generation: 0,
    biodiversityIndex: 1.5,
  });

  // Khởi tạo sinh vật
  useEffect(() => {
    const organisms: Organism[] = [];
    let id = 0;

    // Sinh vật sản xuất (thực vật) - ở mặt đất
    for (let i = 0; i < initialProducerPop; i++) {
      organisms.push({
        id: id++,
        position: [
          (Math.random() - 0.5) * 14,
          0,
          (Math.random() - 0.5) * 14,
        ],
        velocity: [0, 0, 0],
        trophicLevel: 0,
        alive: true,
        energy: 100,
        age: 0,
      });
    }

    // Sinh vật tiêu thụ bậc 1 (động vật ăn cỏ) - ăn sinh vật sản xuất
    for (let i = 0; i < initialPrimaryPop; i++) {
      organisms.push({
        id: id++,
        position: [
          (Math.random() - 0.5) * 12,
          0.3,
          (Math.random() - 0.5) * 12,
        ],
        velocity: [
          (Math.random() - 0.5) * 0.01,
          0,
          (Math.random() - 0.5) * 0.01,
        ],
        trophicLevel: 1,
        alive: true,
        energy: 80,
        age: 0,
      });
    }

    // Sinh vật tiêu thụ bậc 2 (động vật săn mồi) - ăn sinh vật tiêu thụ bậc 1
    for (let i = 0; i < initialSecondaryPop; i++) {
      organisms.push({
        id: id++,
        position: [
          (Math.random() - 0.5) * 10,
          0.5,
          (Math.random() - 0.5) * 10,
        ],
        velocity: [
          (Math.random() - 0.5) * 0.015,
          0,
          (Math.random() - 0.5) * 0.015,
        ],
        trophicLevel: 2,
        alive: true,
        energy: 100,
        age: 0,
      });
    }

    // Động vật săn mồi đầu bảng - ăn sinh vật tiêu thụ bậc 2
    for (let i = 0; i < initialApexPop; i++) {
      organisms.push({
        id: id++,
        position: [
          (Math.random() - 0.5) * 8,
          0.7,
          (Math.random() - 0.5) * 8,
        ],
        velocity: [
          (Math.random() - 0.5) * 0.02,
          0,
          (Math.random() - 0.5) * 0.02,
        ],
        trophicLevel: 3,
        alive: true,
        energy: 150,
        age: 0,
      });
    }

    organismsRef.current = organisms;
    populationHistoryRef.current = [];
    timeRef.current = 0;
    generationRef.current = 0;
  }, [resetTrigger, initialProducerPop, initialPrimaryPop, initialSecondaryPop, initialApexPop]);

  useFrame((state, delta) => {
    if (!groupRef.current || !isPlaying) return;

    frameCountRef.current++;
    timeRef.current += delta * simulationSpeed * speed;

    const organisms = organismsRef.current;

    // Cập nhật sinh vật
    organisms.forEach((org) => {
      if (!org.alive) return;

      const info = TROPHIC_INFO[org.trophicLevel];

      // Sinh vật sản xuất đứng yên, sinh vật tiêu thụ di chuyển
      if (org.trophicLevel > 0) {
        org.velocity[0] += (Math.random() - 0.5) * 0.006 * simulationSpeed;
        org.velocity[2] += (Math.random() - 0.5) * 0.006 * simulationSpeed;

        // Giới hạn vận tốc
        const currentSpeed = Math.sqrt(org.velocity[0] ** 2 + org.velocity[2] ** 2);
        if (currentSpeed > info.speed) {
          const factor = info.speed / currentSpeed;
          org.velocity[0] *= factor;
          org.velocity[2] *= factor;
        }

        org.position[0] += org.velocity[0] * simulationSpeed;
        org.position[2] += org.velocity[2] * simulationSpeed;

        // Vòng lặp ranh giới
        const bound = 7;
        if (org.position[0] > bound) org.position[0] = -bound;
        if (org.position[0] < -bound) org.position[0] = bound;
        if (org.position[2] > bound) org.position[2] = -bound;
        if (org.position[2] < -bound) org.position[2] = bound;

        // Tiêu hao năng lượng theo thời gian (bậc dinh dưỡng cao hơn tiêu tốn nhiều năng lượng hơn)
        org.energy -= delta * (2 + org.trophicLevel) * simulationSpeed;

        // Săn mồi (sinh vật tiêu thụ ăn bậc dinh dưỡng thấp hơn)
        if (org.energy < 70) {
          const preyLevel = org.trophicLevel - 1 as 0 | 1 | 2;
          const prey = organisms.find(o =>
            o.alive &&
            o.trophicLevel === preyLevel &&
            Math.sqrt(
              (o.position[0] - org.position[0]) ** 2 +
              (o.position[2] - org.position[2]) ** 2
            ) < 1
          );

          if (prey && Math.random() < predationRate) {
            prey.alive = false;
            // Quy tắc chuyển hóa năng lượng 10%
            org.energy = Math.min(150, org.energy + 50);
          }
        }

        // Chết nếu hết năng lượng
        if (org.energy <= 0) {
          org.alive = false;
        }
      } else {
        // Sinh vật sản xuất nhận năng lượng từ mặt trời (quang hợp)
        org.energy = Math.min(100, org.energy + delta * 12 * simulationSpeed);
      }

      org.age += delta * simulationSpeed;
    });

    // Sinh sản
    if (Math.random() < reproductionRate * delta * simulationSpeed) {
      const reproducer = organisms.find(o =>
        o.alive &&
        o.energy > 90 &&
        o.trophicLevel > 0 &&
        Math.random() < 0.12
      );

      if (reproducer) {
        reproducer.energy -= 45;
        organisms.push({
          id: organisms.length,
          position: [
            reproducer.position[0] + (Math.random() - 0.5) * 2,
            reproducer.position[1],
            reproducer.position[2] + (Math.random() - 0.5) * 2,
          ],
          velocity: [
            (Math.random() - 0.5) * 0.01,
            0,
            (Math.random() - 0.5) * 0.01,
          ],
          trophicLevel: reproducer.trophicLevel,
          alive: true,
          energy: 45,
          age: 0,
        });
      }
    }

    // Tái sinh sinh vật sản xuất
    const aliveProducers = organisms.filter(o => o.alive && o.trophicLevel === 0);
    if (aliveProducers.length < initialProducerPop && Math.random() < 0.12 * simulationSpeed) {
      organisms.push({
        id: organisms.length,
        position: [
          (Math.random() - 0.5) * 14,
          0,
          (Math.random() - 0.5) * 14,
        ],
        velocity: [0, 0, 0],
        trophicLevel: 0,
        alive: true,
        energy: 50,
        age: 0,
      });
    }

    // Ghi lại dữ liệu quần thể mỗi giây
    if (Math.floor(timeRef.current) > Math.floor(timeRef.current - delta * simulationSpeed)) {
      const counts = {
        p: organisms.filter(o => o.alive && o.trophicLevel === 0).length,
        pr: organisms.filter(o => o.alive && o.trophicLevel === 1).length,
        s: organisms.filter(o => o.alive && o.trophicLevel === 2).length,
        a: organisms.filter(o => o.alive && o.trophicLevel === 3).length,
      };
      populationHistoryRef.current.push(counts);
      if (populationHistoryRef.current.length > 60) {
        populationHistoryRef.current.shift();
      }
      generationRef.current++;
    }

    // Cập nhật trạng thái React sau mỗi 8 khung hình
    if (frameCountRef.current % 8 === 0) {
      const alive = organisms.filter(o => o.alive);
      const counts = {
        producers: alive.filter(o => o.trophicLevel === 0).length,
        primary: alive.filter(o => o.trophicLevel === 1).length,
        secondary: alive.filter(o => o.trophicLevel === 2).length,
        apex: alive.filter(o => o.trophicLevel === 3).length,
      };

      // Tính đa dạng sinh học (chỉ số Shannon)
      const total = alive.length;
      const proportions = [
        counts.producers / total,
        counts.primary / total,
        counts.secondary / total,
        counts.apex / total,
      ].filter(p => p > 0);
      const biodiversity = -proportions.reduce((sum, p) => sum + p * Math.log(p), 0);

      // Tính tổng năng lượng (quy tắc 10%: 100 -> 10 -> 1 -> 0.1)
      const totalEnergy = counts.producers * 100 +
        counts.primary * 10 +
        counts.secondary * 1 +
        counts.apex * 0.1;

      const newData: EcosystemData = {
        producerCount: counts.producers,
        primaryCount: counts.primary,
        secondaryCount: counts.secondary,
        apexCount: counts.apex,
        totalEnergy: Math.round(totalEnergy),
        generation: generationRef.current,
        biodiversityIndex: Math.round(biodiversity * 100) / 100,
      };

      setDisplayData(newData);
      onDataChange?.(newData);
    }
  });

  // Dữ liệu biểu đồ quần thể
  const populationGraphData = useMemo(() => {
    const history = populationHistoryRef.current;
    if (history.length < 2) return [[], [], [], []] as [number, number, number][][];

    const maxPop = Math.max(...history.map(h => Math.max(h.p, h.pr, h.s, h.a)), 1);
    const xStart = -5;
    const zStart = -4;

    return [
      history.map((h, i) => [xStart + i * 0.18, 2, zStart + (h.p / maxPop) * 2.5] as [number, number, number]),
      history.map((h, i) => [xStart + i * 0.18, 1.2, zStart + (h.pr / maxPop) * 2.5] as [number, number, number]),
      history.map((h, i) => [xStart + i * 0.18, 0.4, zStart + (h.s / maxPop) * 2.5] as [number, number, number]),
      history.map((h, i) => [xStart + i * 0.18, -0.4, zStart + (h.a / maxPop) * 2.5] as [number, number, number]),
    ];
  }, [displayData]);

  // Kết xuất sinh vật được ghi nhớ
  const organismElements = useMemo(() => {
    return organismsRef.current
      .filter(o => o.alive)
      .map((org) => (
        <group key={org.id} position={org.position}>
          {/* Cơ thể */}
          <mesh>
            <sphereGeometry args={[TROPHIC_INFO[org.trophicLevel].size, 12, 12]} />
            <meshStandardMaterial
              color={TROPHIC_INFO[org.trophicLevel].color}
              emissive={TROPHIC_INFO[org.trophicLevel].color}
              emissiveIntensity={0.35}
              roughness={0.5}
              metalness={0.3}
            />
          </mesh>
          {/* Ánh sáng chỉ báo năng lượng */}
          {org.energy > 90 && (
            <mesh>
              <sphereGeometry args={[TROPHIC_INFO[org.trophicLevel].size * 1.4, 8, 8]} />
              <meshBasicMaterial
                color={TROPHIC_INFO[org.trophicLevel].color}
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          )}
          {/* Vòng chỉ báo bậc dinh dưỡng */}
          {org.trophicLevel > 0 && (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[TROPHIC_INFO[org.trophicLevel].size * 1.2, 0.02, 8, 16]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
            </mesh>
          )}
        </group>
      ));
  }, [displayData]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      <pointLight position={[0, 8, 0]} intensity={0.3} color="#22c55e" />

      <OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2.5} />

      <group ref={groupRef}>
        {/* Mặt đất */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[16, 16]} />
          <meshStandardMaterial color="#15803d" roughness={0.95} metalness={0.05} />
        </mesh>

        {/* Chi tiết cỏ */}
        {Array.from({ length: 120 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 15,
              0,
              (Math.random() - 0.5) * 15,
            ]}
            rotation={[0, Math.random() * Math.PI, 0]}
          >
            <coneGeometry args={[0.018, 0.12, 4]} />
            <meshStandardMaterial color="#16a34a" roughness={0.8} />
          </mesh>
        ))}

        {/* Sinh vật */}
        {organismElements}

        {/* Biểu đồ quần thể */}
        <group position={[-4, 5, 4]} rotation={[-Math.PI / 3.5, 0, 0]}>
          <mesh position={[4, 0.8, -2]}>
            <boxGeometry args={[14, 3.5, 0.1]} />
            <meshStandardMaterial color="#1f2937" transparent opacity={0.92} />
          </mesh>

          {populationGraphData[0] && populationGraphData[0].length > 1 && (
            <Line points={populationGraphData[0]} color="#22c55e" lineWidth={2.5} />
          )}
          {populationGraphData[1] && populationGraphData[1].length > 1 && (
            <Line points={populationGraphData[1]} color="#3b82f6" lineWidth={2.5} />
          )}
          {populationGraphData[2] && populationGraphData[2].length > 1 && (
            <Line points={populationGraphData[2]} color="#f59e0b" lineWidth={2.5} />
          )}
          {populationGraphData[3] && populationGraphData[3].length > 1 && (
            <Line points={populationGraphData[3]} color="#ef4444" lineWidth={2.5} />
          )}

          <Html position={[11, 2.5, -2]} distanceFactor={15}>
            <div className="bg-gray-900/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
              Động lực quần thể (Lotka-Volterra)
            </div>
          </Html>
        </group>

        {/* Tháp năng lượng (3D) */}
        <group position={[5, 2.5, 0]}>
          <Html position={[0, 5, 0]} distanceFactor={12}>
            <div className="bg-amber-600/90 text-white px-3 py-1 rounded text-sm font-bold">
              Tháp năng lượng (Quy tắc 10%)
            </div>
          </Html>

          {/* Các tầng tháp */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[3, 0.3, 3]} />
            <meshStandardMaterial color="#22c55e" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[2, 0.3, 2]} />
            <meshStandardMaterial color="#3b82f6" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 1.9, 0]}>
            <boxGeometry args={[1.2, 0.3, 1.2]} />
            <meshStandardMaterial color="#f59e0b" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[0.6, 0.3, 0.6]} />
            <meshStandardMaterial color="#ef4444" transparent opacity={0.8} />
          </mesh>

          <Html position={[2, 0.4, 0]} distanceFactor={10}>
            <div className="text-green-400 text-xs">Sản xuất<br/>100%</div>
          </Html>
          <Html position={[1.3, 1.2, 0]} distanceFactor={10}>
            <div className="text-blue-400 text-xs">Bậc 1<br/>10%</div>
          </Html>
          <Html position={[0.8, 1.9, 0]} distanceFactor={10}>
            <div className="text-amber-400 text-xs">Bậc 2<br/>1%</div>
          </Html>
          <Html position={[0.5, 2.5, 0]} distanceFactor={10}>
            <div className="text-red-400 text-xs">Đầu bảng<br/>0.1%</div>
          </Html>
        </group>

        {/* Mũi tên dòng năng lượng */}
        <group position={[6, 0.5, -4]}>
          <Html position={[0, 3, 0]} distanceFactor={12}>
            <div className="bg-gray-900/90 text-white px-2 py-1 rounded text-xs">
              Dòng năng lượng →
            </div>
          </Html>

          <Line
            points={[[0, 2.5, 0], [0, 1.8, 0]]}
            color="#22c55e"
            lineWidth={3}
          />
          <Html position={[0.5, 2.1, 0]} distanceFactor={10}>
            <div className="text-green-400 text-xs font-bold">100%</div>
          </Html>

          <Line
            points={[[0, 1.5, 0], [0, 0.8, 0]]}
            color="#3b82f6"
            lineWidth={2}
          />
          <Html position={[0.5, 1.1, 0]} distanceFactor={10}>
            <div className="text-blue-400 text-xs font-bold">10%</div>
          </Html>

          <Line
            points={[[0, 0.5, 0], [0, -0.2, 0]]}
            color="#f59e0b"
            lineWidth={1.5}
          />
          <Html position={[0.5, 0.1, 0]} distanceFactor={10}>
            <div className="text-amber-400 text-xs font-bold">1%</div>
          </Html>

          <Line
            points={[[0, -0.5, 0], [0, -1.2, 0]]}
            color="#ef4444"
            lineWidth={1}
          />
          <Html position={[0.5, -0.9, 0]} distanceFactor={10}>
            <div className="text-red-400 text-xs font-bold">0.1%</div>
          </Html>
        </group>

        {/* Sơ đồ lưới thức ăn */}
        <Html position={[-6, 4.5, 0]} distanceFactor={12}>
          <div className="bg-gray-900/95 text-white px-3 py-2 rounded text-xs">
            <div className="font-bold mb-2 text-teal-400">Các bậc dinh dưỡng</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Bậc 1: Sinh vật sản xuất (Thực vật)</span>
              </div>
              <div className="ml-4 text-gray-500">↓ năng lượng mặt trời</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Bậc 2: Tiêu thụ bậc 1 (Ăn cỏ)</span>
              </div>
              <div className="ml-4 text-gray-500">↓ 10% truyền năng lượng</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>Bậc 3: Tiêu thụ bậc 2 (Săn mồi)</span>
              </div>
              <div className="ml-4 text-gray-500">↓ 1% năng lượng còn lại</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Bậc 4: Đầu bảng (Săn mồi đỉnh cao)</span>
              </div>
            </div>
          </div>
        </Html>

        {/* Thống kê chính */}
        <Html position={[0, 4, 0]} distanceFactor={12}>
          <div className="bg-teal-600/90 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
            Thế hệ: {displayData.generation} | Tổng năng lượng: {displayData.totalEnergy} đơn vị
          </div>
        </Html>

        {/* Chi tiết quần thể */}
        <Html position={[5, 4.5, -4]} distanceFactor={12}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs space-y-1">
            <div className="font-bold mb-2">Quần thể hiện tại</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Sinh vật sản xuất: {displayData.producerCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Động vật ăn cỏ: {displayData.primaryCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Động vật săn mồi: {displayData.secondaryCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Đầu bảng: {displayData.apexCount}</span>
            </div>
          </div>
        </Html>

        {/* Chỉ báo đa dạng sinh học */}
        <Html position={[-5, 3, -5]} distanceFactor={12}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs">
            <div className="font-bold text-purple-400">Chỉ số đa dạng sinh học</div>
            <div className="text-lg font-bold">{displayData.biodiversityIndex}</div>
            <div className="text-xs text-gray-400">
              {displayData.biodiversityIndex > 1.3 ? '✓ Ổn định' : displayData.biodiversityIndex > 0.8 ? '⚠ Trung bình' : '⚠ Đa dạng thấp'}
            </div>
          </div>
        </Html>

        {/* Thông tin Lotka-Volterra */}
        <Html position={[5, 3, 4]} distanceFactor={12}>
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded text-xs max-w-[180px]">
            <div className="font-bold text-cyan-400 mb-1">Chu kỳ quần thể</div>
            <div className="text-gray-300 leading-relaxed">
              Con mồi ↑ → Săn mồi ↑<br />
              Con mồi ↓ → Săn mồi ↓<br />
              Chu kỳ lặp lại tự nhiên
            </div>
            <div className="mt-2 text-amber-400">
              Nhiều loài hơn = hệ sinh thái ổn định
            </div>
          </div>
        </Html>
      </group>
    </>
  );
}
