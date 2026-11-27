"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FourierTransformSceneComponent, FourierTransformData } from "@/experiments/fourier-transform-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

const WAVEFORMS = ["square", "triangle", "sawtooth", "custom"] as const;

const WAVEFORM_LABELS: Record<typeof WAVEFORMS[number], string> = {
  square: "Sóng vuông",
  triangle: "Sóng tam giác",
  sawtooth: "Sóng răng cưa",
  custom: "Tùy chỉnh",
};

export default function FourierTransformPage() {
  const router = useRouter();
  const [data, setData] = useState<FourierTransformData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Mô phỏng
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Thông số
  const [frequency, setFrequency] = useState(1);
  const [harmonicCount, setHarmonicCount] = useState(3);
  const [waveSpeed, setWaveSpeed] = useState(1);
  const [waveformType, setWaveformType] = useState<typeof WAVEFORMS[number]>("square");

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setFrequency(1);
    setHarmonicCount(3);
    setWaveSpeed(1);
    setWaveformType("square");
  };

  // === ĐIỀU KHIỂN THÔNG SỐ ===
  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Thông số sóng">
        <ControlSlider
          label="Tần số cơ bản"
          value={frequency}
          unit="Hz"
          min={0.5}
          max={3}
          step={0.1}
          color="#8b5cf6"
          onChange={setFrequency}
          decimals={1}
        />
        <ControlSlider
          label="Sóng hài"
          value={harmonicCount}
          unit="n"
          min={1}
          max={10}
          step={1}
          color="#a78bfa"
          onChange={setHarmonicCount}
          decimals={0}
        />
        <ControlSlider
          label="Tốc độ sóng"
          value={waveSpeed}
          unit=""
          min={0.1}
          max={3}
          step={0.1}
          color="#c4b5fd"
          onChange={setWaveSpeed}
          decimals={1}
        />
      </ControlGroup>

      <ControlGroup title="Dạng sóng">
        <div className="grid grid-cols-2 gap-2">
          {WAVEFORMS.map((wf) => (
            <button
              key={wf}
              onClick={() => setWaveformType(wf)}
              className={`py-2 px-3 text-sm rounded-lg transition-all ${
                waveformType === wf
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {WAVEFORM_LABELS[wf]}
            </button>
          ))}
        </div>
      </ControlGroup>

      <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-200/50">
        <div className="text-xs text-gray-600 mb-2 font-medium">Mẫu thiết lập nhanh</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setFrequency(1); setHarmonicCount(5); setWaveformType("square"); }}
            className="py-1.5 px-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded transition-all"
          >
            Sóng vuông
          </button>
          <button
            onClick={() => { setFrequency(1); setHarmonicCount(5); setWaveformType("triangle"); }}
            className="py-1.5 px-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded transition-all"
          >
            Tam giác
          </button>
          <button
            onClick={() => { setFrequency(1); setHarmonicCount(7); setWaveformType("sawtooth"); }}
            className="py-1.5 px-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded transition-all"
          >
            Răng cưa
          </button>
          <button
            onClick={() => { setFrequency(0.5); setHarmonicCount(2); setWaveformType("custom"); }}
            className="py-1.5 px-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded transition-all"
          >
            Đơn giản
          </button>
        </div>
      </div>

      <button
        onClick={() => router.push("/experiments/fourier-transform/details")}
        className="w-full py-2.5 bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-700 font-medium text-sm rounded-lg transition-all border border-purple-300/50 flex items-center justify-center gap-2"
      >
        📖 Xem chi tiết thí nghiệm
      </button>
    </div>
  );

  // === NỘI DUNG BẢNG DỮ LIỆU ===
  const dataPanelContent = data ? (
    <>
      <DataGrid
        data={{
          amplitude: { value: Math.abs(data.currentAmplitude), unit: "đơn vị", color: "#8b5cf6", decimals: 2 },
          frequency: { value: data.frequency, unit: "Hz", color: "#a78bfa", decimals: 1 },
          harmonics: { value: data.harmonicCount, unit: "sóng", color: "#c4b5fd", decimals: 0 },
          waveform: { value: 0, unit: WAVEFORM_LABELS[data.waveformType as typeof WAVEFORMS[number]] || data.waveformType, color: "#ddd6fe", decimals: 0 },
        }}
        columns={1}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-center font-mono text-purple-400 text-sm">
          f(x) = Σ aₙ·sin(n·ω·x)
        </div>
      </div>
    </>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Đang chờ dữ liệu mô phỏng...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Biến đổi Fourier"
        description="Xây dựng các dạng sóng phức tạp bằng cách cộng các sóng sin lại với nhau"
        cameraPosition={[15, 10, 15]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <FourierTransformSceneComponent
          onDataChange={setData}
          frequency={frequency}
          harmonicCount={harmonicCount}
          waveSpeed={waveSpeed}
          isPlaying={isPlaying}
          waveformType={waveformType}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
      />

      <FloatingControlPanel
        title="⚙️ Thông số sóng"
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
