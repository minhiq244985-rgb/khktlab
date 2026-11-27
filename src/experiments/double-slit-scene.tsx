"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface DoubleSlitSceneProps {
  onDataChange?: (data: DoubleSlitData) => void;
  wavelength?: number;
  slitSeparation?: number;
  slitWidth?: number;
  particleRate?: number;
  showParticles?: boolean;
  showWaveView?: boolean;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
}

export interface DoubleSlitData {
  fringeSpacing: number;
  particleCount: number;
  wavelength: number;
  slitSeparation: number;
  slitWidth: number;
}

interface Particle {
  position: THREE.Vector3;
  targetY: number; // Vị trí chạm màn chắn được tính trước
  velocity: THREE.Vector3;
  active: boolean;
  phase: "source" | "travelling" | "screen";
  progress: number; // Từ 0 đến 1 dọc theo đường đi
}

/**
 * Mô phỏng Khe Đôi Lượng Tử THỰC TẾ
 *
 * Sử dụng phân bố cường độ khe đôi chính xác:
 * I(y) = I0 * cos²(π * d * y / (λ * L)) * sinc²(π * a * y / (λ * L))
 *
 * trong đó:
 * - I(y) là cường độ tại vị trí y trên màn chắn
 * - d là khoảng cách giữa hai khe
 * - a là độ rộng khe
 * - λ là bước sóng
 * - L là khoảng cách từ hai khe đến màn chắn
 * - sinc(x) = sin(x)/x
 *
 * Các hạt được bắn ra riêng lẻ và chạm vào màn chắn theo
 * phân bố xác suất này, minh họa lưỡng tính sóng-hạt.
 */
export function DoubleSlitSceneComponent({
  onDataChange,
  wavelength = 500,
  slitSeparation = 2,
  slitWidth = 0.3,
  particleRate = 2,
  showParticles = true,
  showWaveView = false,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger,
}: DoubleSlitSceneProps) {
  const particlesRef = useRef<Particle[]>([]);
  const screenHitsRef = useRef<number[]>(new Array(300).fill(0));
  const maxHitsRef = useRef(1);
  const timeRef = useRef(0);
  const lastParticleTimeRef = useRef(0);
  const totalParticlesRef = useRef(0);

  // Thiết lập cảnh
  const sourcePos = useMemo(() => new THREE.Vector3(-12, 0, 0), []);
  const barrierX = 0;
  const screenX = 12;
  const screenHeight = 16;

  const [particlePositions, setParticlePositions] = useState<Float32Array>(new Float32Array(500 * 3));
  const [screenIntensities, setScreenIntensities] = useState<Float32Array>(new Float32Array(300));

  /**
   * Tính cường độ khe đôi tại vị trí y trên màn chắn
   * I(y) = I0 * cos²(π * d * y / (λ * L)) * sinc²(π * a * y / (λ * L))
   */
  const calculateIntensity = (y: number): number => {
    // Chuyển đổi bước sóng từ nm sang đơn vị mô phỏng
    const lambda = wavelength / 10000; // Hệ số tỷ lệ cho mô phỏng
    const L = screenX - barrierX;
    const d = slitSeparation;
    const a = slitWidth;

    // Xấp xỉ góc nhỏ: sin(theta) ≈ theta ≈ y/L
    const y_normalized = y / L;

    // Thành phần giao thoa khe đôi: cos²(π * d * y / (λ * L))
    const interferenceArg = (Math.PI * d * y_normalized) / lambda;
    const interference = Math.cos(interferenceArg) ** 2;

    // Đường bao nhiễu xạ đơn khe: sinc²(π * a * y / (λ * L))
    const diffractionArg = (Math.PI * a * y_normalized) / lambda;
    let diffraction = 1;
    if (Math.abs(diffractionArg) > 0.0001) {
      const sinc = Math.sin(diffractionArg) / diffractionArg;
      diffraction = sinc ** 2;
    }

    return interference * diffraction;
  };

  /**
   * Lấy mẫu vị trí màn chắn theo phân bố xác suất lượng tử
   * Sử dụng phương pháp lấy mẫu loại bỏ (rejection sampling) tỷ lệ thuận với cường độ
   */
  const sampleQuantumPosition = (): number => {
    const maxAttempts = 200;
    const searchRange = screenHeight * 1.5;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Chọn một vị trí ngẫu nhiên trên màn chắn
      const y = (Math.random() - 0.5) * 2 * searchRange;

      // Tính xác suất lượng tử tại vị trí này
      const probability = calculateIntensity(y);

      // Chấp nhận hoặc loại bỏ dựa trên xác suất
      if (Math.random() < probability) {
        return y;
      }
    }

    // Dự phòng: trả về một vị trí ngẫu nhiên gần tâm
    return (Math.random() - 0.5) * screenHeight;
  };

  // Tính toán và báo cáo dữ liệu
  useEffect(() => {
    const lambda = wavelength / 10000;
    const L = screenX - barrierX;
    const d = slitSeparation;

    // Khoảng vân: Δy = λ * L / d
    const fringeSpacing = (lambda * L) / d;

    const data: DoubleSlitData = {
      fringeSpacing: fringeSpacing * 1000, // Chuyển sang mm
      particleCount: totalParticlesRef.current,
      wavelength,
      slitSeparation,
      slitWidth,
    };
    onDataChange?.(data);
  }, [wavelength, slitSeparation, slitWidth, onDataChange, screenIntensities]);

  // Xử lý đặt lại
  useEffect(() => {
    if (resetTrigger !== undefined) {
      particlesRef.current = [];
      screenHitsRef.current = new Array(300).fill(0);
      maxHitsRef.current = 1;
      timeRef.current = 0;
      lastParticleTimeRef.current = 0;
      totalParticlesRef.current = 0;
      setParticlePositions(new Float32Array(500 * 3));
      setScreenIntensities(new Float32Array(300));
    }
  }, [resetTrigger]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    const dt = Math.min(delta, 0.033) * simulationSpeed;
    timeRef.current += dt;

    // Tạo hạt mới theo tốc độ đã chỉ định
    const spawnInterval = 1 / particleRate;
    if (timeRef.current - lastParticleTimeRef.current > spawnInterval) {
      // Tính trước vị trí hạt sẽ chạm màn (đo lường lượng tử)
      const targetY = sampleQuantumPosition();

      // Tính vận tốc để chạm đích
      const travelTime = (screenX - sourcePos.x) / 10; // Tốc độ 10 đơn vị/giây
      const vy = targetY / travelTime;

      const particle: Particle = {
        position: sourcePos.clone(),
        targetY,
        velocity: new THREE.Vector3(10, vy, 0),
        active: true,
        phase: "source",
        progress: 0,
      };
      particlesRef.current.push(particle);
      lastParticleTimeRef.current = timeRef.current;
    }

    const positions = new Float32Array(500 * 3);
    let idx = 0;

    // Cập nhật tất cả các hạt
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      if (!p.active) continue;

      // Di chuyển hạt
      p.position.add(p.velocity.clone().multiplyScalar(dt));
      p.progress = (p.position.x - sourcePos.x) / (screenX - sourcePos.x);

      // Kiểm tra xem đã đi qua màn chắn (hai khe) chưa
      if (p.phase === "source" && p.position.x >= barrierX) {
        // Kiểm tra xem hạt có đi qua khe nào không
        const slit1Y = slitSeparation / 2;
        const slit2Y = -slitSeparation / 2;

        const yAtBarrier = p.position.y;
        const inSlit1 = Math.abs(yAtBarrier - slit1Y) < slitWidth / 2;
        const inSlit2 = Math.abs(yAtBarrier - slit2Y) < slitWidth / 2;

        if (inSlit1 || inSlit2) {
          p.phase = "travelling";
          // Điều chỉnh quỹ đạo một chút do nhiễu xạ
          p.velocity.y += (Math.random() - 0.5) * 0.3;
          p.velocity.normalize().multiplyScalar(10);
        } else {
          // Bị chặn bởi vách ngăn
          p.active = false;
        }
      }

      // Kiểm tra xem đã chạm màn chắn chưa
      if (p.position.x >= screenX) {
        p.phase = "screen";

        // Ghi lại vị trí va chạm
        const screenIndex = Math.floor(
          ((p.position.y + screenHeight / 2) / screenHeight) * 300
        );
        if (screenIndex >= 0 && screenIndex < 300) {
          screenHitsRef.current[screenIndex]++;
          totalParticlesRef.current++;
          if (screenHitsRef.current[screenIndex] > maxHitsRef.current) {
            maxHitsRef.current = screenHitsRef.current[screenIndex];
          }
        }

        p.active = false;
      }

      // Lưu vị trí để kết xuất
      if (p.active && idx < 500) {
        positions[idx * 3] = p.position.x;
        positions[idx * 3 + 1] = p.position.y;
        positions[idx * 3 + 2] = p.position.z;
        idx++;
      }

      // Xóa các hạt không hoạt động
      if (!p.active) {
        particlesRef.current.splice(i, 1);
      }
    }

    setParticlePositions(positions);

    // Cập nhật hiển thị cường độ trên màn chắn
    const intensities = new Float32Array(300);
    for (let i = 0; i < 300; i++) {
      if (maxHitsRef.current > 0) {
        intensities[i] = screenHitsRef.current[i] / maxHitsRef.current;
      }
    }
    setScreenIntensities(intensities);
  });

  // Đường cong cường độ lý thuyết để so sánh
  const intensityCurvePoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const y = ((i / steps) * screenHeight * 1.4) - screenHeight * 0.7;
      const intensity = calculateIntensity(y);
      // Vẽ đường cong ở bên phải màn chắn
      points.push([screenX + 1 + intensity * 5, y, 0]);
    }
    return points;
  }, [wavelength, slitSeparation, slitWidth, screenHeight]);

  // Các vạch va chạm trên màn chắn (hình ảnh tích lũy)
  const screenHitBars = useMemo(() => {
    const bars: { y: number; height: number; opacity: number }[] = [];
    const barWidth = screenHeight / 300;

    for (let i = 0; i < 300; i++) {
      const hits = screenHitsRef.current[i];
      if (hits > 0) {
        const opacity = Math.min(hits / maxHitsRef.current, 1);
        const y = ((i / 300) * screenHeight) - screenHeight / 2;
        bars.push({
          y,
          height: barWidth * 0.95,
          opacity,
        });
      }
    }
    return bars;
  }, [screenIntensities]);

  // Chuyển đổi bước sóng sang màu sắc
  const wavelengthColor = `hsl(${540 - wavelength * 0.6}, 100%, 50%)`;
  const wavelengthHex = useMemo(() => {
    const hue = 540 - wavelength * 0.6;
    return `hsl(${hue}, 100%, 50%)`;
  }, [wavelength]);

  return (
    <group>
      {/* Mặt sàn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]} receiveShadow>
        <planeGeometry args={[35, 25]} />
        <meshStandardMaterial color="#050510" roughness={0.95} metalness={0.1} />
      </mesh>
      <gridHelper args={[35, 35, "#1a1a3e", "#0a0a1e"]} position={[0, -7.99, 0]} />

      {/* Nguồn phát hạt (bên trái) */}
      <group position={sourcePos}>
        {/* Vỏ nguồn phát */}
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 0.8, 1.5, 16]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Khe phát xạ */}
        <mesh position={[0.5, 0, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color={wavelengthHex}
            emissive={wavelengthHex}
            emissiveIntensity={3}
          />
        </mesh>
        {/* Ánh sáng điểm từ nguồn */}
        <pointLight color={wavelengthHex} intensity={3} distance={8} />
        {/* Hiệu ứng phát sáng */}
        <mesh>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial
            color={wavelengthHex}
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>

      {/* Vách ngăn có hai khe (ở giữa) */}
      <group position={[barrierX, 0, 0]}>
        {/* Phần vách ngăn trên */}
        <mesh position={[0, slitSeparation / 2 + slitWidth / 2 + 3.5, 0]} castShadow>
          <boxGeometry args={[0.3, 7, 2.5]} />
          <meshStandardMaterial color="#2a2a3e" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Phần vách ngăn giữa (nằm giữa hai khe) */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.3, slitSeparation - slitWidth, 2.5]} />
          <meshStandardMaterial color="#2a2a3e" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Phần vách ngăn dưới */}
        <mesh position={[0, -slitSeparation / 2 - slitWidth / 2 - 3.5, 0]} castShadow>
          <boxGeometry args={[0.3, 7, 2.5]} />
          <meshStandardMaterial color="#2a2a3e" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Điểm đánh dấu phát sáng ở khe */}
        <mesh position={[0.15, slitSeparation / 2, 0]}>
          <boxGeometry args={[0.05, slitWidth, 2.6]} />
          <meshBasicMaterial color={wavelengthHex} transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.15, -slitSeparation / 2, 0]}>
          <boxGeometry args={[0.05, slitWidth, 2.6]} />
          <meshBasicMaterial color={wavelengthHex} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Màn chắn dò hạt (bên phải) */}
      <group position={[screenX, 0, 0]}>
        {/* Mặt sau màn chắn */}
        <mesh receiveShadow>
          <boxGeometry args={[0.3, screenHeight, 0.8]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Khung màn chắn - trên */}
        <mesh position={[0, screenHeight / 2 + 0.4, 0]} castShadow>
          <boxGeometry args={[0.5, 0.6, 1]} />
          <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Khung màn chắn - dưới */}
        <mesh position={[0, -screenHeight / 2 - 0.4, 0]} castShadow>
          <boxGeometry args={[0.5, 0.6, 1]} />
          <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Hình ảnh hạt tích lũy trên màn chắn */}
        {screenHitBars.map((bar, i) => (
          <mesh key={i} position={[0.2, bar.y, 0.15]}>
            <boxGeometry args={[0.08, bar.height, 0.08]} />
            <meshBasicMaterial
              color={wavelengthHex}
              transparent
              opacity={bar.opacity * 0.9}
            />
          </mesh>
        ))}
      </group>

      {/* Các hạt đang bay */}
      {showParticles && (
        <points geometry={new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))}>
          <pointsMaterial
            size={0.12}
            color={wavelengthHex}
            transparent
            opacity={0.95}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* Đường cong cường độ lý thuyết (để so sánh) */}
      {showWaveView && (
        <group position={[0, 0, -0.8]}>
          {/* Đường cong cường độ */}
          <Line
            points={intensityCurvePoints}
            color={wavelengthHex}
            lineWidth={3}
            opacity={0.9}
          />
          {/* Đường cơ sở */}
          <Line
            points={[
              [screenX + 1, -screenHeight * 0.7, 0],
              [screenX + 1, screenHeight * 0.7, 0]
            ]}
            color="#444"
            lineWidth={1}
            opacity={0.5}
          />
          {/* Vạch chia */}
          {[
            -screenHeight * 0.5,
            -screenHeight * 0.25,
            0,
            screenHeight * 0.25,
            screenHeight * 0.5,
          ].map((y, i) => (
            <Line
              key={i}
              points={[
                [screenX + 0.8, y, 0],
                [screenX + 1.2, y, 0]
              ]}
              color="#666"
              lineWidth={1}
              opacity={0.3}
            />
          ))}
        </group>
      )}

      {/* Nhãn / bảng thông tin */}
      <group position={[sourcePos.x, 2.5, 0]}>
        <mesh>
          <planeGeometry args={[4, 0.6]} />
          <meshBasicMaterial color="#1a1a3e" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Vạch đo khoảng cách trên sàn */}
      <group position={[0, -7.95, 2]}>
        {[...Array(5)].map((_, i) => {
          const x = -10 + i * 5;
          return (
            <group key={i} position={[x, 0, 0]}>
              <mesh>
                <boxGeometry args={[0.08, 0.08, 0.4]} />
                <meshStandardMaterial color="#555" />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

export default DoubleSlitSceneComponent;
