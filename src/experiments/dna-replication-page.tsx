'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExperimentContainer,
  SimulationController,
  FloatingControlPanel,
  DataPanel,
} from '@/components/experiment-ui';
import { ControlGroup, ControlSlider, DataGrid } from '@/components/experiment-ui/ExperimentControls';
import DNAReplicationSceneComponent, { DNAReplicationData } from './dna-replication-scene';

export default function DNAReplicationPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showData, setShowData] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const [speed, setSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [step, setStep] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const [dnaData, setDnaData] = useState<DNAReplicationData>({
    step: 'Khởi đầu',
    stage: 'DNA ban đầu',
    nucleotidesAdded: 0,
    description: 'Phân tử DNA mạch kép còn nguyên vẹn.',
    leadingStrand: 0,
    laggingStrand: 0,
  });

  // Tự động chạy qua các bước
  useEffect(() => {
    if (autoPlay && isPlaying) {
      autoPlayRef.current = setTimeout(() => {
        if (step < 4) {
          setStep(step + 1);
        } else {
          setAutoPlay(false);
        }
      }, 6000 / simulationSpeed);
    }
    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    };
  }, [autoPlay, step, isPlaying, simulationSpeed]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setSpeed(1);
    setShowLabels(true);
    setStep(0);
    setAutoPlay(false);
    setDnaData({
      step: 'Khởi đầu',
      stage: 'DNA ban đầu',
      nucleotidesAdded: 0,
      description: 'Phân tử DNA mạch kép còn nguyên vẹn.',
      leadingStrand: 0,
      laggingStrand: 0,
    });
  }, []);

  const handleSpeedChange = useCallback((s: number) => {
    setSimulationSpeed(s);
  }, []);

  const handleDataChange = useCallback((data: DNAReplicationData) => {
    setDnaData(data);
  }, []);

  const parameterControls = useMemo(
    () => (
      <>
        <ControlGroup title="Điều khiển mô phỏng">
          <ControlSlider
            label="Tốc độ"
            value={speed}
            min={0.1}
            max={3}
            step={0.1}
            onChange={setSpeed}
          />
          <div className="mt-3 space-y-2">
            <label className="text-xs text-gray-400 block mb-2">Giai đoạn nhân đôi</label>
            {[
              'Khởi đầu',
              'Tháo xoắn',
              'Gắn đoạn mồi',
              'Kéo dài mạch',
              'Hoàn tất'
            ].map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(i)}
                className={`w-full px-3 py-2 rounded text-sm transition-colors ${
                  step === i
                    ? 'bg-[#3b82f6] text-white font-medium'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {i + 1}. {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`w-full mt-3 px-3 py-2 rounded text-sm font-medium transition-colors ${
              autoPlay
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {autoPlay ? '⏸ Đang tự động chạy' : '▶ Tự động chạy từng bước'}
          </button>
        </ControlGroup>

        <ControlGroup title="Tùy chọn hiển thị">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="w-4 h-4 accent-[#3b82f6]"
              />
              <span className="text-gray-300">Hiển thị nhãn</span>
            </label>
          </div>
        </ControlGroup>

        <button
          onClick={() => router.push('/experiments/dna-replication/details')}
          className="w-full mt-4 px-4 py-2 bg-[#3b82f6]/20 hover:bg-[#3b82f6]/30 text-[#3b82f6] rounded-lg border border-[#3b82f6]/50 transition-colors text-sm font-medium"
        >
          Xem chi tiết
        </button>
      </>
    ),
    [speed, step, showLabels, autoPlay, router]
  );

  const dataContent = useMemo(
    () => (
      <DataGrid
        data={{
          step: { value: 0, unit: dnaData.step, color: '#3b82f6', decimals: 0 },
          stage: { value: 0, unit: dnaData.stage, color: '#f59e0b', decimals: 0 },
          nucleotides: { value: dnaData.nucleotidesAdded, unit: 'nuclêôtit', color: '#22c55e', decimals: 0 },
          leading: { value: dnaData.leadingStrand, unit: 'mạch dẫn', color: '#3b82f6', decimals: 0 },
          lagging: { value: dnaData.laggingStrand, unit: 'mạch muộn', color: '#f59e0b', decimals: 0 },
          status: { value: isPlaying ? 1 : 0, unit: isPlaying ? 'Đang chạy' : 'Tạm dừng', color: '#22c55e', decimals: 0 },
        }}
        columns={2}
      />
    ),
    [dnaData, isPlaying]
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
        title="Nhân đôi DNA"
        description="Trực quan hóa từng bước quá trình nhân đôi DNA theo nguyên tắc bán bảo toàn"
        cameraPosition={[0, 0, 16]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={dataPanel}
      >
        <DNAReplicationSceneComponent
          onDataChange={handleDataChange}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
          speed={speed}
          showLabels={showLabels}
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
          className="fixed top-20 right-4 z-20 px-4 py-2 bg-[#3b82f6]/20 hover:bg-[#3b82f6]/30 text-[#3b82f6] rounded-lg border border-[#3b82f6]/50 transition-colors text-sm font-medium"
        >
          Hiện điều khiển
        </button>
      )}
    </div>
  );
}
