"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  SpeedOfSoundSceneComponent,
  SpeedOfSoundData,
} from "@/experiments/speed-of-sound-scene";
import {
  ExperimentContainer,
  ControlGroup,
  ControlSlider,
  ControlButton,
  DataGrid,
  FloatingControlPanel,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function SpeedOfSoundPage() {
  const router = useRouter();
  const [data, setData] = useState<SpeedOfSoundData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  // Tham số thí nghiệm SGK Vật lí 11
  const [frequency, setFrequency] = useState(680); // Hz
  const [columnLength, setColumnLength] = useState(0.38); // m
  const [temperature, setTemperature] = useState(25); // °C

  // Lưu 2 vị trí cộng hưởng liên tiếp l1 và l2
  const [l1Recorded, setL1Recorded] = useState<number | null>(null);
  const [l2Recorded, setL2Recorded] = useState<number | null>(null);

  const calculatedResult = useMemo(() => {
    if (l1Recorded === null || l2Recorded === null) return null;
    const diff = Math.abs(l2Recorded - l1Recorded);
    if (diff < 0.02) return null;
    const lambda = 2 * diff;
    const v = lambda * frequency;
    return { lambda, v };
  }, [l1Recorded, l2Recorded, frequency]);

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Điều chỉnh ống cộng hưởng">
        <ControlSlider
          label="Tần số máy phát âm (f)"
          value={frequency}
          unit="Hz"
          min={450}
          max={1000}
          step={10}
          color="#a855f7"
          onChange={(v) => {
            setFrequency(v);
            setL1Recorded(null);
            setL2Recorded(null);
          }}
          decimals={0}
        />
        <ControlSlider
          label="Chiều cao cột không khí (l)"
          value={columnLength * 100}
          unit="cm"
          min={5}
          max={95}
          step={0.5}
          color="#38bdf8"
          onChange={(v) => setColumnLength(v / 100)}
          decimals={1}
        />
        <ControlSlider
          label="Nhiệt độ không khí (t)"
          value={temperature}
          unit="°C"
          min={15}
          max={40}
          step={1}
          color="#f59e0b"
          onChange={setTemperature}
          decimals={0}
        />
      </ControlGroup>

      <ControlGroup title="Ghi vị trí nghe thấy âm to nhất">
        <div className="grid grid-cols-2 gap-2">
          <ControlButton
            label={l1Recorded ? `l₁ = ${(l1Recorded * 100).toFixed(1)} cm` : "Ghi l₁ (Lần 1)"}
            icon="1️⃣"
            variant="primary"
            size="sm"
            onClick={() => setL1Recorded(columnLength)}
          />
          <ControlButton
            label={l2Recorded ? `l₂ = ${(l2Recorded * 100).toFixed(1)} cm` : "Ghi l₂ (Lần 2)"}
            icon="2️⃣"
            variant="success"
            size="sm"
            onClick={() => setL2Recorded(columnLength)}
          />
        </div>
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/speed-of-sound/details")}
        className="w-full py-2.5 bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-800 font-medium text-sm rounded-lg transition-all border border-purple-300/50 flex items-center justify-center gap-2"
      >
        📖 Lý thuyết Sóng dừng & Đo tốc độ âm (Lớp 11)
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <div className="space-y-3">
      <DataGrid
        data={{
          "Tần số f": { value: data.frequency, unit: "Hz", color: "#c084fc", decimals: 0 },
          "Chiều dài cột khí l": { value: data.columnLength * 100, unit: "cm", color: "#38bdf8", decimals: 1 },
          "Mức cộng hưởng": { value: data.resonanceIntensity * 100, unit: "%", color: "#22c55e", decimals: 0 },
          "Bước sóng thực λ": { value: data.wavelength * 100, unit: "cm", color: "#facc15", decimals: 1 },
        }}
        columns={2}
      />

      <div className="p-2.5 rounded-lg bg-gray-800/70 border border-gray-700 text-xs space-y-1.5">
        <div className="font-semibold text-purple-300">Tính toán kết quả thực hành:</div>
        <div className="flex justify-between">
          <span className="text-gray-400">Vị trí cộng hưởng 1 (l₁):</span>
          <span className="font-mono text-sky-300">
            {l1Recorded !== null ? `${(l1Recorded * 100).toFixed(1)} cm` : "Chưa ghi"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Vị trí cộng hưởng 2 (l₂):</span>
          <span className="font-mono text-emerald-300">
            {l2Recorded !== null ? `${(l2Recorded * 100).toFixed(1)} cm` : "Chưa ghi"}
          </span>
        </div>
        {calculatedResult ? (
          <div className="pt-1.5 border-t border-gray-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-300">Bước sóng λ = 2|l₂ − l₁|:</span>
              <span className="font-mono text-amber-300">{calculatedResult.lambda.toFixed(3)} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Tốc độ âm đo được (v = λf):</span>
              <span className="font-mono text-emerald-400 font-bold">{calculatedResult.v.toFixed(1)} m/s</span>
            </div>
            <div className="text-[11px] text-gray-400">
              Giá trị lý thuyết ở {temperature}°C: {data.trueSpeed.toFixed(1)} m/s
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-gray-400 italic">
            Hạ dần cột nước (tăng l) để tìm 2 vị trí âm thanh vang to nhất liên tiếp và bấm Ghi l₁, l₂.
          </p>
        )}
      </div>
    </div>
  ) : (
    <div className="text-center text-gray-500 text-sm py-6">Đang khởi tạo ống cộng hưởng...</div>
  );

  return (
    <>
      <ExperimentContainer
        title="Đo Tốc Độ Truyền Âm Trong Không Khí (Lớp 11)"
        description="Thí nghiệm sóng dừng trong ống cộng hưởng cột khí thay đổi chiều dài"
        cameraPosition={[0, 0.2, 8.8]}
        backgroundColor="#060512"
        controls={null}
        dataPanel={null}
      >
        <SpeedOfSoundSceneComponent
          onDataChange={setData}
          frequency={frequency}
          columnLength={columnLength}
          temperature={temperature}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying((p) => !p)}
        onReset={() => {
          setColumnLength(0.12);
          setL1Recorded(null);
          setL2Recorded(null);
        }}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
        timeElapsed={0}
      />

      <FloatingControlPanel
        title="⚙️ Điều khiển ống cộng hưởng"
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
