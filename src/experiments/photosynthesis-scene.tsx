'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export interface PhotosynthesisData {
  phase: "Pha sáng" | "Chu trình Calvin";
  step: number;
  stepDescription: string;
  o2Produced: number;
  glucoseProduced: number;
  atpCount: number;
  nadphCount: number;
  lightEnergy: number;
  co2Consumed: number;
  h2oConsumed: number;
}

interface PhotosynthesisSceneProps {
  onDataChange?: (data: PhotosynthesisData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  lightIntensity?: number;
  co2Level?: number;
  stepMode?: "auto" | "step";
  showLabels?: boolean;
}

const STEP_DESCRIPTIONS = {
  lightReactions: [
    "Bước 1: Ánh sáng mặt trời (photon) chiếu vào lục lạp. Phân tử nước (H₂O) đi vào từ phía dưới.",
    "Bước 2: Hệ thống quang hóa II hấp thụ ánh sáng, phân tách H₂O → O₂ + H⁺ + e⁻. Chuỗi truyền electron hoạt động.",
    "Bước 3: ATP và NADPH được sản xuất nhờ năng lượng ánh sáng. 2H₂O → O₂ + 4H⁺ + 4e⁻",
  ],
  calvinCycle: [
    "Bước 4: CO₂ đi vào chất nền (stroma). Enzim RuBisCO cố định CO₂ vào RuBP (cố định cacbon).",
    "Bước 5: ATP/NADPH cung cấp năng lượng chuyển hóa thành G3P. Giai đoạn khử sử dụng các chất mang năng lượng.",
    "Bước 6: Các phân tử G3P kết hợp tạo thành GLUCOZƠ (C₆H₁₂O₆). Hoàn thành chu trình Calvin!",
  ]
};

interface Molecule {
  id: string;
  type: "H2O" | "CO2" | "O2" | "ATP" | "NADPH" | "G3P" | "glucose" | "RuBP" | "photon";
  position: THREE.Vector3;
  targetPosition: THREE.Vector3;
  progress: number;
  speed: number;
  energyLevel?: number;
}

export default function PhotosynthesisSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  lightIntensity = 1,
  co2Level = 1,
  stepMode = "auto",
  showLabels = true,
}: PhotosynthesisSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frameCountRef = useRef(0);

  const timeRef = useRef(0);
  const rotationRef = useRef(0);
  const stepRef = useRef(1);
  const phaseRef = useRef<"Pha sáng" | "Chu trình Calvin">("Pha sáng");
  const stepTimerRef = useRef(0);

  const o2ProducedRef = useRef(0);
  const glucoseProducedRef = useRef(0);
  const atpCountRef = useRef(0);
  const nadphCountRef = useRef(0);
  const lightEnergyRef = useRef(0);
  const co2ConsumedRef = useRef(0);
  const h2oConsumedRef = useRef(0);

  const moleculesRef = useRef<Molecule[]>([]);
  const [visibleMolecules, setVisibleMolecules] = useState<Molecule[]>([]);

  const [currentData, setCurrentData] = useState<PhotosynthesisData>({
    phase: "Pha sáng",
    step: 1,
    stepDescription: STEP_DESCRIPTIONS.lightReactions[0],
    o2Produced: 0,
    glucoseProduced: 0,
    atpCount: 0,
    nadphCount: 0,
    lightEnergy: 0,
    co2Consumed: 0,
    h2oConsumed: 0,
  });

  const chloroplastShape = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let i = 0; i <= 60; i++) {
      const theta = (i / 60) * Math.PI * 2;
      points.push([
        Math.cos(theta) * 5.5,
        Math.sin(theta) * 4,
        0
      ]);
    }
    return points;
  }, []);

  const thylakoids = useMemo(() => {
    const stacks: [number, number, number][][] = [];
    for (let stack = 0; stack < 7; stack++) {
      const stackPoints: [number, number, number][] = [];
      for (let disc = 0; disc < 6; disc++) {
        stackPoints.push([
          (stack - 3) * 1.6,
          (disc - 2.5) * 0.28,
          Math.sin(stack * 0.7) * 0.4
        ]);
      }
      stacks.push(stackPoints);
    }
    return stacks;
  }, []);

  const stromaConnections = useMemo(() => {
    const conns: [number, number, number][] = [];
    for (let i = 0; i < 6; i++) {
      conns.push([
        (i - 2.5) * 1.6,
        -1.2,
        Math.sin(i * 0.7) * 0.4
      ]);
    }
    return conns;
  }, []);

  const sunRays = useMemo(() => {
    const rays: [number, number, number][][] = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      rays.push([
        [Math.cos(angle) * 9, 7, 0],
        [Math.cos(angle) * 2.5, 1.5, 0]
      ]);
    }
    return rays;
  }, []);

  const electronChain = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      points.push([
        (t - 0.5) * 10,
        0.6 + Math.sin(t * Math.PI * 4) * 0.25,
        0
      ]);
    }
    return points;
  }, []);

  const energyFlowPath = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      points.push([
        Math.cos(t * Math.PI * 2) * 3,
        t * 2 - 1,
        Math.sin(t * Math.PI * 2) * 0.5
      ]);
    }
    return points;
  }, []);

  useEffect(() => {
    timeRef.current = 0;
    rotationRef.current = 0;
    stepRef.current = 1;
    phaseRef.current = "Pha sáng";
    stepTimerRef.current = 0;
    o2ProducedRef.current = 0;
    glucoseProducedRef.current = 0;
    atpCountRef.current = 0;
    nadphCountRef.current = 0;
    lightEnergyRef.current = 0;
    co2ConsumedRef.current = 0;
    h2oConsumedRef.current = 0;
    moleculesRef.current = [];
    setVisibleMolecules([]);
    setCurrentData({
      phase: "Pha sáng",
      step: 1,
      stepDescription: STEP_DESCRIPTIONS.lightReactions[0],
      o2Produced: 0,
      glucoseProduced: 0,
      atpCount: 0,
      nadphCount: 0,
      lightEnergy: 0,
      co2Consumed: 0,
      h2oConsumed: 0,
    });
  }, [resetTrigger]);

  const spawnMolecule = useCallback((type: Molecule["type"], startPhase: "light" | "calvin") => {
    const id = `${type}-${Date.now()}-${Math.random()}`;
    let startPos: THREE.Vector3;
    let targetPos: THREE.Vector3;

    switch (type) {
      case "photon":
        startPos = new THREE.Vector3((Math.random() - 0.5) * 12, 8, (Math.random() - 0.5) * 8);
        targetPos = new THREE.Vector3((Math.random() - 0.5) * 4, 0.8, (Math.random() - 0.5) * 2);
        break;
      case "H2O":
        startPos = new THREE.Vector3((Math.random() - 0.5) * 10, -5, (Math.random() - 0.5) * 5);
        targetPos = new THREE.Vector3((Math.random() - 0.5) * 3, 0.6, (Math.random() - 0.5) * 2);
        break;
      case "CO2":
        startPos = new THREE.Vector3((Math.random() - 0.5) * 12, 7, (Math.random() - 0.5) * 7);
        targetPos = new THREE.Vector3((Math.random() - 0.5) * 2, -2, (Math.random() - 0.5) * 2);
        break;
      case "O2":
        startPos = new THREE.Vector3((Math.random() - 0.5) * 3, 0.6, (Math.random() - 0.5) * 2);
        targetPos = new THREE.Vector3((Math.random() - 0.5) * 7, 6, (Math.random() - 0.5) * 5);
        break;
      case "ATP":
        startPos = new THREE.Vector3((Math.random() - 0.5) * 3, 0.6, 0);
        targetPos = new THREE.Vector3((Math.random() - 0.5) * 1.5, -2, (Math.random() - 0.5) * 1.5);
        break;
      case "NADPH":
        startPos = new THREE.Vector3((Math.random() - 0.5) * 3, 0.6, 0);
        targetPos = new THREE.Vector3((Math.random() - 0.5) * 1.5, -2, (Math.random() - 0.5) * 1.5);
        break;
      case "RuBP":
        startPos = new THREE.Vector3((Math.random() - 0.5) * 1.5, -2, 0);
        targetPos = new THREE.Vector3((Math.random() - 0.5) * 0.8, -2, 0);
        break;
      case "G3P":
        startPos = new THREE.Vector3((Math.random() - 0.5) * 1.2, -2, 0);
        targetPos = new THREE.Vector3((Math.random() - 0.5) * 1.8, -3, (Math.random() - 0.5) * 2);
        break;
      case "glucose":
        startPos = new THREE.Vector3((Math.random() - 0.5) * 1.5, -2, 0);
        targetPos = new THREE.Vector3((Math.random() - 0.5) * 4, -4.5, (Math.random() - 0.5) * 4);
        break;
      default:
        startPos = new THREE.Vector3(0, 0, 0);
        targetPos = new THREE.Vector3(0, 0, 0);
    }

    const molecule: Molecule = {
      id,
      type,
      position: startPos.clone(),
      targetPosition: targetPos,
      progress: 0,
      speed: 0.25 + Math.random() * 0.15,
      energyLevel: type === "photon" ? lightIntensity : undefined,
    };

    moleculesRef.current.push(molecule);
  }, [lightIntensity]);

  const getStepDescription = useCallback((step: number, phase: "Pha sáng" | "Chu trình Calvin") => {
    const stepIndex = Math.max(0, step - 1);
    if (phase === "Pha sáng") {
      return STEP_DESCRIPTIONS.lightReactions[stepIndex] || STEP_DESCRIPTIONS.lightReactions[2];
    } else {
      return STEP_DESCRIPTIONS.calvinCycle[stepIndex] || STEP_DESCRIPTIONS.calvinCycle[2];
    }
  }, []);

  useFrame((_, delta) => {
    frameCountRef.current++;

    if (groupRef.current && isPlaying) {
      timeRef.current += delta * simulationSpeed;
      rotationRef.current += delta * 0.015 * simulationSpeed;
      groupRef.current.rotation.y = rotationRef.current;

      if (stepMode === "auto") {
        stepTimerRef.current += delta * simulationSpeed;
        const stepDuration = 5.5 / simulationSpeed;

        if (stepTimerRef.current > stepDuration) {
          stepTimerRef.current = 0;
          stepRef.current++;

          if (phaseRef.current === "Pha sáng" && stepRef.current > 3) {
            phaseRef.current = "Chu trình Calvin";
            stepRef.current = 4;
          } else if (phaseRef.current === "Chu trình Calvin" && stepRef.current > 6) {
            phaseRef.current = "Pha sáng";
            stepRef.current = 1;
          }
        }
      }

      const step = stepRef.current;
      const phase = phaseRef.current;

      if (phase === "Pha sáng") {
        const rate = lightIntensity * simulationSpeed;

        if (step >= 1) {
          lightEnergyRef.current = Math.min(100, lightEnergyRef.current + delta * rate * 8);
          h2oConsumedRef.current = Math.min(100, h2oConsumedRef.current + delta * rate * 3);
        }

        if (step >= 2) {
          o2ProducedRef.current = Math.min(100, o2ProducedRef.current + delta * rate * 6);
        }

        if (step >= 3) {
          atpCountRef.current = Math.min(60, atpCountRef.current + delta * rate * 2.5);
          nadphCountRef.current = Math.min(60, nadphCountRef.current + delta * rate * 2);
        }

        if (step === 1 && frameCountRef.current % 35 === 0) {
          if (Math.random() < 0.7) spawnMolecule("photon", "light");
          if (Math.random() < 0.5) spawnMolecule("H2O", "light");
        }
        if (step === 2 && frameCountRef.current % 45 === 0 && Math.random() < 0.6) {
          spawnMolecule("O2", "light");
        }
        if (step === 3 && frameCountRef.current % 55 === 0) {
          if (atpCountRef.current < 40 && Math.random() < 0.5) spawnMolecule("ATP", "light");
          if (nadphCountRef.current < 35 && Math.random() < 0.5) spawnMolecule("NADPH", "light");
        }
      } else {
        const rate = co2Level * lightIntensity * simulationSpeed;

        if (step >= 4) {
          atpCountRef.current = Math.max(0, atpCountRef.current - delta * rate * 0.6);
          nadphCountRef.current = Math.max(0, nadphCountRef.current - delta * rate * 0.5);
          co2ConsumedRef.current = Math.min(100, co2ConsumedRef.current + delta * rate * 4);
        }

        if (step === 4 && frameCountRef.current % 45 === 0) {
          if (Math.random() < 0.6) spawnMolecule("CO2", "calvin");
          if (Math.random() < 0.4) spawnMolecule("RuBP", "calvin");
        }

        if (step === 5 && frameCountRef.current % 50 === 0 && Math.random() < 0.5) {
          spawnMolecule("G3P", "calvin");
        }

        if (step === 6) {
          glucoseProducedRef.current = Math.min(100, glucoseProducedRef.current + delta * rate * 3.5);
          if (frameCountRef.current % 70 === 0 && Math.random() < 0.4) {
            spawnMolecule("glucose", "calvin");
          }
        }
      }

      moleculesRef.current = moleculesRef.current.filter(mol => {
        mol.progress += delta * mol.speed * simulationSpeed;
        mol.position.lerp(mol.targetPosition, delta * mol.speed * simulationSpeed);
        return mol.progress < 1;
      });

      if (frameCountRef.current % 8 === 0) {
        const newData: PhotosynthesisData = {
          phase,
          step: stepRef.current,
          stepDescription: getStepDescription(stepRef.current, phase),
          o2Produced: Math.round(o2ProducedRef.current),
          glucoseProduced: Math.round(glucoseProducedRef.current),
          atpCount: Math.round(atpCountRef.current),
          nadphCount: Math.round(nadphCountRef.current),
          lightEnergy: Math.round(lightEnergyRef.current),
          co2Consumed: Math.round(co2ConsumedRef.current),
          h2oConsumed: Math.round(h2oConsumedRef.current),
        };
        setCurrentData(newData);
        setVisibleMolecules([...moleculesRef.current]);
        onDataChange?.(newData);
      }
    }
  });

  const renderMolecule = (mol: Molecule) => {
    const colors: Record<string, string> = {
      H2O: "#06b6d4",
      CO2: "#3b82f6",
      O2: "#22c55e",
      ATP: "#fbbf24",
      NADPH: "#a855f7",
      G3P: "#f472b6",
      glucose: "#fb923c",
      RuBP: "#14b8a6",
      photon: "#fef08a",
    };

    const sizes: Record<string, number> = {
      H2O: 0.22,
      CO2: 0.28,
      O2: 0.18,
      ATP: 0.25,
      NADPH: 0.23,
      G3P: 0.28,
      glucose: 0.4,
      RuBP: 0.2,
      photon: 0.15,
    };

    const color = colors[mol.type] || "#888";
    const size = sizes[mol.type] || 0.2;
    const isPhoton = mol.type === "photon";

    return (
      <group key={mol.id} position={mol.position}>
        <mesh>
          <sphereGeometry args={[Math.max(0.01, size), 12, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isPhoton ? 0.8 + Math.sin(timeRef.current * 8) * 0.3 : 0.4}
            transparent
            opacity={isPhoton ? 0.9 : 0.85}
          />
        </mesh>
        {showLabels && (
          <Html position={[0, size + 0.15, 0]} distanceFactor={12} center>
            <div
              className="text-[10px] font-bold px-1 py-0.5 rounded whitespace-nowrap"
              style={{ backgroundColor: color, color: "white" }}
            >
              {mol.type}
            </div>
          </Html>
        )}
      </group>
    );
  };

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[0, 12, 0]} intensity={lightIntensity * 2.5} color="#fef08a" />
      <pointLight position={[0, 6, 0]} intensity={lightIntensity * 1} color="#fbbf24" />
      <pointLight position={[0, -2.5, 0]} intensity={0.5} color="#22c55e" />

      <group ref={groupRef}>
        <Line points={chloroplastShape} color="#22c55e" lineWidth={3} opacity={0.5} transparent />
        <mesh rotation={[0, 0, 0]}>
          <sphereGeometry args={[Math.max(0.01, 5.5), 32, 16]} />
          <meshStandardMaterial color="#22c55e" transparent opacity={0.1} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>

        {lightIntensity > 0.3 && phaseRef.current === "Pha sáng" && (
          <group>
            {sunRays.map((ray, i) => (
              <Line key={i} points={ray} color="#fbbf24" lineWidth={1} opacity={lightIntensity * 0.4 + Math.sin(timeRef.current * 2 + i) * 0.15} transparent />
            ))}
          </group>
        )}

        {phaseRef.current === "Pha sáng" && lightIntensity > 0.5 && (
          <Line points={energyFlowPath} color="#fbbf24" lineWidth={2} opacity={0.3 + Math.sin(timeRef.current * 3) * 0.2} transparent dashed />
        )}

        {thylakoids.map((stack, stackIndex) => (
          <group key={stackIndex}>
            {stack.map((pos, discIndex) => (
              <group key={discIndex} position={pos}>
                <mesh rotation={[0, 0, 0]}>
                  <cylinderGeometry args={[Math.max(0.01, 0.55), Math.max(0.01, 0.55), Math.max(0.01, 0.14), 16]} />
                  <meshStandardMaterial color="#059669" roughness={0.4} metalness={0.1} />
                </mesh>
                {phaseRef.current === "Pha sáng" && lightIntensity > 0.4 && (
                  <mesh position={[0, 0.25, 0]}>
                    <sphereGeometry args={[Math.max(0.01, 0.12), 8, 8]} />
                    <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={lightIntensity * (Math.sin(timeRef.current * 2 + stackIndex) * 0.4 + 0.6)} />
                  </mesh>
                )}
              </group>
            ))}
          </group>
        ))}

        {stromaConnections.map((pos, i) => (
          <group key={i} position={pos}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[Math.max(0.01, 0.14), Math.max(0.01, 0.7), 8, 12]} />
              <meshStandardMaterial color="#047857" transparent opacity={0.85} />
            </mesh>
          </group>
        ))}

        {phaseRef.current === "Pha sáng" && stepRef.current >= 2 && (
          <Line points={electronChain} color="#fbbf24" lineWidth={2.5} opacity={0.7 + Math.sin(timeRef.current * 5) * 0.25} transparent />
        )}

        <group position={[0, -2.2, 0]}>
          <mesh>
            <sphereGeometry args={[Math.max(0.01, 2.5), 16, 16]} />
            <meshStandardMaterial color="#22c55e" transparent opacity={0.06} />
          </mesh>
          {phaseRef.current === "Chu trình Calvin" && co2Level > 0.3 && (
            <group>
              {[0, 1, 2, 3].map((i) => (
                <mesh key={i} position={[Math.cos((i * Math.PI * 2) / 4) * 1.4, 0, Math.sin((i * Math.PI * 2) / 4) * 1.4]}>
                  <sphereGeometry args={[Math.max(0.01, 0.14), 8, 8]} />
                  <meshStandardMaterial color="#14b8a6" emissive="#14b8a6" emissiveIntensity={co2Level * 0.6 * (Math.sin(timeRef.current * 3 + i) * 0.3 + 0.7)} />
                </mesh>
              ))}
            </group>
          )}
        </group>

        {visibleMolecules.map(renderMolecule)}

        {showLabels && (
          <>
            <Html position={[0, -4.5, 0]} distanceFactor={10}>
              <div className="bg-green-600/90 text-white px-2 py-1 rounded text-xs font-medium">Lục lạp</div>
            </Html>
            {phaseRef.current === "Pha sáng" && (
              <Html position={[0, 3, 0]} distanceFactor={12}>
                <div className="bg-amber-500/90 text-white px-2 py-1 rounded text-xs font-medium">Thylakoid (Pha sáng)</div>
              </Html>
            )}
            {phaseRef.current === "Chu trình Calvin" && (
              <Html position={[0, -3.5, 2]} distanceFactor={12}>
                <div className="bg-emerald-700/90 text-white px-2 py-1 rounded text-xs font-medium">Stroma / Chất nền (Chu trình Calvin)</div>
              </Html>
            )}
            {phaseRef.current === "Chu trình Calvin" && co2Level > 0.3 && (
              <Html position={[1.8, -2.2, 0]} distanceFactor={12}>
                <div className="bg-teal-600/90 text-white px-1.5 py-0.5 rounded text-[10px]">RuBisCO</div>
              </Html>
            )}
            {phaseRef.current === "Pha sáng" && stepRef.current >= 2 && (
              <>
                <Html position={[-4, 1.2, 0]} distanceFactor={12}>
                  <div className="bg-yellow-600/90 text-white px-1.5 py-0.5 rounded text-[10px]">Hệ thống quang hóa II</div>
                </Html>
                <Html position={[4, 1.2, 0]} distanceFactor={12}>
                  <div className="bg-orange-600/90 text-white px-1.5 py-0.5 rounded text-[10px]">Hệ thống quang hóa I</div>
                </Html>
              </>
            )}

            {phaseRef.current === "Pha sáng" && (
              <Html position={[-6, 4, 0]} distanceFactor={10}>
                <div className="bg-gray-900/95 px-3 py-2 rounded-lg border border-gray-700 text-xs shadow-lg">
                  <div className="text-white font-bold mb-2">⚡ Năng lượng ánh sáng</div>
                  <div className="text-yellow-400">{Math.round(currentData.lightEnergy)}% đã hấp thụ</div>
                  <div className="text-gray-400 mt-1">→ ATP + NADPH</div>
                </div>
              </Html>
            )}

            {phaseRef.current === "Chu trình Calvin" && (
              <Html position={[-6, 4, 0]} distanceFactor={10}>
                <div className="bg-gray-900/95 px-3 py-2 rounded-lg border border-gray-700 text-xs shadow-lg">
                  <div className="text-white font-bold mb-2">🧪 Chu trình Calvin</div>
                  <div className="text-blue-400">CO₂: {currentData.co2Consumed}</div>
                  <div className="text-orange-400">Glucozơ: {currentData.glucoseProduced}%</div>
                  <div className="text-gray-400 mt-1">Đã dùng ATP/NADPH</div>
                </div>
              </Html>
            )}
          </>
        )}
      </group>
    </>
  );
}