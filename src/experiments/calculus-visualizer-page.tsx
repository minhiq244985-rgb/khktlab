"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalculusSceneComponent, CalculusData } from "@/experiments/calculus-visualizer-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

const FUNCTIONS = ["quadratic", "cubic", "sine", "exponential"] as const;

const FUNCTION_LABELS: Record<typeof FUNCTIONS[number], string> = {
  quadratic: "Bậc hai",
  cubic: "Bậc ba",
  sine: "Hàm Sin",
  exponential: "Hàm mũ",
};

export default function CalculusVisualizerPage() {
  const router = useRouter();
  const [data, setData] = useState<CalculusData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [functionType, setFunctionType] = useState<typeof FUNCTIONS[number]>("quadratic");
  const [showDerivative, setShowDerivative] = useState(true);
  const [showIntegral, setShowIntegral] = useState(true);
  const [showTangent, setShowTangent] = useState(true);
  const [showRiemann, setShowRiemann] = useState(false);
  const [riemannRects, setRiemannRects] = useState(10);
  const [speed, setSpeed] = useState(1);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setSpeed(1);
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Loại hàm số">
        <div className="grid grid-cols-2 gap-2">
          {FUNCTIONS.map((fn) => (
            <button
              key={fn}
              onClick={() => setFunctionType(fn)}
              className={`py-2 px-3 text-sm rounded-lg transition-all ${
                functionType === fn
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {FUNCTION_LABELS[fn]}
            </button>
          ))}
        </div>
      </ControlGroup>

      <ControlGroup title="Trực quan hóa">
        <ControlSlider
          label="Tốc độ hoạt ảnh"
          value={speed}
          unit=""
          min={0.1}
          max={2}
          step={0.1}
          color="#22c55e"
          onChange={setSpeed}
          decimals={1}
        />
        {[
          { label: "Hiển thị đạo hàm", checked: showDerivative, onChange: setShowDerivative },
          { label: "Hiển thị diện tích tích phân", checked: showIntegral, onChange: setShowIntegral },
          { label: "Hiển thị tiếp tuyến", checked: showTangent, onChange: setShowTangent },
          { label: "Hiển thị tổng Riemann", checked: showRiemann, onChange: setShowRiemann },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
            <span>{opt.label}</span>
            <input type="checkbox" checked={opt.checked} onChange={(e) => opt.onChange(e.target.checked)} className="w-4 h-4 rounded accent-green-500" />
          </label>
        ))}
        {showRiemann && (
          <ControlSlider
            label="Số hình chữ nhật Riemann"
            value={riemannRects}
            unit=""
            min={5}
            max={50}
            step={1}
            color="#16a34a"
            onChange={setRiemannRects}
            decimals={0}
          />
        )}
      </ControlGroup>

      <div className="bg-green-50/50 rounded-lg p-3 border border-green-200/50">
        <div className="text-xs text-gray-600 mb-2 font-medium">Khái niệm Giải tích</div>
        <div className="text-xs text-gray-500">
          Đạo hàm = tốc độ biến thiên tức thời<br />
          Tích phân = diện tích dưới đường cong<br />
          Tiếp tuyến = đường thẳng chạm tại một điểm
        </div>
      </div>

      <button
        onClick={() => router.push("/experiments/calculus-visualizer/details")}
        className="w-full py-2.5 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-700 font-medium text-sm rounded-lg transition-all border border-green-300/50 flex items-center justify-center gap-2"
      >
        📖 Xem chi tiết thí nghiệm
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <>
      <DataGrid
        data={{
          x: { value: data.x, unit: "", color: "#3b82f6", decimals: 2 },
          y: { value: data.y, unit: "f(x)", color: "#22c55e", decimals: 2 },
          slope: { value: data.slope, unit: "f'(x)", color: "#ef4444", decimals: 2 },
          area: { value: Math.abs(data.area), unit: "∫", color: "#a855f7", decimals: 2 },
        }}
        columns={2}
      />
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-center font-mono text-green-400 text-sm">
          f'(x) = lim[h→0] (f(x+h) - f(x))/h
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
        title="Mô phỏng Giải tích"
        description="Khám phá đạo hàm, tích phân và đường tiếp tuyến"
        cameraPosition={[12, 8, 12]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <CalculusSceneComponent
          onDataChange={setData}
          functionType={functionType}
          showDerivative={showDerivative}
          showIntegral={showIntegral}
          showTangent={showTangent}
          showRiemann={showRiemann}
          riemannRects={riemannRects}
          speed={speed}
          isPlaying={isPlaying}
        />
      </ExperimentContainer>

      <SimulationController isPlaying={isPlaying} onPlayPause={handlePlayPause} onReset={handleReset} speed={simulationSpeed} onSpeedChange={setSimulationSpeed} />

      <FloatingControlPanel title="⚙️ Cài đặt Giải tích" initialPosition={{ x: 20, y: 80 }}>
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel isVisible={showDataPanel} onToggle={() => setShowDataPanel(!showDataPanel)}>
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
