"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ElectrolysisSceneComponent, ElectrolysisData } from "@/experiments/electrolysis-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

type StepMode = "autoplay" | "step-through";
type Electrolyte = "water" | "nacl" | "cuso4";

const STEP_INFO = [
  { id: 1, title: "Thiết lập", description: "Pin được nối với các điện cực trong dung dịch điện phân" },
  { id: 2, title: "Dòng điện chạy qua", description: "Electron di chuyển từ pin qua dây dẫn đến các điện cực" },
  { id: 3, title: "Phản ứng bắt đầu", description: "Các phân tử nước phân tách tại bề mặt điện cực" },
  { id: 4, title: "Khí hình thành", description: "Bọt khí H₂ hình thành ở catốt (-), O₂ ở anốt (+)" },
  { id: 5, title: "Thu khí", description: "Khí được thu trong ống nghiệm - tỷ lệ H₂:O₂ = 2:1" },
];

export default function ElectrolysisPage() {
  const router = useRouter();
  const [data, setData] = useState<ElectrolysisData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Điều khiển mô phỏng
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Thông số vật lý
  const [voltage, setVoltage] = useState(6);
  const [electrolyte, setElectrolyte] = useState<Electrolyte>("water");

  // Chế độ từng bước
  const [stepMode, setStepMode] = useState<StepMode>("step-through");
  const [currentStep, setCurrentStep] = useState(1);
  const [autoPlayTimer, setAutoPlayTimer] = useState<NodeJS.Timeout | null>(null);

  const handlePlayPause = () => {
    setIsPlaying((p) => !p);
  };

  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setCurrentStep(1);
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      setAutoPlayTimer(null);
    }
  };

  const handleStepModeChange = (mode: StepMode) => {
    setStepMode(mode);
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      setAutoPlayTimer(null);
    }
    if (mode === "autoplay") {
      // Bắt đầu tự động chuyển qua các bước
      setCurrentStep(1);
      const timer = setInterval(() => {
        setCurrentStep((s) => {
          if (s >= 5) {
            clearInterval(timer);
            return 5;
          }
          return s + 1;
        });
      }, 4000 / simulationSpeed);
      setAutoPlayTimer(timer);
    }
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    if (stepMode === "autoplay" && autoPlayTimer) {
      clearInterval(autoPlayTimer);
      setAutoPlayTimer(null);
      setStepMode("step-through");
    }
  };

  const getElectrolyteLabel = (e: Electrolyte): string => {
    switch (e) {
      case "water": return "Nước tinh khiết (H₂O)";
      case "nacl": return "Dung dịch muối (NaCl)";
      case "cuso4": return "Đồng sunfat (CuSO₄)";
    }
  };

  // === ĐIỀU KHIỂN THÔNG SỐ ===
  const parameterControls = (
    <div className="space-y-4">
      {/* Chọn chế độ bước */}
      <ControlGroup title="Chế độ mô phỏng">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleStepModeChange("step-through")}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              stepMode === "step-through"
                ? "bg-blue-600 text-white"
                : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
            }`}
          >
            📝 Từng bước
          </button>
          <button
            onClick={() => handleStepModeChange("autoplay")}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              stepMode === "autoplay"
                ? "bg-blue-600 text-white"
                : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
            }`}
          >
            ▶️ Tự động chạy
          </button>
        </div>
      </ControlGroup>

      {/* Điều hướng bước (chỉ ở chế độ từng bước) */}
      {stepMode === "step-through" && (
        <ControlGroup title="Điều hướng bước">
          <div className="flex gap-1 flex-wrap">
            {[1, 2, 3, 4, 5].map((step) => (
              <button
                key={step}
                onClick={() => handleStepChange(step)}
                className={`flex-1 min-w-[40px] py-2 px-2 rounded-lg text-sm font-medium transition-all ${
                  currentStep === step
                    ? "bg-green-600 text-white"
                    : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
                }`}
              >
                {step}
              </button>
            ))}
          </div>
          <div className="mt-2 p-2 bg-blue-50/80 rounded-lg text-xs text-blue-800">
            <p className="font-semibold">{STEP_INFO[currentStep - 1].title}</p>
            <p className="text-blue-600 mt-1">{STEP_INFO[currentStep - 1].description}</p>
          </div>
        </ControlGroup>
      )}

      {/* Điều khiển điện áp */}
      <ControlGroup title="Điện áp">
        <ControlSlider
          label="Điện áp"
          value={voltage}
          unit="V"
          min={1}
          max={12}
          step={0.5}
          color="#f59e0b"
          onChange={setVoltage}
          decimals={1}
        />
      </ControlGroup>

      {/* Chọn chất điện phân */}
      <ControlGroup title="Dung dịch điện phân">
        <div className="space-y-2">
          {(["water", "nacl", "cuso4"] as Electrolyte[]).map((e) => (
            <button
              key={e}
              onClick={() => setElectrolyte(e)}
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all text-left ${
                electrolyte === e
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
              }`}
            >
              {getElectrolyteLabel(e)}
            </button>
          ))}
        </div>
      </ControlGroup>

      {/* Tốc độ mô phỏng */}
      <ControlGroup title="Tốc độ mô phỏng">
        <ControlSlider
          label="Tốc độ"
          value={simulationSpeed}
          unit="×"
          min={0.25}
          max={3}
          step={0.25}
          color="#8b5cf6"
          onChange={setSimulationSpeed}
          decimals={2}
        />
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/electrolysis/details")}
        className="w-full py-2.5 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-700 font-medium text-sm rounded-lg transition-all border border-blue-300/50 flex items-center justify-center gap-2"
      >
        📖 Xem chi tiết thí nghiệm
      </button>
    </div>
  );

  // === NỘI DUNG BẢNG DỮ LIỆU ===
  const dataPanelContent = data ? (
    <div className="space-y-4">
      <DataGrid
        data={{
          voltage: { value: data.voltage, unit: "V", color: "#f59e0b", decimals: 1 },
          current: { value: data.current, unit: "A", color: "#3b82f6", decimals: 2 },
          h2Volume: { value: data.h2Volume, unit: "mL", color: "#2563eb", decimals: 1 },
          o2Volume: { value: data.o2Volume, unit: "mL", color: "#dc2626", decimals: 1 },
        }}
        columns={2}
      />

      {/* Trạng thái phản ứng */}
      <div className="bg-gray-50/80 rounded-lg p-3 space-y-2">
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Trạng thái</div>
        <div className="text-sm font-medium text-gray-800">{data.reactionStatus}</div>

        {/* Chỉ báo bước */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Bước hiện tại</span>
            <span className="font-bold text-blue-600">{currentStep}/5</span>
          </div>
          <div className="mt-1 flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  s <= currentStep ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Tỷ lệ khí */}
        {data.h2Volume > 0 && data.o2Volume > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Tỷ lệ H₂:O₂</span>
              <span className="font-bold text-green-600">
                {(data.h2Volume / Math.max(data.o2Volume, 0.1)).toFixed(1)}:1
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">Lý thuyết: 2:1</div>
          </div>
        )}
      </div>

      {/* Tham chiếu phản ứng điện cực */}
      {currentStep >= 3 && (
        <div className="bg-blue-50/80 rounded-lg p-3 space-y-2">
          <div className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Các phản ứng</div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold shrink-0">Catốt (−):</span>
              <span className="text-gray-700">2H₂O + 2e⁻ → H₂(g) + 2OH⁻</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-600 font-bold shrink-0">Anốt (+):</span>
              <span className="text-gray-700">2H₂O → O₂(g) + 4H⁺ + 4e⁻</span>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Đang chờ dữ liệu mô phỏng...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Điện phân nước"
        description="Tìm hiểu cách dòng điện tách nước thành khí hiđro và oxi"
        cameraPosition={[12, 10, 12]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <ElectrolysisSceneComponent
          onDataChange={setData}
          voltage={voltage}
          electrolyte={electrolyte}
          isRunning={isPlaying}
          step={currentStep}
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
        title="⚡ Điều khiển điện phân"
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
