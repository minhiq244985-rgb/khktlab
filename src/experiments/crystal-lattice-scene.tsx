"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export interface CrystalLatticeData {
  latticeType: "FCC" | "BCC" | "HCP" | "diamond";
  unitCells: number;
  atomsPerCell: number;
  coordinationNumber: number;
  packingEfficiency: number;
  totalAtoms: number;
}

export interface CrystalLatticeSceneProps {
  latticeType: "FCC" | "BCC" | "HCP" | "diamond";
  showUnitCell: boolean;
  showBonds: boolean;
  isPlaying: boolean;
  onDataChange?: (data: CrystalLatticeData) => void;
}

/**
 * Component cảnh Mạng tinh thể - Tối ưu hiệu năng
 * Trực quan hóa cấu trúc tinh thể 3D: FCC, BCC, HCP và kim cương
 */
export function CrystalLatticeSceneComponent({
  latticeType,
  showUnitCell,
  showBonds,
  isPlaying,
  onDataChange
}: CrystalLatticeSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Ref hiệu năng - trạng thái vật lý cập nhật mỗi khung hình
  const frameCountRef = useRef(0);
  const rotationRef = useRef(0);

  // Trạng thái React - chỉ cập nhật mỗi 8 khung hình
  const [data, setData] = useState<CrystalLatticeData>({
    latticeType: "FCC",
    unitCells: 8,
    atomsPerCell: 4,
    coordinationNumber: 12,
    packingEfficiency: 0.74,
    totalAtoms: 32,
  });

  // Thuộc tính các cấu trúc tinh thể
  const latticeData: Record<"FCC" | "BCC" | "HCP" | "diamond", {
    atomsPerCell: number;
    coordinationNumber: number;
    packingEfficiency: number;
  }> = {
    FCC: { atomsPerCell: 4, coordinationNumber: 12, packingEfficiency: 0.74 },
    BCC: { atomsPerCell: 2, coordinationNumber: 8, packingEfficiency: 0.68 },
    HCP: { atomsPerCell: 6, coordinationNumber: 12, packingEfficiency: 0.74 },
    diamond: { atomsPerCell: 8, coordinationNumber: 4, packingEfficiency: 0.34 },
  };

  // Tạo vị trí mạng tinh thể bằng useMemo để tối ưu hiệu năng
  const getLatticePositions = (): THREE.Vector3[] => {
    const positions: THREE.Vector3[] = [];
    const spacing = 2;
    const layers = 2;

    if (latticeType === "FCC") {
      // Lập phương tâm mặt (Face-Centered Cubic)
      for (let x = 0; x < layers; x++) {
        for (let y = 0; y < layers; y++) {
          for (let z = 0; z < layers; z++) {
            // Nguyên tử ở đỉnh
            positions.push(new THREE.Vector3(x * spacing, y * spacing, z * spacing));
            // Nguyên tử ở tâm mặt
            positions.push(new THREE.Vector3(x * spacing + spacing/2, y * spacing + spacing/2, z * spacing));
            positions.push(new THREE.Vector3(x * spacing + spacing/2, y * spacing, z * spacing + spacing/2));
            positions.push(new THREE.Vector3(x * spacing, y * spacing + spacing/2, z * spacing + spacing/2));
          }
        }
      }
    } else if (latticeType === "BCC") {
      // Lập phương tâm khối (Body-Centered Cubic)
      for (let x = 0; x < layers; x++) {
        for (let y = 0; y < layers; y++) {
          for (let z = 0; z < layers; z++) {
            positions.push(new THREE.Vector3(x * spacing, y * spacing, z * spacing));
            positions.push(new THREE.Vector3(x * spacing + spacing/2, y * spacing + spacing/2, z * spacing + spacing/2));
          }
        }
      }
    } else if (latticeType === "HCP") {
      // Lục giác xếp chặt (Hexagonal Close-Packed)
      for (let layer = 0; layer < 3; layer++) {
        const offset = layer % 2 === 0 ? 0 : spacing/2;
        for (let x = -1; x <= 1; x++) {
          for (let z = -1; z <= 1; z++) {
            positions.push(new THREE.Vector3(
              (x + offset) * spacing,
              layer * spacing * 0.8,
              z * spacing * 0.866
            ));
          }
        }
      }
    } else if (latticeType === "diamond") {
      // Cấu trúc kim cương (hai mạng FCC lồng nhau)
      for (let x = 0; x < layers; x++) {
        for (let y = 0; y < layers; y++) {
          for (let z = 0; z < layers; z++) {
            positions.push(new THREE.Vector3(x * spacing, y * spacing, z * spacing));
            positions.push(new THREE.Vector3(x * spacing + spacing/2, y * spacing + spacing/2, z * spacing));
            positions.push(new THREE.Vector3(x * spacing + spacing/2, y * spacing, z * spacing + spacing/2));
            positions.push(new THREE.Vector3(x * spacing, y * spacing + spacing/2, z * spacing + spacing/2));
            positions.push(new THREE.Vector3(x * spacing + spacing/4, y * spacing + spacing/4, z * spacing + spacing/4));
            positions.push(new THREE.Vector3(x * spacing + spacing*0.75, y * spacing + spacing*0.75, z * spacing + spacing/4));
            positions.push(new THREE.Vector3(x * spacing + spacing*0.75, y * spacing + spacing/4, z * spacing + spacing*0.75));
            positions.push(new THREE.Vector3(x * spacing + spacing/4, y * spacing + spacing*0.75, z * spacing + spacing*0.75));
          }
        }
      }
    }
    return positions;
  };

  const atomPositions = useMemo(() => getLatticePositions(), [latticeType]);

  // Tạo đường liên kết bằng Line từ drei
  const bondLines = useMemo(() => {
    if (!showBonds) return [];

    const bonds: { start: [number, number, number]; end: [number, number, number] }[] = [];
    const maxDistance = latticeType === "diamond" ? 1.8 : 1.5;

    for (let i = 0; i < atomPositions.length; i++) {
      for (let j = i + 1; j < atomPositions.length; j++) {
        const dist = atomPositions[i].distanceTo(atomPositions[j]);
        if (dist < maxDistance && dist > 0.1) {
          bonds.push({
            start: [atomPositions[i].x, atomPositions[i].y, atomPositions[i].z],
            end: [atomPositions[j].x, atomPositions[j].y, atomPositions[j].z],
          });
        }
      }
    }

    return bonds;
  }, [atomPositions, latticeType, showBonds]);

  // Khung dây ô đơn vị bằng Line từ drei
  const unitCellLines = useMemo(() => {
    if (!showUnitCell) return [];

    const lines: { points: [number, number, number][] }[] = [];
    const edges = [
      [[0,0,0], [2,0,0]], [[2,0,0], [2,2,0]], [[2,2,0], [0,2,0]], [[0,2,0], [0,0,0]],
      [[0,0,2], [2,0,2]], [[2,0,2], [2,2,2]], [[2,2,2], [0,2,2]], [[0,2,2], [0,0,2]],
      [[0,0,0], [0,0,2]], [[2,0,0], [2,0,2]], [[2,2,0], [2,2,2]], [[0,2,0], [0,2,2]],
    ];

    edges.forEach(edge => {
      lines.push({ points: [edge[0] as [number, number, number], edge[1] as [number, number, number]] });
    });

    return lines;
  }, [showUnitCell]);

  // Căn giữa mạng tinh thể
  const centerOffset = useMemo(() => {
    const center = new THREE.Vector3();
    atomPositions.forEach(pos => center.add(pos));
    center.divideScalar(atomPositions.length);
    return center.negate();
  }, [atomPositions]);

  // Cập nhật dữ liệu có chu kỳ (mỗi 8 khung hình)
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (isPlaying) {
      rotationRef.current += delta * 0.15;
      groupRef.current.rotation.y = rotationRef.current;
      groupRef.current.rotation.x = Math.sin(rotationRef.current * 0.3) * 0.05;
    }

    frameCountRef.current++;

    if (frameCountRef.current % 8 === 0) {
      const newData: CrystalLatticeData = {
        latticeType,
        unitCells: 8,
        atomsPerCell: latticeData[latticeType].atomsPerCell,
        coordinationNumber: latticeData[latticeType].coordinationNumber,
        packingEfficiency: latticeData[latticeType].packingEfficiency,
        totalAtoms: atomPositions.length,
      };

      setData(newData);
      onDataChange?.(newData);
    }
  });

  // Lấy màu nguyên tử theo vị trí
  const getAtomColor = (index: number) => {
    const colors = ["#a855f7", "#ec4899", "#8b5cf6", "#d946ef"];
    return colors[index % colors.length];
  };

  return (
    <>
      <group ref={groupRef} position={[centerOffset.x, centerOffset.y, centerOffset.z]}>
        {/* Khung dây ô đơn vị bằng Line từ drei */}
        {unitCellLines.map((line, i) => (
          <Line
            key={`unit-cell-${i}`}
            points={line.points}
            color="#a855f7"
            lineWidth={2}
            opacity={0.6}
            transparent
          />
        ))}

        {/* Làm nổi bật các đỉnh */}
        {showUnitCell && [
          [0,0,0], [2,0,0], [2,2,0], [0,2,0],
          [0,0,2], [2,0,2], [2,2,2], [0,2,2],
        ].map((pos, i) => (
          <mesh key={`corner-${i}`} position={pos as [number, number, number]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.5} />
          </mesh>
        ))}

        {/* Đường liên kết bằng Line từ drei */}
        {bondLines.map((bond, i) => (
          <Line
            key={`bond-${i}`}
            points={[bond.start, bond.end]}
            color="#a855f7"
            lineWidth={3}
            opacity={0.4}
            transparent
          />
        ))}

        {/* Các nguyên tử */}
        {atomPositions.map((pos, i) => (
          <mesh key={i} position={pos} castShadow>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial
              color={getAtomColor(i)}
              emissive={getAtomColor(i)}
              emissiveIntensity={0.3}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>

      <gridHelper args={[12, 24, "#1a1a3e", "#1a1a3e"]} position={[0, -3, 0]} />
    </>
  );
}

export default CrystalLatticeSceneComponent;
