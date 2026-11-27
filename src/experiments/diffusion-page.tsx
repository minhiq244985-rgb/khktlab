'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExperimentContainer,
  SimulationController,
  FloatingControlPanel,
  DataPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
} from '@/components/experiment-ui';
import DiffusionSceneComponent, { DiffusionData } from './diffusion-scene';

export default function DiffusionPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [temperature, setTemperature] = useState(1);
  const [poreSize, setPoreSize] = useState(1);
  const [particleCount, setParticleCount] = useState(1);

  const [diffusionData, setDiffusionData] = useState<DiffusionData>({
    leftConcentration: 50,
    rightConcentration: 10,
    temperature: 298,
    timeElapsed: 0,
    equilibrium: 0,
    gradientIndex: 0,
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setTemperature(1);
    setPoreSize(1);
    setParticleCount(1);
  }, []);

  const handleSpeedChange = useCallback((s: number) => {
    setSimulationSpeed(s);
  }, []);

  const handleDataChange = useCallback((data: DiffusionData) => {
    setDiffusionData(data);
  }, []);

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Tham số khuếch tán">
        <ControlSlider
          label="Nhiệt độ"
          value={temperature}
          unit=""
          min={0.5}
          max={3}
          step={0.1}
          color="#f59e0b"
          onChange={setTemperature}
          decimals={1}
        />
        <ControlSlider
          label="Kích thước lỗ màng"
          value={poreSize}
          unit=""
          min={0.1}
          max={1}
          step={0.1}
          color="#8b5cf6"
          onChange={setPoreSize}
          decimals={1}
        />
        <ControlSlider
          label="Số lượng hạt"
          value={particleCount}
          unit="x"
          min={0.5}
          max={2}
          step={0.1}
          color="#06b6d4"
          onChange={setParticleCount}
          decimals={1}
        />
      </ControlGroup>

      <button
        onClick={() => router.push('/experiments/diffusion/details')}
        className="w-full py-2.5 bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-700 font-medium text-sm rounded-lg transition-all border border-purple-300/50 flex items-center justify-center gap-2"
      >
        📖 Xem chi tiết thí nghiệm
      </button>
    </div>
  );

  const dataPanelContent = (
    <>
      <DataGrid
        data={{
          leftConcentration: { value: diffusionData.leftConcentration, unit: 'hạt', color: '#ef4444', decimals: 0 },
          rightConcentration: { value: diffusionData.rightConcentration, unit: 'hạt', color: '#3b82f6', decimals: 0 },
          equilibrium: { value: diffusionData.equilibrium, unit: '%', color: '#22c55e', decimals: 1 },
          temperature: { value: diffusionData.temperature, unit: 'K', color: '#f59e0b', decimals: 0 },
        }}
        columns={2}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Thời gian đã trôi qua:</span>
          <span className="font-mono text-purple-400">
            {diffusionData.timeElapsed.toFixed(1)}s
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-gray-400 text-sm">Trạng thái:</span>
          <span className="font-mono text-green-400 text-sm">
            {diffusionData.equilibrium >= 95 ? '⚖️ Cân bằng' : '↔️ Đang khuếch tán...'}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <ExperimentContainer
        title="Khuếch tán phân tử"
        description="Chuyển động của các hạt từ vùng nồng độ cao sang vùng nồng độ thấp qua màng bán thấm"
        cameraPosition={[0, 2, 12]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <DiffusionSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          temperature={temperature}
          poreSize={poreSize}
          particleCount={particleCount}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={handleSpeedChange}
      />

      <FloatingControlPanel
        title="⚙️ Tham số khuếch tán"
        initialPosition={{ x: 20, y: 80 }}
      >
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel
        isVisible={showDataPanel}
        onToggle={() => setShowDataPanel(!showDataPanel)}
      >
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
