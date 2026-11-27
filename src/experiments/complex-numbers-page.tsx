"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ComplexNumbersSceneComponent, ComplexNumbersData } from "@/experiments/complex-numbers-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function ComplexNumbersPage() {
  const router = useRouter();
  const [data, setData] = useState<ComplexNumbersData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [real, setReal] = useState(2);
  const [imaginary, setImaginary] = useState(1.5);
  const [showPlane, setShowPlane] = useState(true);
  const [showPolar, setShowPolar] = useState(true);
  const [showConjugate, setShowConjugate] = useState(true);
  const [showSquare, setShowSquare] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setReal(2);
    setImaginary(1.5);
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Số phức">
        <ControlSlider
          label="Phần thực"
          value={real}
          unit=""
          min={-4}
          max={4}
          step={0.1}
          color="#3b82f6"
          onChange={setReal}
          decimals={1}
        />
        <ControlSlider
          label="Phần ảo"
          value={imaginary}
          unit="i"
          min={-4}
          max={4}
          step={0.1}
          color="#ef4444"
          onChange={setImaginary}
          decimals={1}
        />
      </ControlGroup>

      <ControlGroup title="Hiển thị">
        {[
          { id: "plane", label: "Mặt phẳng phức", checked: showPlane, onChange: setShowPlane, color: "#f43f5e" },
          { id: "polar", label: "Dạng lượng giác (cực)", checked: showPolar, onChange: setShowPolar, color: "#f43f5e" },
          { id: "conjugate", label: "Số phức liên hợp", checked: showConjugate, onChange: setShowConjugate, color: "#06b6d4" },
          { id: "square", label: "Bình phương (z²)", checked: showSquare, onChange: setShowSquare, color: "#f97316" },
        ].map((opt) => (
          <label key={opt.id} className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
            <span>{opt.label}</span>
            <input type="checkbox" checked={opt.checked} onChange={(e) => opt.onChange(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: opt.color }} />
          </label>
        ))}
        <ControlSlider
          label="Tốc độ xoay"
          value={rotationSpeed}
          unit=""
          min={0}
          max={2}
          step={0.1}
          color="#fbbf24"
          onChange={setRotationSpeed}
          decimals={1}
        />
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/complex-numbers/details")}
        className="w-full py-2.5 bg-gradient-to-r from-rose-100 to-rose-200 hover:from-rose-200 hover:to-rose-300 text-rose-700 font-medium text-sm rounded-lg transition-all border border-rose-300/50 flex items-center justify-center gap-2"
      >
        📖 Xem chi tiết thí nghiệm
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <>
      <DataGrid
        data={{
          real: { value: data.real, unit: "Re", color: "#3b82f6", decimals: 2 },
          imaginary: { value: data.imaginary, unit: "Im", color: "#ef4444", decimals: 2 },
          magnitude: { value: data.magnitude, unit: "|z|", color: "#fbbf24", decimals: 2 },
          argument: { value: data.argument, unit: "°", color: "#a855f7", decimals: 1 },
        }}
        columns={2}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-center font-mono text-rose-400 text-sm">
          z = {data.real.toFixed(2)} + {data.imaginary.toFixed(2)}i
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
        title="Số phức"
        description="Khám phá mặt phẳng phức Argand và các phép toán số phức"
        cameraPosition={[10, 8, 10]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <ComplexNumbersSceneComponent
          onDataChange={setData}
          real={real}
          imaginary={imaginary}
          showPlane={showPlane}
          showPolar={showPolar}
          showConjugate={showConjugate}
          showSquare={showSquare}
          rotationSpeed={rotationSpeed}
          isPlaying={isPlaying}
        />
      </ExperimentContainer>

      <SimulationController isPlaying={isPlaying} onPlayPause={handlePlayPause} onReset={handleReset} speed={simulationSpeed} onSpeedChange={setSimulationSpeed} />

      <FloatingControlPanel title="⚙️ Cài đặt số phức" initialPosition={{ x: 20, y: 80 }}>
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel isVisible={showDataPanel} onToggle={() => setShowDataPanel(!showDataPanel)}>
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
