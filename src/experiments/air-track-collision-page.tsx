"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AirTrackCollisionSceneComponent,
  AirTrackData,
} from "@/experiments/air-track-collision-scene";
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

export default function AirTrackCollisionPage() {
  const router = useRouter();
  const [data, setData] = useState<AirTrackData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Tham số thí nghiệm
  const [m1, setM1] = useState(0.4);
  const [m2, setM2] = useState(0.4);
  const [v1Init, setV1Init] = useState(1.2);
  const [v2Init, setV2Init] = useState(0.0);
  const [collisionType, setCollisionType] = useState<"elastic" | "inelastic">("elastic");
  const [airFriction, setAirFriction] = useState(0);

  // Giá trị lý thuyết trước va chạm
  const initialTotals = useMemo(() => {
    const p0 = m1 * v1Init + m2 * v2Init;
    const ke0 = 0.5 * m1 * v1Init * v1Init + 0.5 * m2 * v2Init * v2Init;
    return { p0, ke0 };
  }, [m1, m2, v1Init, v2Init]);

  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Chế độ va chạm & Đệm khí">
        <ControlDropdown
          label="Loại va chạm"
          value={collisionType}
          color="#38bdf8"
          options={[
            { label: "Va chạm đàn hồi (Lò xo nảy)", value: "elastic", emoji: "🔄" },
            { label: "Va chạm mềm (Dính liền nhau)", value: "inelastic", emoji: "🧲" },
          ]}
          onChange={(v) => {
            setCollisionType(v);
            setResetTrigger((n) => n + 1);
          }}
        />
        <ControlSlider
          label="Hệ số ma sát (μ)"
          value={airFriction}
          unit=""
          min={0}
          max={0.05}
          step={0.005}
          color="#f59e0b"
          onChange={(v) => {
            setAirFriction(v);
            setResetTrigger((n) => n + 1);
          }}
          decimals={3}
        />
      </ControlGroup>

      <ControlGroup title="Thông số hai xe trượt">
        <ControlSlider
          label="Khối lượng xe 1 (m₁)"
          value={m1}
          unit="kg"
          min={0.2}
          max={1.0}
          step={0.1}
          color="#3b82f6"
          onChange={(v) => {
            setM1(v);
            setResetTrigger((n) => n + 1);
          }}
          decimals={2}
        />
        <ControlSlider
          label="Vận tốc đầu xe 1 (v₁)"
          value={v1Init}
          unit="m/s"
          min={0.2}
          max={2.0}
          step={0.1}
          color="#3b82f6"
          onChange={(v) => {
            setV1Init(v);
            setResetTrigger((n) => n + 1);
          }}
          decimals={2}
        />
        <ControlSlider
          label="Khối lượng xe 2 (m₂)"
          value={m2}
          unit="kg"
          min={0.2}
          max={1.0}
          step={0.1}
          color="#f97316"
          onChange={(v) => {
            setM2(v);
            setResetTrigger((n) => n + 1);
          }}
          decimals={2}
        />
        <ControlSlider
          label="Vận tốc đầu xe 2 (v₂)"
          value={v2Init}
          unit="m/s"
          min={-1.5}
          max={1.0}
          step={0.1}
          color="#f97316"
          onChange={(v) => {
            setV2Init(v);
            setResetTrigger((n) => n + 1);
          }}
          decimals={2}
        />
      </ControlGroup>

      <ControlButton
        label="Đặt lại vị trí & Chạy thử"
        icon="🔄"
        variant="primary"
        fullWidth
        onClick={handleReset}
      />

      <button
        onClick={() => router.push("/experiments/air-track-collision/details")}
        className="w-full py-2.5 bg-gradient-to-r from-sky-100 to-sky-200 hover:from-sky-200 hover:to-sky-300 text-sky-800 font-medium text-sm rounded-lg transition-all border border-sky-300/50 flex items-center justify-center gap-2"
      >
        📖 Lý thuyết & Định luật bảo toàn (Lớp 10)
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <div className="space-y-3">
      <DataGrid
        data={{
          "Vận tốc v₁": { value: data.v1, unit: "m/s", color: "#60a5fa", decimals: 3 },
          "Vận tốc v₂": { value: data.v2, unit: "m/s", color: "#fb923c", decimals: 3 },
          "Động lượng p₁": { value: data.p1, unit: "kg.m/s", color: "#60a5fa", decimals: 3 },
          "Động lượng p₂": { value: data.p2, unit: "kg.m/s", color: "#fb923c", decimals: 3 },
          "Động năng Wđ₁": { value: data.ke1, unit: "J", color: "#34d399", decimals: 3 },
          "Động năng Wđ₂": { value: data.ke2, unit: "J", color: "#facc15", decimals: 3 },
        }}
        columns={2}
      />

      <div className="p-2.5 rounded-lg bg-gray-800/70 border border-gray-700 text-xs space-y-1.5">
        <div className="flex justify-between">
          <span className="text-gray-400">Tổng động lượng ban đầu (p₀):</span>
          <span className="font-mono text-sky-300">{initialTotals.p0.toFixed(3)} kg.m/s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Tổng động lượng hiện tại (p):</span>
          <span className="font-mono text-emerald-400 font-bold">{data.pTotal.toFixed(3)} kg.m/s</span>
        </div>
        <div className="border-t border-gray-700 my-1" />
        <div className="flex justify-between">
          <span className="text-gray-400">Tổng động năng ban đầu (Wđ₀):</span>
          <span className="font-mono text-amber-300">{initialTotals.ke0.toFixed(3)} J</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Tổng động năng hiện tại (Wđ):</span>
          <span className="font-mono text-purple-300 font-bold">{data.keTotal.toFixed(3)} J</span>
        </div>
        <div className="text-[11px] text-gray-400 pt-1">
          {data.hasCollided
            ? collisionType === "elastic"
              ? "✅ Đã va chạm đàn hồi: Tổng động lượng và tổng động năng đều được bảo toàn!"
              : "⚠️ Đã va chạm mềm: Tổng động lượng bảo toàn, một phần động năng chuyển thành nhiệt/biến dạng."
            : "⏳ Đang di chuyển trước va chạm..."}
        </div>
      </div>
    </div>
  ) : (
    <div className="text-center text-gray-500 text-sm py-6">Đang chờ dữ liệu...</div>
  );

  return (
    <>
      <ExperimentContainer
        title="Bảo Toàn Động Lượng & Cơ Năng (Đệm Khí - Lớp 10)"
        description="Khảo sát va chạm đàn hồi và va chạm mềm trên băng đệm khí không ma sát"
        cameraPosition={[0, 3.2, 8.8]}
        backgroundColor="#060b19"
        controls={null}
        dataPanel={null}
      >
        <AirTrackCollisionSceneComponent
          onDataChange={setData}
          m1={m1}
          m2={m2}
          v1Init={v1Init}
          v2Init={v2Init}
          collisionType={collisionType}
          airFriction={airFriction}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying((p) => !p)}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
        timeElapsed={data?.elapsedTime ?? 0}
      />

      <FloatingControlPanel
        title="⚙️ Thiết lập băng đệm khí"
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
