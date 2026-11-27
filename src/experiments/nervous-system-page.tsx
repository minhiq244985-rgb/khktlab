'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ExperimentContainer,
  SimulationController,
  FloatingControlPanel,
  DataPanel,
} from '@/components/experiment-ui';
import { ControlGroup, ControlSlider, DataGrid } from '@/components/experiment-ui/ExperimentControls';
import NervousSystemSceneComponent, { NervousSystemData } from './nervous-system-scene';

export default function NervousSystemPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);

  const [stepMode, setStepMode] = useState(false);
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showIonChannels, setShowIonChannels] = useState(true);
  const [showMyelin, setShowMyelin] = useState(true);

  const [nervousData, setNervousData] = useState<NervousSystemData>({
    voltage: -70,
    phase: 'Trạng thái nghỉ',
    naStatus: 'Đóng',
    kStatus: 'Đóng',
    speed: 120,
    description: 'Nơron ở điện thế nghỉ (-70mV)',
  });

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setStep(0);
  }, []);

  const handleSpeedChange = useCallback((s: number) => {
    setSimulationSpeed(s);
  }, []);

  const handleDataChange = useCallback((data: NervousSystemData) => {
    setNervousData(data);
  }, []);

  const parameterControls = useMemo(
    () => (
      <>
        <ControlGroup title="Điều khiển nơron">
          <ControlSlider
            label="Tốc độ"
            value={speed}
            min={0.5}
            max={3}
            step={0.1}
            onChange={setSpeed}
            color="#ec4899"
            decimals={1}
          />

          <label className="flex items-center gap-2 text-sm mt-3">
            <input
              type="checkbox"
              checked={stepMode}
              onChange={(e) => {
                setStepMode(e.target.checked);
                if (!e.target.checked) setStep(0);
              }}
              className="w-4 h-4 accent-[#ec4899]"
            />
            <span className="text-gray-300">Chế độ từng bước</span>
          </label>

          {stepMode && (
            <div className="mt-2 space-y-1">
              <div className="text-xs text-gray-400 mb-1">Chuyển qua các giai đoạn:</div>
              {['Trạng thái nghỉ', 'Kích thích', 'Khử cực', 'Tái phân cực', 'Ưu phân cực', 'Xináp'].map((phase, i) => (
                <button
                  key={phase}
                  onClick={() => setStep(i)}
                  className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                    step === i
                      ? 'bg-pink-500/30 text-pink-400 border border-pink-500/50'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  {i + 1}. {phase}
                </button>
              ))}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm mt-3">
            <input
              type="checkbox"
              checked={showIonChannels}
              onChange={(e) => setShowIonChannels(e.target.checked)}
              className="w-4 h-4 accent-[#06b6d4]"
            />
            <span className="text-gray-300">Hiển thị kênh ion</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showMyelin}
              onChange={(e) => setShowMyelin(e.target.checked)}
              className="w-4 h-4 accent-[#fde047]"
            />
            <span className="text-gray-300">Hiển thị bao Myelin</span>
          </label>
        </ControlGroup>

        <div className="bg-pink-50/50 rounded-lg p-3 border border-pink-200/50">
          <div className="text-xs text-gray-600 mb-2 font-medium">Các giai đoạn điện thế hoạt động</div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>1. <strong>Trạng thái nghỉ:</strong> -70mV, các kênh đóng</div>
            <div>2. <strong>Kích thích:</strong> Tín hiệu tới các sợi nhánh</div>
            <div>3. <strong>Khử cực:</strong> Ion Na+ tràn VÀO (+40mV)</div>
            <div>4. <strong>Tái phân cực:</strong> Ion K+ tràn RA</div>
            <div>5. <strong>Ưu phân cực:</strong> Điện thế giảm dưới -70mV</div>
            <div>6. <strong>Xináp:</strong> Giải phóng chất dẫn truyền thần kinh</div>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="w-full mt-4 px-4 py-2 bg-[#ec4899]/20 hover:bg-[#ec4899]/30 text-[#ec4899] rounded-lg border border-[#ec4899]/50 transition-colors text-sm font-medium"
        >
          Đặt lại mô phỏng
        </button>
      </>
    ),
    [stepMode, step, speed, showIonChannels, showMyelin, handleReset]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          voltage: { value: nervousData.voltage, unit: "mV", color: nervousData.voltage > 0 ? "#22d3ee" : "#ec4899", decimals: 0 },
          na: { value: nervousData.naStatus.includes('MỞ') ? 1 : 0, unit: nervousData.naStatus, color: "#ef4444", decimals: 0 },
          k: { value: nervousData.kStatus.includes('MỞ') ? 1 : 0, unit: nervousData.kStatus, color: "#3b82f6", decimals: 0 },
          speed: { value: nervousData.speed, unit: "m/s", color: "#fbbf24", decimals: 0 },
        }}
        columns={1}
      />
    ),
    [nervousData]
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
        title="Nơron & Xináp"
        description="Mô phỏng sự lan truyền điện thế hoạt động và dẫn truyền qua xináp theo từng bước"
        cameraPosition={[0, 6, 20]}
        backgroundColor="#0a0a0f"
        controls={null}
        dataPanel={dataPanel}
      >
        <NervousSystemSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          stepMode={stepMode}
          speed={speed}
          showIonChannels={showIonChannels}
          showMyelin={showMyelin}
          step={step}
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
          className="fixed top-20 right-4 z-20 px-4 py-2 bg-[#ec4899]/20 hover:bg-[#ec4899]/30 text-[#ec4899] rounded-lg border border-[#ec4899]/50 transition-colors text-sm font-medium"
        >
          Hiện bảng điều khiển
        </button>
      )}
    </div>
  );
}
