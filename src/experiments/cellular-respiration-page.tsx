'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ExperimentContainer,
  SimulationController,
  FloatingControlPanel,
  DataPanel,
} from '@/components/experiment-ui';
import { ControlGroup, ControlSlider, DataGrid } from '@/components/experiment-ui/ExperimentControls';
import CellularRespirationSceneComponent, { CellularRespirationData } from './cellular-respiration-scene';

const STAGE_LABELS = [
  'Đường phân',
  'Oxi hóa Pyruvate',
  'Chu trình Krebs',
  'Chuỗi chuyền electron',
];

export default function CellularRespirationPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [stage, setStage] = useState(0);
  const [showLabels, setShowLabels] = useState(true);

  const [respirationData, setRespirationData] = useState<CellularRespirationData>({
    stage: 'Đường phân',
    atpProduced: 0,
    glucoseRemaining: 100,
    co2Produced: 0,
    nadhCount: 0,
    fadh2Count: 0,
    description: 'Glucose (6C) phân tách thành 2 pyruvate (3C) trong tế bào chất. Thu ròng: 2 ATP + 2 NADH.',
    atpFromGlycolysis: 0,
    atpFromPyruvate: 0,
    atpFromKrebs: 0,
    atpFromETC: 0,
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setStage(0);
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setSimulationSpeed(speed);
  }, []);

  const handleDataChange = useCallback((data: CellularRespirationData) => {
    setRespirationData(data);
  }, []);

  const parameterControls = useMemo(
    () => (
      <>
        <ControlGroup title="Các giai đoạn hô hấp tế bào">
          {STAGE_LABELS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStage(i)}
              className={`w-full px-3 py-2 rounded text-sm transition-colors mb-2 text-left ${
                stage === i
                  ? 'bg-[#ef4444] text-white font-bold'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {i + 1}. {s}
            </button>
          ))}
        </ControlGroup>

        <ControlGroup title="Tổng kết năng lượng ATP">
          <div className="bg-gray-800/50 rounded-lg p-3 text-xs space-y-2">
            <div className="flex justify-between text-gray-400">
              <span>Đường phân:</span>
              <span className="text-blue-400">{respirationData.atpFromGlycolysis} ATP</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Oxi hóa Pyruvate:</span>
              <span className="text-orange-400">{respirationData.atpFromPyruvate} ATP</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Chu trình Krebs:</span>
              <span className="text-green-400">{respirationData.atpFromKrebs} ATP</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Chuỗi chuyền e⁻:</span>
              <span className="text-cyan-400">{respirationData.atpFromETC} ATP</span>
            </div>
            <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between text-gray-300 font-bold">
              <span>Tổng cộng:</span>
              <span className="text-green-400">{respirationData.atpProduced}/38 ATP</span>
            </div>
          </div>
        </ControlGroup>

        <ControlGroup title="Hiển thị">
          <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="w-4 h-4 rounded accent-[#ef4444]"
            />
            Hiển thị nhãn
          </label>
        </ControlGroup>
      </>
    ),
    [stage, showLabels, respirationData]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          stage: { value: 0, unit: respirationData.stage, color: '#ef4444', decimals: 0 },
          atpProduced: { value: respirationData.atpProduced, unit: '/38 ATP', color: '#22c55e', decimals: 0 },
          glucose: { value: respirationData.glucoseRemaining, unit: '%', color: '#3b82f6', decimals: 0 },
          co2: { value: respirationData.co2Produced, unit: 'CO₂', color: '#6b7280', decimals: 0 },
          nadh: { value: respirationData.nadhCount, unit: 'NADH', color: '#f59e0b', decimals: 0 },
          fadh2: { value: respirationData.fadh2Count, unit: 'FADH₂', color: '#a855f7', decimals: 0 },
          status: { value: isPlaying ? 1 : 0, unit: isPlaying ? 'Đang chạy' : 'Tạm dừng', color: '#22c55e', decimals: 0 },
        }}
        columns={2}
      />
    ),
    [respirationData, isPlaying]
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
        title="Hô hấp tế bào"
        description="Quá trình tạo năng lượng ATP qua 4 giai đoạn: ~38 ATP từ mỗi phân tử glucose"
        cameraPosition={[0, 0, 13]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
      >
        <CellularRespirationSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          stage={stage}
          showLabels={showLabels}
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
        <FloatingControlPanel initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 340 : 1260, y: 80 }}>
          {parameterControls}
        </FloatingControlPanel>
      )}

      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="fixed top-20 right-4 z-20 px-4 py-2 bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-[#ef4444] rounded-lg border border-[#ef4444]/50 transition-colors text-sm font-medium"
        >
          Hiện bảng điều khiển
        </button>
      )}
    </div>
  );
}
