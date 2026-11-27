"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TitrationSceneComponent, TitrationData } from "@/experiments/titration-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function TitrationPage() {
  const router = useRouter();
  const [data, setData] = useState<TitrationData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation control
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(0.5);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Titration parameters
  const [acidConcentration, setAcidConcentration] = useState(0.1);
  const [baseConcentration, setBaseConcentration] = useState(0.1);
  const [acidType, setAcidType] = useState<"HCl" | "CH3COOH">("HCl");
  const [baseType, setBaseType] = useState<"NaOH" | "KOH">("NaOH");
  const [indicatorType, setIndicatorType] = useState<"universal" | "phenolphthalein" | "methyl-orange" | "bromothymol">("universal");
  const [dripSpeed, setDripSpeed] = useState(0.5);
  const [manualDripTrigger, setManualDripTrigger] = useState(0);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(false);
    setSimulationSpeed(0.5);
    setManualDripTrigger(0);
  };
  const handleManualDrip = () => setManualDripTrigger((n) => n + 1);

  // Reset scene data when reset changes
  useEffect(() => {
    if (resetTrigger > 0) {
      setData(null);
    }
  }, [resetTrigger]);

  // === PARAMETER CONTROLS ===
  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Tham số axit">
        <div className="mb-3">
          <label className="text-xs text-gray-400 mb-2 block">Loại axit</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setAcidType("HCl")}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                acidType === "HCl"
                  ? "bg-violet-600 text-white"
                  : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
              }`}
            >
              HCl (Mạnh)
            </button>
            <button
              onClick={() => setAcidType("CH3COOH")}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                acidType === "CH3COOH"
                  ? "bg-violet-600 text-white"
                  : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
              }`}
            >
              CH₃COOH (Yếu)
            </button>
          </div>
        </div>
        <ControlSlider
          label="Nồng độ axit"
          value={acidConcentration}
          unit="M"
          min={0.01}
          max={0.5}
          step={0.01}
          color="#ef4444"
          onChange={setAcidConcentration}
          decimals={2}
        />
      </ControlGroup>

      <ControlGroup title="Tham số bazơ">
        <div className="mb-3">
          <label className="text-xs text-gray-400 mb-2 block">Loại bazơ</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setBaseType("NaOH")}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                baseType === "NaOH"
                  ? "bg-violet-600 text-white"
                  : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
              }`}
            >
              NaOH
            </button>
            <button
              onClick={() => setBaseType("KOH")}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                baseType === "KOH"
                  ? "bg-violet-600 text-white"
                  : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
              }`}
            >
              KOH
            </button>
          </div>
        </div>
        <ControlSlider
          label="Nồng độ bazơ"
          value={baseConcentration}
          unit="M"
          min={0.01}
          max={0.5}
          step={0.01}
          color="#3b82f6"
          onChange={setBaseConcentration}
          decimals={2}
        />
      </ControlGroup>

      <ControlGroup title="Chất chỉ thị">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setIndicatorType("universal")}
            className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
              indicatorType === "universal"
                ? "bg-violet-600 text-white"
                : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
            }`}
          >
            🌈 Vạn năng
          </button>
          <button
            onClick={() => setIndicatorType("phenolphthalein")}
            className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
              indicatorType === "phenolphthalein"
                ? "bg-violet-600 text-white"
                : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
            }`}
          >
            🌸 Phenolphthalein
          </button>
          <button
            onClick={() => setIndicatorType("methyl-orange")}
            className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
              indicatorType === "methyl-orange"
                ? "bg-violet-600 text-white"
                : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
            }`}
          >
            🍊 Metyl da cam
          </button>
          <button
            onClick={() => setIndicatorType("bromothymol")}
            className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
              indicatorType === "bromothymol"
                ? "bg-violet-600 text-white"
                : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
            }`}
          >
            💛 Bromothymol
          </button>
        </div>
      </ControlGroup>

      <ControlGroup title="Điều khiển nhỏ giọt">
        <ControlSlider
          label="Tốc độ nhỏ giọt"
          value={dripSpeed}
          unit=""
          min={0.1}
          max={1}
          step={0.1}
          color="#8b5cf6"
          onChange={setDripSpeed}
          decimals={1}
        />
        <button
          onClick={handleManualDrip}
          disabled={isPlaying}
          className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            isPlaying
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white"
          }`}
        >
          💧 Thêm một giọt
        </button>
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/titration/details")}
        className="w-full py-2.5 bg-gradient-to-r from-violet-100 to-violet-200 hover:from-violet-200 hover:to-violet-300 text-violet-700 font-medium text-sm rounded-lg transition-all border border-violet-300/50 flex items-center justify-center gap-2"
      >
        📖 Xem chi tiết thí nghiệm
      </button>
    </div>
  );

  // === DATA PANEL CONTENT ===
  const dataPanelContent = data ? (
    <>
      <DataGrid
        data={{
          ph: { value: data.currentPH, unit: "pH", color: data.currentPH > 7 ? "#3b82f6" : data.currentPH < 7 ? "#ef4444" : "#22c55e", decimals: 2 },
          volume: { value: data.volumeAdded, unit: "mL (Đã thêm)", color: "#8b5cf6", decimals: 2 },
          drops: { value: data.dropsAdded, unit: "giọt", color: "#06d6a0", decimals: 0 },
          equivPoint: { value: data.equivalencePointVolume, unit: "mL (Điểm tương đương)", color: "#f59e0b", decimals: 1 },
          acidConc: { value: data.acidConcentration, unit: "M (Axit)", color: "#ef4444", decimals: 2 },
          baseConc: { value: data.baseConcentration, unit: "M (Bazơ)", color: "#3b82f6", decimals: 2 },
        }}
        columns={2}
      />

      {/* Acid/Base strength badges */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="p-2 bg-gray-800/50 rounded-lg">
          <div className="text-xs text-gray-400">Axit</div>
          <div className="text-xs font-bold text-red-400">{data.acidType}</div>
          <div className="text-xs text-gray-500">{data.acidStrength}</div>
        </div>
        <div className="p-2 bg-gray-800/50 rounded-lg">
          <div className="text-xs text-gray-400">Bazơ</div>
          <div className="text-xs font-bold text-blue-400">{data.baseType}</div>
          <div className="text-xs text-gray-500">{data.baseStrength}</div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Dung dịch:</span>
          <span
            className={`font-bold text-sm ${
              data.isNearEquivalence
                ? "text-amber-400 animate-pulse"
                : data.currentPH > 7
                  ? "text-blue-400"
                  : data.currentPH < 7
                    ? "text-red-400"
                    : "text-green-400"
            }`}
          >
            {data.isNearEquivalence
              ? "⚡ Gần điểm tương đương!"
              : data.currentPH > 7
                ? "🔵 Môi trường bazơ"
                : data.currentPH < 7
                  ? "🔴 Môi trường axit"
                  : "🟢 Trung tính"}
          </span>
        </div>

        {/* Progress to equivalence */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Tiến độ</span>
            <span>{Math.min(100, (data.volumeAdded / data.equivalencePointVolume) * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (data.volumeAdded / data.equivalencePointVolume) * 100)}%`,
                backgroundColor: data.isNearEquivalence
                  ? "#f59e0b"
                  : data.currentPH > 7
                    ? "#3b82f6"
                    : "#ef4444",
              }}
            />
          </div>
        </div>

        {/* Equivalence point reached */}
        {data.isPastEquivalence && !data.isNearEquivalence && (
          <div className="mt-2 text-xs text-amber-400 font-medium text-center">
            ✓ Đã đạt điểm tương đương tại {data.equivalencePointVolume.toFixed(1)} mL
          </div>
        )}
      </div>

      {/* Indicator info */}
      <div className="mt-2 p-2 bg-gray-800/30 rounded-lg">
        <div className="text-xs text-gray-400">Chất chỉ thị: {data.indicatorType}</div>
        {data.indicatorType === "universal" && (
          <div className="text-xs text-gray-500 mt-1">
            Hiển thị đầy đủ thang màu pH
          </div>
        )}
        {data.indicatorType === "phenolphthalein" && (
          <div className="text-xs text-gray-500 mt-1">
            Không màu → Hồng (pH 8.2)
          </div>
        )}
        {data.indicatorType === "methyl-orange" && (
          <div className="text-xs text-gray-500 mt-1">
            Đỏ → Vàng (pH 3.1-4.4)
          </div>
        )}
        {data.indicatorType === "bromothymol" && (
          <div className="text-xs text-gray-500 mt-1">
            Vàng → Xanh lam (pH 6.0-7.6)
          </div>
        )}
      </div>
    </>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      <div className="animate-pulse">Đang khởi tạo chuẩn độ...</div>
      <div className="text-xs mt-2">Thêm giọt để bắt đầu</div>
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Chuẩn độ axit - bazơ"
        description="Xác định nồng độ dung dịch thông qua thí nghiệm chuẩn độ axit - bazơ"
        cameraPosition={[8, 6, 8]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <TitrationSceneComponent
          acidConcentration={acidConcentration}
          baseConcentration={baseConcentration}
          acidType={acidType}
          baseType={baseType}
          indicatorType={indicatorType}
          dripSpeed={dripSpeed}
          isDripping={isPlaying}
          manualDripTrigger={manualDripTrigger}
          onDataChange={setData}
          key={`titration-${resetTrigger}`}
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
        title="⚗️ Điều khiển chuẩn độ"
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
