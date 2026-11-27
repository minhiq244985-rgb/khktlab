'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExperimentContainer,
  SimulationController,
  FloatingControlPanel,
  DataPanel,
} from '@/components/experiment-ui';
import { ControlGroup, ControlSlider, DataGrid } from '@/components/experiment-ui/ExperimentControls';
import CellStructureSceneComponent, { CellStructureData } from './cell-structure-scene';

const ORGANELLE_LABELS: Record<string, string> = {
  None: 'Không có',
  Nucleus: 'Nhân tế bào',
  Mitochondria: 'Ti thể',
  ER: 'Lưới nội chất',
  Golgi: 'Bộ máy Golgi',
  Ribosomes: 'Ribosome',
  Lysosome: 'Tiêu thể (Lysosome)',
  Membrane: 'Màng tế bào',
};

export default function CellStructurePage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [showLabels, setShowLabels] = useState(true);
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [showNucleus, setShowNucleus] = useState(true);
  const [showMitochondria, setShowMitochondria] = useState(true);
  const [showER, setShowER] = useState(true);
  const [showGolgi, setShowGolgi] = useState(true);
  const [showRibosomes, setShowRibosomes] = useState(true);
  const [showLysosomes, setShowLysosomes] = useState(true);
  const [showMembrane, setShowMembrane] = useState(true);

  const [cellData, setCellData] = useState<CellStructureData>({
    selectedOrganelle: 'None',
    organelleCount: 7,
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setShowLabels(true);
    setRotationEnabled(true);
    setShowNucleus(true);
    setShowMitochondria(true);
    setShowER(true);
    setShowGolgi(true);
    setShowRibosomes(true);
    setShowLysosomes(true);
    setShowMembrane(true);
    setCellData({ selectedOrganelle: 'None', organelleCount: 7 });
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setSimulationSpeed(speed);
  }, []);

  const handleDataChange = useCallback((data: CellStructureData) => {
    setCellData(data);
  }, []);

  const parameterControls = useMemo(
    () => (
      <>
        <ControlGroup title="Tùy chọn hiển thị">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="w-4 h-4 accent-[#06d6a0]"
              />
              <span className="text-gray-300">Hiển thị nhãn</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={rotationEnabled}
                onChange={(e) => setRotationEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#06d6a0]"
              />
              <span className="text-gray-300">Tự động xoay</span>
            </label>
          </div>
        </ControlGroup>

        <ControlGroup title="Các bào quan">
          <div className="space-y-2">
            {[
              { key: 'nucleus', label: 'Nhân tế bào', state: showNucleus, setter: setShowNucleus },
              { key: 'mitochondria', label: 'Ti thể', state: showMitochondria, setter: setShowMitochondria },
              { key: 'er', label: 'Lưới nội chất', state: showER, setter: setShowER },
              { key: 'golgi', label: 'Bộ máy Golgi', state: showGolgi, setter: setShowGolgi },
              { key: 'ribosomes', label: 'Ribosome', state: showRibosomes, setter: setShowRibosomes },
              { key: 'lysosomes', label: 'Tiêu thể (Lysosome)', state: showLysosomes, setter: setShowLysosomes },
              { key: 'membrane', label: 'Màng tế bào', state: showMembrane, setter: setShowMembrane },
            ].map((org) => (
              <label key={org.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={org.state}
                  onChange={(e) => org.setter(e.target.checked)}
                  className="w-4 h-4 accent-[#06d6a0]"
                />
                <span className="text-gray-300">{org.label}</span>
              </label>
            ))}
          </div>
        </ControlGroup>

        <button
          onClick={() => router.push('/experiments/cell-structure/details')}
          className="w-full mt-4 px-4 py-2 bg-[#06d6a0]/20 hover:bg-[#06d6a0]/30 text-[#06d6a0] rounded-lg border border-[#06d6a0]/50 transition-colors text-sm font-medium"
        >
          Xem chi tiết
        </button>
      </>
    ),
    [
      showLabels,
      rotationEnabled,
      showNucleus,
      showMitochondria,
      showER,
      showGolgi,
      showRibosomes,
      showLysosomes,
      showMembrane,
      router,
    ]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          organelles: { value: cellData.organelleCount, unit: 'tổng số', color: '#06d6a0', decimals: 0 },
          selected: { value: 1, unit: ORGANELLE_LABELS[cellData.selectedOrganelle] || cellData.selectedOrganelle, color: '#3b82f6', decimals: 0 },
          status: { value: isPlaying ? 1 : 0, unit: isPlaying ? 'Đang chạy' : 'Tạm dừng', color: '#22c55e', decimals: 0 },
        }}
        columns={2}
      />
    ),
    [cellData, isPlaying]
  );

  const dataPanel = useMemo(
    () => (
      <DataPanel isVisible={showData} onToggle={() => setShowData((d) => !d)}>
        {dataContent}
      </DataPanel>
    ),
    [showData, dataContent]
  );

  return (
    <div className="w-full h-screen relative">
      <ExperimentContainer
        title="Cấu trúc tế bào động vật"
        description="Khám phá các bào quan của tế bào động vật trong không gian 3D - Nhấp để làm nổi bật"
        cameraPosition={[0, 2, 10]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
      >
        <CellStructureSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          showLabels={showLabels}
          rotationEnabled={rotationEnabled}
          showNucleus={showNucleus}
          showMitochondria={showMitochondria}
          showER={showER}
          showGolgi={showGolgi}
          showRibosomes={showRibosomes}
          showLysosomes={showLysosomes}
          showMembrane={showMembrane}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={handleSpeedChange}
        timeElapsed={0}
      />

      {showControls && (
        <FloatingControlPanel
            initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 340 : 1260, y: 80 }}
        >
          {parameterControls}
        </FloatingControlPanel>
      )}

      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="fixed top-20 right-4 z-20 px-4 py-2 bg-[#06d6a0]/20 hover:bg-[#06d6a0]/30 text-[#06d6a0] rounded-lg border border-[#06d6a0]/50 transition-colors text-sm font-medium"
        >
          Hiện bảng điều khiển
        </button>
      )}
    </div>
  );
}
