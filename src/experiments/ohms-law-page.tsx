"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  OhmsLawSceneComponent,
  OhmsLawData,
} from "@/experiments/ohms-law-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
  ControlCheckbox,
  ControlButton,
} from "@/components/experiment-ui";

export default function OhmsLawPage() {
  const router = useRouter();
  const [data, setData] = useState<OhmsLawData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Circuit parameters
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(100);
  const [bulbEnabled, setBulbEnabled] = useState(true);
  const [motorEnabled, setMotorEnabled] = useState(true);

  const handlePlayPause = () => setIsPlaying((p) => !p);

  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setVoltage(12);
    setResistance(100);
    setBulbEnabled(true);
    setMotorEnabled(true);
  };

  // === PARAMETER CONTROLS ===
  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Thông số mạch điện">
        <ControlSlider
          label="Hiệu điện thế"
          value={voltage}
          unit="V"
          min={1}
          max={24}
          step={0.5}
          color="#f59e0b"
          onChange={setVoltage}
          decimals={1}
        />
        <ControlSlider
          label="Điện trở"
          value={resistance}
          unit="Ω"
          min={10}
          max={1000}
          step={10}
          color="#ef4444"
          onChange={setResistance}
          decimals={0}
        />
      </ControlGroup>

      <ControlGroup title="Bật/tắt thiết bị">
        <ControlCheckbox
          label="Bóng đèn"
          checked={bulbEnabled}
          onChange={setBulbEnabled}
          color="#fbbf24"
        />
        <ControlCheckbox
          label="Động cơ DC / Quạt"
          checked={motorEnabled}
          onChange={setMotorEnabled}
          color="#3b82f6"
        />
      </ControlGroup>

      <ControlGroup title="Thiết lập nhanh">
        <div className="grid grid-cols-2 gap-2">
          <ControlButton
            label="Đèn sáng mờ"
            icon="💡"
            onClick={() => { setVoltage(3); setResistance(500); }}
            variant="secondary"
            size="sm"
          />
          <ControlButton
            label="Đèn sáng rõ"
            icon="🔦"
            onClick={() => { setVoltage(12); setResistance(100); }}
            variant="primary"
            size="sm"
          />
          <ControlButton
            label="Dòng điện lớn"
            icon="⚡"
            onClick={() => { setVoltage(9); setResistance(50); }}
            variant="warning"
            size="sm"
          />
          <ControlButton
            label="Động cơ quay nhanh"
            icon="⚙️"
            onClick={() => { setVoltage(12); setResistance(20); }}
            variant="primary"
            size="sm"
          />
        </div>
      </ControlGroup>

      <ControlGroup title="Vùng nguy hiểm">
        <ControlButton
          label="⚠️ Làm cháy bóng đèn"
          onClick={() => { setVoltage(24); setResistance(30); }}
          variant="danger"
          fullWidth
        />
        <p className="text-[9px] text-gray-500 mt-1 text-center">
          Hiệu điện thế cao + điện trở thấp = cháy bóng đèn!
        </p>
      </ControlGroup>

      <ControlButton
        label="📖 Xem lý thuyết & chi tiết"
        onClick={() => router.push("/experiments/ohms-law/details")}
        variant="secondary"
        fullWidth
      />
    </div>
  );

  // === DATA PANEL CONTENT ===
  const dataPanelContent = data ? (
    <>
      <DataGrid
        data={{
          voltage: { value: data.voltage, unit: "V", color: "#f59e0b", decimals: 1 },
          current: { value: data.current, unit: "A", color: "#8b5cf6", decimals: 3 },
          resistance: { value: data.resistance, unit: "Ω", color: "#ef4444", decimals: 0 },
          power: { value: data.power, unit: "W", color: "#22c55e", decimals: 2 },
        }}
        columns={2}
      />

      {/* Component Status */}
      <div className="mt-3 space-y-2">
        {/* Bulb Status */}
        <div className={`p-2 rounded-lg border ${
          data.bulbStatus === "burned"
            ? "bg-red-900/30 border-red-500/30"
            : data.bulbStatus === "on"
            ? "bg-amber-900/30 border-amber-500/30"
            : "bg-gray-800/30 border-gray-600/30"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">💡 Bóng đèn</span>
            <span className={`text-[10px] font-semibold ${
              data.bulbStatus === "burned"
                ? "text-red-400"
                : data.bulbStatus === "on"
                ? "text-amber-400"
                : "text-gray-500"
            }`}>
              {data.bulbStatus === "burned" ? "ĐÃ CHÁY!" : data.bulbStatus === "on" ? "BẬT" : "TẮT"}
            </span>
          </div>
        </div>

        {/* Motor RPM */}
        <div className={`p-2 rounded-lg border ${
          data.motorRpm > 0
            ? "bg-blue-900/30 border-blue-500/30"
            : "bg-gray-800/30 border-gray-600/30"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">⚙️ Động cơ</span>
            <span className={`text-[10px] font-semibold ${
              data.motorRpm > 0 ? "text-blue-400" : "text-gray-500"
            }`}>
              {data.motorRpm > 0 ? `${data.motorRpm.toFixed(0)} vòng/phút` : "TẮT"}
            </span>
          </div>
        </div>
      </div>

      {/* Ohm's Law Formula Display */}
      <div className="mt-3 p-3 bg-gradient-to-r from-slate-900/80 to-slate-800/80 rounded-lg border border-slate-600/50">
        <div className="text-center font-mono text-xs space-y-1.5">
          <div className="text-amber-400 font-semibold mb-2">⚡ Định luật Ohm</div>
          <div className="text-slate-300">I = V / R</div>
          <div className="text-slate-400 text-[10px]">
            I = {data.voltage.toFixed(1)}V / {data.resistance}Ω
          </div>
          <div className="text-blue-300 font-semibold">
            I = {data.current.toFixed(3)} A
          </div>
          <div className="mt-2 text-green-400 font-semibold">⚡ Công suất</div>
          <div className="text-slate-300">P = V × I = V² / R</div>
          <div className="text-slate-400 text-[10px]">
            P = {data.voltage.toFixed(1)}V × {data.current.toFixed(3)}A
          </div>
          <div className="text-green-300 font-semibold">
            P = {data.power.toFixed(2)} W
          </div>
        </div>
      </div>

      {/* Power Equations Reference */}
      <div className="mt-3 p-2.5 bg-blue-900/20 rounded-lg border border-blue-500/20">
        <div className="text-[9px] text-blue-300 text-center space-y-0.5">
          <div className="font-semibold mb-1">Các công thức công suất:</div>
          <div>P = V × I</div>
          <div>P = I² × R</div>
          <div>P = V² / R</div>
        </div>
      </div>

      {/* Burn Warning */}
      {data.bulbStatus === "burned" && (
        <div className="mt-3 p-3 bg-red-900/40 rounded-lg border border-red-500/50 animate-pulse">
          <div className="text-center text-red-400 font-semibold text-xs">
            ⚠️ BÓNG ĐÈN ĐÃ CHÁY!
            <br />
            <span className="text-red-300 font-normal">
              Hiệu điện thế quá cao so với điện trở
            </span>
          </div>
        </div>
      )}
    </>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Đang chờ dữ liệu mô phỏng...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Định luật Ohm"
        description="Mô phỏng mạch điện tương tác: Khám phá mối quan hệ giữa hiệu điện thế, cường độ dòng điện và điện trở"
        cameraPosition={[15, 12, 15]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <OhmsLawSceneComponent
          onDataChange={setData}
          voltage={voltage}
          resistance={resistance}
          bulbEnabled={bulbEnabled}
          motorEnabled={motorEnabled}
          isPlaying={isPlaying}
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
        title="⚡ Điều khiển mạch điện"
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
