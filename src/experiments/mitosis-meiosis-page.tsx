'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ExperimentContainer,
  SimulationController,
  FloatingControlPanel,
  DataPanel,
} from '@/components/experiment-ui';
import { ControlGroup, ControlSlider, DataGrid } from '@/components/experiment-ui/ExperimentControls';
import MitosisMeiosisSceneComponent, { MitosisMeiosisData } from './mitosis-meiosis-scene';

export default function MitosisMeiosisPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [mode, setMode] = useState<'mitosis' | 'meiosis'>('mitosis');
  const [stage, setStage] = useState(0);
  const [showLabels, setShowLabels] = useState(true);

  const [divisionData, setDivisionData] = useState<MitosisMeiosisData>({
    phase: 'Kỳ đầu',
    chromosomesCount: 46,
    daughterCells: 1,
    description: 'Nhiễm sắc thể co xoắn và màng nhân tiêu biến.',
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

  const handleDataChange = useCallback((data: MitosisMeiosisData) => {
    setDivisionData(data);
  }, []);

  const handleModeChange = useCallback((newMode: 'mitosis' | 'meiosis') => {
    setMode(newMode);
    setStage(0);
  }, []);

  const mitosisPhases = ['Kỳ đầu', 'Kỳ giữa', 'Kỳ sau', 'Kỳ cuối', 'Phân chia tế bào chất'];
  const meiosisPhases = ['Kỳ đầu I', 'Kỳ giữa I', 'Kỳ sau I', 'Kỳ cuối I', 'Kỳ đầu II', 'Kỳ giữa II', 'Kỳ sau II', 'Kỳ cuối II'];

  const parameterControls = useMemo(
    () => (
      <>
        <ControlGroup title="Chế độ phân bào">
          <div className="flex gap-2">
            <button
              onClick={() => handleModeChange('mitosis')}
              className={`flex-1 px-3 py-2 rounded text-sm transition-colors font-medium ${
                mode === 'mitosis'
                  ? 'bg-[#f59e0b] text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Nguyên phân
            </button>
            <button
              onClick={() => handleModeChange('meiosis')}
              className={`flex-1 px-3 py-2 rounded text-sm transition-colors font-medium ${
                mode === 'meiosis'
                  ? 'bg-[#ec4899] text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Giảm phân
            </button>
          </div>
        </ControlGroup>

        <ControlGroup title="Các kỳ phân bào">
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {(mode === 'mitosis' ? mitosisPhases : meiosisPhases).map((phase, i) => (
              <button
                key={phase}
                onClick={() => setStage(i)}
                className={`w-full px-2 py-1.5 rounded text-xs transition-colors text-left ${
                  stage === i
                    ? mode === 'mitosis' ? 'bg-[#f59e0b] text-white font-bold' : 'bg-[#ec4899] text-white font-bold'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {i + 1}. {phase}
              </button>
            ))}
          </div>
        </ControlGroup>

        <ControlGroup title="Hiển thị">
          <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: mode === 'mitosis' ? '#f59e0b' : '#ec4899' }}
            />
            Hiển thị nhãn
          </label>
        </ControlGroup>

        <ControlGroup title="Thông tin chính">
          <div className={`text-xs ${mode === 'mitosis' ? 'bg-amber-900/30' : 'bg-pink-900/30'} rounded-lg p-3 space-y-2`}>
            {mode === 'mitosis' ? (
              <>
                <div className="flex justify-between text-gray-300">
                  <span>Tế bào ban đầu:</span>
                  <span className="text-amber-400">1</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tế bào kết thúc:</span>
                  <span className="text-amber-400">2</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Nhiễm sắc thể:</span>
                  <span className="text-amber-400">46 (lưỡng bội)</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Mục đích:</span>
                  <span className="text-amber-400">Sinh trưởng/Sửa chữa</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Biến dị di truyền:</span>
                  <span className="text-amber-400">Không</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-gray-300">
                  <span>Tế bào ban đầu:</span>
                  <span className="text-pink-400">1</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tế bào kết thúc:</span>
                  <span className="text-pink-400">4</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Nhiễm sắc thể:</span>
                  <span className="text-pink-400">23 (đơn bội)</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Mục đích:</span>
                  <span className="text-pink-400">Tạo giao tử</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Biến dị di truyền:</span>
                  <span className="text-pink-400">Có (trao đổi chéo)</span>
                </div>
              </>
            )}
          </div>
        </ControlGroup>
      </>
    ),
    [mode, stage, showLabels, handleModeChange]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          phase: { value: 0, unit: divisionData.phase, color: mode === 'mitosis' ? '#f59e0b' : '#ec4899', decimals: 0 },
          chromosomes: { value: divisionData.chromosomesCount, unit: 'NST', color: mode === 'mitosis' ? '#fbbf24' : '#f472b6', decimals: 0 },
          daughterCells: { value: divisionData.daughterCells, unit: 'tế bào', color: mode === 'mitosis' ? '#fcd34d' : '#fb7185', decimals: 0 },
          mode: { value: 0, unit: mode === 'mitosis' ? 'Nguyên phân' : 'Giảm phân', color: mode === 'mitosis' ? '#f59e0b' : '#ec4899', decimals: 0 },
          status: { value: isPlaying ? 1 : 0, unit: isPlaying ? 'Đang chạy' : 'Tạm dừng', color: '#22c55e', decimals: 0 },
        }}
        columns={2}
      />
    ),
    [divisionData, mode, isPlaying]
  );

  const dataPanel = useMemo(
    () => (
      <DataPanel isVisible={showData} onToggle={() => setShowData((d) => !d)}>
        {dataContent}
      </DataPanel>
    ),
    [showData, dataContent]
  );

  const primaryColor = mode === 'mitosis' ? '#f59e0b' : '#ec4899';

  return (
    <div className="w-full h-screen relative">
      <ExperimentContainer
        title="Nguyên phân & Giảm phân"
        description={mode === 'mitosis' ? 'Phân chia tế bào giúp sinh trưởng và sửa chữa - tạo ra các tế bào giống hệt nhau' : 'Hình thành giao tử kèm trao đổi chéo - tạo ra sự đa dạng di truyền'}
        cameraPosition={[0, 0, 14]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
      >
        <MitosisMeiosisSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          stage={stage}
          mode={mode}
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
          className="fixed top-20 right-4 z-20 px-4 py-2 rounded-lg border transition-colors text-sm font-medium"
          style={{
            backgroundColor: `${primaryColor}20`,
            color: primaryColor,
            borderColor: `${primaryColor}50`,
          }}
        >
          Hiện bảng điều khiển
        </button>
      )}
    </div>
  );
}
