'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

export interface ProteinSynthesisData {
  phase: string;
  step: string;
  codonBeingRead: string;
  aminoAcidAdded: string;
  proteinLength: number;
  description: string;
  nucleotidesTranscribed: number;
}

interface ProteinSynthesisSceneProps {
  onDataChange?: (data: ProteinSynthesisData) => void;
  isPlaying?: boolean;
  simulationSpeed?: number;
  resetTrigger?: number;
  speed?: number;
  showLabels?: boolean;
  step?: number;
}

const AMINO_ACIDS = [
  { name: 'Met', fullName: 'Methionine (Khởi đầu)', color: '#ef4444' },
  { name: 'Lys', fullName: 'Lysine', color: '#3b82f6' },
  { name: 'Arg', fullName: 'Arginine', color: '#22c55e' },
  { name: 'Ser', fullName: 'Serine', color: '#f59e0b' },
  { name: 'Leu', fullName: 'Leucine', color: '#8b5cf6' },
  { name: 'Pro', fullName: 'Proline', color: '#ec4899' },
  { name: 'Gly', fullName: 'Glycine', color: '#14b8a6' },
  { name: 'Val', fullName: 'Valine', color: '#f97316' },
];

const DNA_COLORS = {
  A: '#1e40af',
  T: '#3b82f6',
  G: '#60a5fa',
  C: '#93c5fd',
};

const MRNA_COLORS = {
  A: '#ea580c',
  U: '#f97316',
  G: '#fb923c',
  C: '#fdba74',
};

const TRNA_COLOR = '#22c55e';

const RIBOSOME_COLORS = {
  large: '#8b5cf6',
  small: '#a78bfa',
};

const DNA_SEQUENCE = ['A', 'T', 'G', 'C', 'G', 'A', 'T', 'C', 'G', 'A', 'T', 'C', 'G', 'A', 'T'];

const MRNA_CODONS = [
  ['A', 'U', 'G'],
  ['A', 'A', 'A'],
  ['C', 'G', 'U'],
  ['U', 'C', 'U'],
  ['U', 'U', 'A'],
  ['C', 'C', 'U'],
  ['G', 'G', 'U'],
  ['G', 'U', 'U'],
];

const COMPLEMENTARY_DNA: Record<string, string> = {
  A: 'T',
  T: 'A',
  G: 'C',
  C: 'G',
};

const COMPLEMENTARY_MRNA: Record<string, string> = {
  A: 'U',
  U: 'A',
  G: 'C',
  C: 'G',
};

const STEPS = [
  {
    phase: 'Phiên mã',
    name: 'DNA trong nhân',
    desc: 'Phân tử DNA kép trong nhân. RNA Polymerase bám vào vùng khởi động.',
  },
  {
    phase: 'Phiên mã',
    name: 'Tổng hợp mRNA',
    desc: 'RNA Polymerase đọc DNA mạch 3'→5', tổng hợp mRNA 5'→3'. Uracil liên kết cặp với Adenin.',
  },
  {
    phase: 'Phiên mã',
    name: 'Xử lý & Xuất mRNA',
    desc: 'mRNA tách ra, rời khỏi nhân qua lỗ màng nhân ra tế bào chất.',
  },
  {
    phase: 'Dịch mã',
    name: 'Khởi đầu dịch mã',
    desc: 'Ribosome gắn vào mRNA tại bộ ba mở đầu (AUG). tRNA khởi đầu mang axit amin đầu tiên.',
  },
  {
    phase: 'Dịch mã',
    name: 'Kéo dài chuỗi',
    desc: 'tRNA mang axit amin khớp với bộ ba codon. Chuỗi polypeptide dài lên qua từng liên kết.',
  },
  {
    phase: 'Dịch mã',
    name: 'Kết thúc & Cuộn gấp',
    desc: 'Gặp bộ ba kết thúc. Chuỗi polypeptide cuộn gấp thành protein hoàn chỉnh.',
  },
];

export default function ProteinSynthesisSceneComponent({
  onDataChange,
  isPlaying = true,
  simulationSpeed = 1,
  resetTrigger = 0,
  speed = 1,
  showLabels = true,
  step = 0,
}: ProteinSynthesisSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  const timeRef = useRef(0);
  const rotationRef = useRef(0);
  const rnapProgressRef = useRef(0);
  const exitProgressRef = useRef(0);
  const ribosomeProgressRef = useRef(0);
  const codonIndexRef = useRef(0);
  const aminoAcidsFormedRef = useRef(0);
  const foldingProgressRef = useRef(0);
  const nucleotidesTranscribedRef = useRef(0);

  const [currentCodon, setCurrentCodon] = useState('AUG');
  const [currentAminoAcid, setCurrentAminoAcid] = useState('Met');
  const [proteinLength, setProteinLength] = useState(0);
  const frameCountRef = useRef(0);

  useEffect(() => {
    timeRef.current = 0;
    rotationRef.current = 0;
    rnapProgressRef.current = 0;
    exitProgressRef.current = 0;
    ribosomeProgressRef.current = 0;
    codonIndexRef.current = 0;
    aminoAcidsFormedRef.current = 0;
    foldingProgressRef.current = 0;
    nucleotidesTranscribedRef.current = 0;
    setCurrentCodon('AUG');
    setCurrentAminoAcid('Met');
    setProteinLength(0);
  }, [resetTrigger, step]);

  useFrame((state, delta) => {
    frameCountRef.current++;

    if (groupRef.current && isPlaying) {
      timeRef.current += delta * simulationSpeed * speed;
      rotationRef.current += delta * 0.06 * simulationSpeed;

      if (step === 1) {
        rnapProgressRef.current = Math.min(100, rnapProgressRef.current + delta * 10 * simulationSpeed * speed);
        nucleotidesTranscribedRef.current = Math.min(15, nucleotidesTranscribedRef.current + delta * 1.5 * simulationSpeed * speed);
      } else if (step === 2) {
        rnapProgressRef.current = 100;
        nucleotidesTranscribedRef.current = 15;
        exitProgressRef.current = Math.min(100, exitProgressRef.current + delta * 15 * simulationSpeed * speed);
      } else if (step === 3) {
        ribosomeProgressRef.current = Math.min(100, ribosomeProgressRef.current + delta * 25 * simulationSpeed * speed);
      } else if (step === 4) {
        codonIndexRef.current = Math.min(8, codonIndexRef.current + delta * 1.2 * simulationSpeed * speed);
        aminoAcidsFormedRef.current = Math.min(8, aminoAcidsFormedRef.current + delta * 1 * simulationSpeed * speed);
      } else if (step === 5) {
        aminoAcidsFormedRef.current = 8;
        foldingProgressRef.current = Math.min(100, foldingProgressRef.current + delta * 20 * simulationSpeed * speed);
      }

      if (frameCountRef.current % 8 === 0) {
        const idx = Math.floor(codonIndexRef.current);
        if (idx < 8 && idx >= 0) {
          const codon = MRNA_CODONS[idx].join('');
          setCurrentCodon(codon);
          setCurrentAminoAcid(AMINO_ACIDS[idx].name);
        }
        setProteinLength(Math.floor(aminoAcidsFormedRef.current));

        if (onDataChange) {
          onDataChange({
            phase: STEPS[step].phase,
            step: STEPS[step].name,
            codonBeingRead: currentCodon,
            aminoAcidAdded: currentAminoAcid,
            proteinLength: Math.floor(aminoAcidsFormedRef.current),
            description: STEPS[step].desc,
            nucleotidesTranscribed: Math.floor(nucleotidesTranscribedRef.current),
          });
        }
      }
    }
  });

  const generateDNAHelixPoints = useCallback((offsetY = 0) => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 16; i++) {
      const angle = i * 0.5 + rotationRef.current;
      points.push(new THREE.Vector3(
        Math.cos(angle) * 1.3 - 4,
        i * 0.5 - 4 + offsetY,
        Math.sin(angle) * 1.3
      ));
    }
    return points;
  }, [rotationRef.current]);

  const generateMRNAPoints = useCallback((offsetX = 0) => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 9; i++) {
      points.push(new THREE.Vector3(1.5 + offsetX, (i - 4) * 1.2, 0));
    }
    return points;
  }, []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-4, 0, 0]} intensity={0.4} color="#3b82f6" />
      <pointLight position={[2, 0, 0]} intensity={step >= 3 ? 0.4 : 0} color="#f97316" />
      <pointLight position={[4, 2, 0]} intensity={step >= 3 ? 0.4 : 0} color="#8b5cf6" />

      <OrbitControls enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        {showLabels && (
          <Html position={[0, 8, 0]} distanceFactor={10}>
            <div className="bg-gray-900/95 px-4 py-3 rounded-xl border border-gray-700 shadow-xl">
              <div className="text-white text-lg font-bold">
                {STEPS[step].phase}: {STEPS[step].name}
              </div>
              <div className="text-gray-300 text-sm mt-1">{STEPS[step].desc}</div>
              {(step === 4 || step === 5) && (
                <div className="text-gray-400 text-xs mt-2">
                  Bộ ba: {currentCodon} | Axit amin: {currentAminoAcid} | Protein: {proteinLength}/8
                </div>
              )}
              {step === 1 && (
                <div className="text-gray-400 text-xs mt-2">
                  Nu đã tổng hợp: {Math.floor(nucleotidesTranscribedRef.current)}/15
                </div>
              )}
            </div>
          </Html>
        )}

        {step <= 2 && (
          <group>
            <mesh position={[-3, 1.5, 0]}>
              <sphereGeometry args={[Math.max(0.01, 5.5), 32, 32]} />
              <meshStandardMaterial color="#1e3a5f" transparent opacity={0.12} side={THREE.BackSide} />
            </mesh>

            <Line points={generateDNAHelixPoints()} color="#3b82f6" lineWidth={3} opacity={0.7} transparent />
            <Line points={generateDNAHelixPoints().map(p => new THREE.Vector3(p.x + 0.4, p.y, p.z + 0.4))} color="#60a5fa" lineWidth={3} opacity={0.7} transparent />

            {DNA_SEQUENCE.map((base, i) => (
              <group key={i}>
                <mesh position={[Math.cos(i * 0.5 + rotationRef.current) * 1.3 - 4, i * 0.5 - 4, Math.sin(i * 0.5 + rotationRef.current) * 1.3]}>
                  <sphereGeometry args={[Math.max(0.01, 0.14), 10, 10]} />
                  <meshStandardMaterial color={DNA_COLORS[base as keyof typeof DNA_COLORS]} />
                </mesh>
                <mesh position={[Math.cos(i * 0.5 + rotationRef.current) * 1.3 - 4 + 0.4, i * 0.5 - 4, Math.sin(i * 0.5 + rotationRef.current) * 1.3 + 0.4]}>
                  <sphereGeometry args={[Math.max(0.01, 0.14), 10, 10]} />
                  <meshStandardMaterial color={DNA_COLORS[COMPLEMENTARY_DNA[base as keyof typeof COMPLEMENTARY_DNA] as keyof typeof DNA_COLORS]} />
                </mesh>
              </group>
            ))}

            {(step >= 0 && step <= 2) && (
              <group position={[-4, -4 + (rnapProgressRef.current / 100) * 5, 1.5]}>
                <mesh>
                  <sphereGeometry args={[Math.max(0.01, 1), 16, 16]} />
                  <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.4} />
                </mesh>
                {showLabels && (
                  <Html position={[1.8, 0, 0]} distanceFactor={10}>
                    <div className="bg-red-600/95 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                      RNA Polymerase
                    </div>
                  </Html>
                )}
              </group>
            )}

            {step >= 1 && (
              <group position={[-2.5, -4 + (rnapProgressRef.current / 100) * 5, 0]}>
                {Array.from({ length: Math.floor((rnapProgressRef.current / 100) * 8) }).map((_, i) => (
                  <group key={i} position={[i * 0.4, 0, 0]}>
                    <mesh>
                      <sphereGeometry args={[Math.max(0.01, 0.1), 8, 8]} />
                      <meshStandardMaterial color={MRNA_COLORS.A} />
                    </mesh>
                    <mesh position={[0.08, 0.08, 0]}>
                      <sphereGeometry args={[Math.max(0.01, 0.08), 8, 8]} />
                      <meshStandardMaterial color={MRNA_COLORS[['A', 'U', 'G', 'C'][i % 4] as keyof typeof MRNA_COLORS]} />
                    </mesh>
                  </group>
                ))}
              </group>
            )}

            {step === 2 && (
              <group position={[-2.5 + (exitProgressRef.current / 100) * 5, 0, 0]}>
                <Line points={generateMRNAPoints()} color="#f97316" lineWidth={2.5} opacity={0.8} transparent />
                {MRNA_CODONS.map((codon, i) => (
                  <group key={i} position={[1.5, (i - 4) * 1.2, 0]}>
                    {codon.map((base, j) => (
                      <mesh key={j} position={[j * 0.3, 0, 0]}>
                        <sphereGeometry args={[Math.max(0.01, 0.14), 10, 10]} />
                        <meshStandardMaterial color={MRNA_COLORS[base as keyof typeof MRNA_COLORS]} />
                      </mesh>
                    ))}
                  </group>
                ))}
              </group>
            )}

            {step === 2 && showLabels && (
              <Html position={[0.5, 0, 0]} distanceFactor={10}>
                <div className="bg-blue-500/95 text-white px-2 py-1 rounded-lg text-xs font-bold">
                  Lỗ màng nhân → Tế bào chất
                </div>
              </Html>
            )}
          </group>
        )}

        {step >= 3 && (
          <group>
            <Line points={generateMRNAPoints()} color="#f97316" lineWidth={2.5} opacity={0.8} transparent />

            {MRNA_CODONS.map((codon, i) => {
              const isProcessed = i < aminoAcidsFormedRef.current;
              const isCurrent = Math.floor(codonIndexRef.current) === i;

              return (
                <group key={i} position={[1.5, (i - 4) * 1.2, 0]}>
                  {codon.map((base, j) => (
                    <mesh key={j} position={[j * 0.32, 0, 0]}>
                      <sphereGeometry args={[Math.max(0.01, 0.15), 10, 10]} />
                      <meshStandardMaterial
                        color={MRNA_COLORS[base as keyof typeof MRNA_COLORS]}
                        emissive={isCurrent ? MRNA_COLORS[base as keyof typeof MRNA_COLORS] : '#000000'}
                        emissiveIntensity={isCurrent ? 0.5 : 0}
                      />
                    </mesh>
                  ))}

                  {isCurrent && showLabels && (
                    <group position={[1, 0, 0.6]}>
                      <mesh>
                        <sphereGeometry args={[Math.max(0.01, 0.35), 12, 12]} />
                        <meshStandardMaterial color={TRNA_COLOR} emissive={TRNA_COLOR} emissiveIntensity={0.4} />
                      </mesh>
                      {codon.map((base, j) => (
                        <mesh key={j} position={[0.2, j * 0.16 - 0.16, 0.25]}>
                          <sphereGeometry args={[Math.max(0.01, 0.09), 8, 8]} />
                          <meshStandardMaterial color={MRNA_COLORS[COMPLEMENTARY_MRNA[base as keyof typeof COMPLEMENTARY_MRNA] as keyof typeof MRNA_COLORS]} />
                        </mesh>
                      ))}
                      {showLabels && (
                        <Html position={[0, 0.7, 0]} distanceFactor={12}>
                          <div className="bg-green-500/95 text-white px-2 py-1 rounded text-xs font-bold">
                            tRNA
                          </div>
                        </Html>
                      )}
                    </group>
                  )}

                  {isProcessed && (
                    <mesh position={[1.8, 0, 0]}>
                      <sphereGeometry args={[Math.max(0.01, 0.38), 16, 16]} />
                      <meshStandardMaterial color={AMINO_ACIDS[i].color} emissive={AMINO_ACIDS[i].color} emissiveIntensity={0.35} />
                    </mesh>
                  )}

                  {isProcessed && i % 2 === 0 && showLabels && (
                    <Html position={[1.8, 0.7, 0]} distanceFactor={12}>
                      <div className="px-2 py-1 rounded text-xs font-bold whitespace-nowrap" style={{ backgroundColor: AMINO_ACIDS[i].color, color: 'white' }}>
                        {AMINO_ACIDS[i].name}
                      </div>
                    </Html>
                  )}
                </group>
              );
            })}

            <group position={[3.5, 2, 0]}>
              <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[Math.max(0.01, 1.4), 16, 16]} />
                <meshStandardMaterial color={RIBOSOME_COLORS.large} emissive={RIBOSOME_COLORS.large} emissiveIntensity={0.25} roughness={0.4} />
              </mesh>
              <mesh position={[0, -0.7, 0]}>
                <sphereGeometry args={[Math.max(0.01, 1.1), 16, 16]} />
                <meshStandardMaterial color={RIBOSOME_COLORS.small} roughness={0.4} />
              </mesh>
              {showLabels && (
                <Html position={[0, 2.2, 0]} distanceFactor={10}>
                  <div className="bg-purple-500/95 text-white px-2 py-1 rounded-lg text-xs font-bold">
                    Ribosome
                  </div>
                </Html>
              )}
            </group>

            {aminoAcidsFormedRef.current > 0 && (
              <group position={[4.5, 0, 1]}>
                {Array.from({ length: Math.floor(aminoAcidsFormedRef.current) }).map((_, i) => (
                  <mesh key={i} position={[0, (i - Math.floor(aminoAcidsFormedRef.current) / 2) * 0.55, 0]}>
                    <sphereGeometry args={[Math.max(0.01, 0.32), 12, 12]} />
                    <meshStandardMaterial color={AMINO_ACIDS[i].color} emissive={AMINO_ACIDS[i].color} emissiveIntensity={0.25} />
                  </mesh>
                ))}
              </group>
            )}

            {step === 5 && foldingProgressRef.current > 0 && (
              <group position={[6, -1, 0]} rotation={[0, foldingProgressRef.current * 0.06, 0]}>
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  const radius = 0.9 + Math.sin(angle * 2.5) * 0.25;
                  return (
                    <mesh key={i} position={[
                      Math.cos(angle) * radius,
                      Math.sin(angle * 3.5) * 0.6,
                      Math.sin(angle) * radius
                    ]}>
                      <sphereGeometry args={[Math.max(0.01, 0.42), 16, 16]} />
                      <meshStandardMaterial color={AMINO_ACIDS[i].color} emissive={AMINO_ACIDS[i].color} emissiveIntensity={0.35} />
                    </mesh>
                  );
                })}
                {showLabels && (
                  <Html position={[0, 1.8, 0]} distanceFactor={10}>
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg">
                      ✨ Protein hoàn chỉnh!
                    </div>
                  </Html>
                )}
              </group>
            )}
          </group>
        )}

        {showLabels && step >= 2 && (
          <group>
            <Html position={[0, -6, 0]} distanceFactor={10}>
              <div className="bg-gray-800/95 px-4 py-2 rounded-lg border border-gray-600">
                <div className="text-white text-sm font-bold text-center">
                  DNA <span className="text-gray-400">→</span> mRNA <span className="text-gray-400">→</span> Protein
                </div>
                <div className="text-gray-400 text-xs text-center mt-1">
                  Dogma trung tâm sinh học phân tử
                </div>
              </div>
            </Html>
          </group>
        )}

        {showLabels && (
          <Html position={[-7, -5, 0]} distanceFactor={10}>
            <div className="bg-gray-900/95 px-3 py-2 rounded-lg border border-gray-700 text-xs shadow-lg">
              <div className="text-white font-bold mb-2">Phân tử</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-300">DNA</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-gray-300">mRNA</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-300">tRNA</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-gray-300">Ribosome</span>
                </div>
              </div>
            </div>
          </Html>
        )}
      </group>
    </>
  );
}
