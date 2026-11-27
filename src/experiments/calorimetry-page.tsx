"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalorimetrySceneComponent,
  CalorimetryData,
  CalorimetryMode,
} from "@/experiments/calorimetry-scene";
import {
  ExperimentContainer,
  ControlGroup,
  ControlSlider,
  ControlDropdown,
  ControlButton,
  DataGrid,
  FloatingControlPanel,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function CalorimetryPage() {
  const router = useRouter();
  const [data, setData] = useState<CalorimetryData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(6);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Chế độ thí nghiệm SGK Vật lí 12
  const [mode, setMode] = useState<CalorimetryMode>("specific_heat");
  const [mass, setMass] = useState(0.25); // kg
  const [heaterPower, setHeaterPower] = useState(250); // W
  const [initialTemp, setInitialTemp] = useState(25); // °C

  // Lưu lịch sử điểm (t, T) để vẽ đồ thị quá trình đun nóng T(t)
  const [curvePoints, setCurvePoints] = useState<{ t: number; T: number }[]>([]);
  const lastSampleRef = useRef(0);

  useEffect(() => {
    setCurvePoints([]);
    lastSampleRef.current = 0;
  }, [resetTrigger, mode, mass, heaterPower, initialTemp]);

  const handleDataUpdate = (d: CalorimetryData) => {
    setData(d);
    if (d.elapsedTime - lastSampleRef.current >= 2.0) {
      lastSampleRef.current = d.elapsedTime;
      setCurvePoints((prev) => [...prev.slice(-45), { t: d.elapsedTime, T: d.temperature }]);
    }
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Bài thực hành Nhiệt học (Lớp 12)">
        <ControlDropdown
          label="Đại lượng cần đo"
          value={mode}
          color="#10b981"
          options={[
            { label: "Nhiệt dung riêng của nước (c)", value: "specific_heat", emoji: "💧" },
            { label: "Nhiệt nóng chảy riêng nước đá (λ)", value: "fusion", emoji: "🧊" },
            { label: "Nhiệt hóa hơi riêng của nước (L)", value: "vaporization", emoji: "♨️" },
          ]}
          onChange={(v) => {
            setMode(v);
            setResetTrigger((n) => n + 1);
          }}
        />
        <ControlSlider
          label="Khối lượng mẫu (m)"
          value={mass}
          unit="kg"
          min={0.1}
          max={0.5}
          step={0.05}
          color="#38bdf8"
          onChange={(v) => {
            setMass(v);
            setResetTrigger((n) => n + 1);
          }}
          decimals={2}
        />
        <ControlSlider
          label="Công suất dây đốt (P)"
          value={heaterPower}
          unit="W"
          min={100}
          max={500}
          step={25}
          color="#f97316"
          onChange={(v) => {
            setHeaterPower(v);
            setResetTrigger((n) => n + 1);
          }}
          decimals={0}
        />
        {mode === "specific_heat" && (
          <ControlSlider
            label="Nhiệt độ ban đầu (T₀)"
            value={initialTemp}
            unit="°C"
            min={15}
            max={40}
            step={1}
            color="#a855f7"
            onChange={(v) => {
              setInitialTemp(v);
              setResetTrigger((n) => n + 1);
            }}
            decimals={0}
          />
        )}
      </ControlGroup>

      <ControlButton
        label="Làm lại thí nghiệm từ đầu"
        icon="🔄"
        variant="primary"
        fullWidth
        onClick={() => {
          setResetTrigger((n) => n + 1);
          setIsPlaying(true);
        }}
      />

      <button
        onClick={() => router.push("/experiments/calorimetry/details")}
        className="w-full py-2.5 bg-gradient-to-r from-emerald-100 to-emerald-200 hover:from-emerald-200 hover:to-emerald-300 text-emerald-800 font-medium text-sm rounded-lg transition-all border border-emerald-300/50 flex items-center justify-center gap-2"
      >
        📖 Lý thuyết Nhiệt dung riêng & Chuyển thể (Lớp 12)
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <div className="space-y-3">
      <div className="px-2.5 py-1.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-xs text-emerald-300 font-medium">
        Trạng thái: {data.phaseState}
      </div>

      <DataGrid
        data={{
          "Nhiệt độ T": { value: data.temperature, unit: "°C", color: "#38bdf8", decimals: 1 },
          "Thời gian đun t": { value: data.elapsedTime, unit: "s", color: "#facc15", decimals: 1 },
          "Nhiệt lượng Q = P·t": { value: data.suppliedEnergy / 1000, unit: "kJ", color: "#fb923c", decimals: 2 },
          "Tỉ lệ đã chuyển thể": {
            value:
              mode === "fusion"
                ? data.meltedFraction * 100
                : mode === "vaporization"
                ? (data.vaporizedMass / mass) * 100
                : 100,
            unit: "%",
            color: "#a855f7",
            decimals: 1,
          },
        }}
        columns={2}
      />

      {/* Đồ thị đường biểu diễn nhiệt độ theo thời gian T(t) */}
      <div className="p-2.5 rounded-lg bg-gray-800/70 border border-gray-700 text-xs space-y-1.5">
        <div className="font-semibold text-amber-300">Đồ thị T(t) — Nhiệt độ theo thời gian đun</div>
        <svg viewBox="0 0 220 95" className="w-full h-24 bg-slate-950 rounded border border-slate-800">
          <line x1="26" y1="8" x2="26" y2="80" stroke="#475569" strokeWidth="1" />
          <line x1="26" y1="80" x2="208" y2="80" stroke="#475569" strokeWidth="1" />
          <text x="4" y="16" fill="#94a3b8" fontSize="8">T(°C)</text>
          <text x="188" y="91" fill="#94a3b8" fontSize="8">t(s)</text>
          {curvePoints.length > 1 && (() => {
            const maxT = Math.max(10, curvePoints[curvePoints.length - 1].t);
            const poly = curvePoints
              .map((pt) => {
                const x = 26 + (pt.t / maxT) * 176;
                const y = 80 - ((pt.T + 15) / 120) * 68;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              })
              .join(" ");
            return <polyline fill="none" stroke="#10b981" strokeWidth="2" points={poly} />;
          })()}
        </svg>

        <div className="text-[11px] text-emerald-300 font-mono">
          {mode === "specific_heat" &&
            `c = Q / (m·ΔT) ≈ ${data.measuredConstant ? data.measuredConstant.toFixed(0) : "4180"} J/(kg·K)`}
          {mode === "fusion" &&
            `λ = Q_nc / m ≈ 3,34 × 10⁵ J/kg (Đoạn nằm ngang ở 0°C)`}
          {mode === "vaporization" &&
            `L = Q_hh / Δm ≈ 2,26 × 10⁶ J/kg (Đoạn nằm ngang ở 100°C)`}
        </div>
      </div>
    </div>
  ) : (
    <div className="text-center text-gray-500 text-sm py-6">Đang khởi tạo nhiệt lượng kế...</div>
  );

  return (
    <>
      <ExperimentContainer
        title="Đo Nhiệt Dung Riêng & Ẩn Nhiệt Chuyển Thể (Lớp 12)"
        description="Thực hành nhiệt lượng kế xác định c, nhiệt nóng chảy riêng λ và nhiệt hóa hơi riêng L"
        cameraPosition={[0, 1.4, 6.8]}
        backgroundColor="#04100d"
        controls={null}
        dataPanel={null}
      >
        <CalorimetrySceneComponent
          onDataChange={handleDataUpdate}
          mode={mode}
          mass={mass}
          heaterPower={heaterPower}
          initialTemp={initialTemp}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying((p) => !p)}
        onReset={() => {
          setResetTrigger((n) => n + 1);
          setIsPlaying(true);
        }}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
        timeElapsed={data?.elapsedTime ?? 0}
      />

      <FloatingControlPanel
        title="⚙️ Thiết lập nhiệt lượng kế"
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
