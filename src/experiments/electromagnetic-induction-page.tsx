"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ElectromagneticInductionSceneComponent,
  InductionData,
} from "@/experiments/electromagnetic-induction-scene";
import {
  ExperimentContainer,
  ControlGroup,
  ControlSlider,
  ControlDropdown,
  ControlCheckbox,
  DataGrid,
  FloatingControlPanel,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function ElectromagneticInductionPage() {
  const router = useRouter();
  const [data, setData] = useState<InductionData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  // Tham số thí nghiệm Cảm ứng điện từ (SGK Vật lí 12)
  const [motionMode, setMotionMode] = useState<"oscillate" | "manual" | "generator">("oscillate");
  const [manualMagnetX, setManualMagnetX] = useState(-2.2);
  const [oscillationFreq, setOscillationFreq] = useState(0.6);
  const [coilTurns, setCoilTurns] = useState(200);
  const [magnetStrength, setMagnetStrength] = useState(0.6);
  const [reversePolarity, setReversePolarity] = useState(false);

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Chế độ làm biến thiên từ thông Φ">
        <ControlDropdown
          label="Cách tạo biến thiên từ thông"
          value={motionMode}
          color="#10b981"
          options={[
            { label: "Đưa nam châm ra/vào tự động", value: "oscillate", emoji: "🧲" },
            { label: "Kéo tay vị trí nam châm (x)", value: "manual", emoji: "✋" },
            { label: "Quay nam châm (Máy phát xoay chiều)", value: "generator", emoji: "⚡" },
          ]}
          onChange={setMotionMode}
        />

        {motionMode === "manual" ? (
          <ControlSlider
            label="Vị trí nam châm (x)"
            value={manualMagnetX}
            unit="m"
            min={-3.2}
            max={3.2}
            step={0.05}
            color="#38bdf8"
            onChange={setManualMagnetX}
            decimals={2}
          />
        ) : (
          <ControlSlider
            label="Tần số dao động / quay (f)"
            value={oscillationFreq}
            unit="Hz"
            min={0.2}
            max={1.5}
            step={0.1}
            color="#38bdf8"
            onChange={setOscillationFreq}
            decimals={1}
          />
        )}
      </ControlGroup>

      <ControlGroup title="Thông số cuộn dây & Nam châm">
        <ControlSlider
          label="Số vòng dây (N)"
          value={coilTurns}
          unit="vòng"
          min={50}
          max={400}
          step={25}
          color="#f59e0b"
          onChange={setCoilTurns}
          decimals={0}
        />
        <ControlSlider
          label="Cảm ứng từ nam châm (B)"
          value={magnetStrength}
          unit="T"
          min={0.2}
          max={1.2}
          step={0.1}
          color="#ef4444"
          onChange={setMagnetStrength}
          decimals={1}
        />
        <ControlCheckbox
          label="Đảo cực nam châm (S ↔ N)"
          checked={reversePolarity}
          onChange={setReversePolarity}
          color="#a855f7"
        />
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/electromagnetic-induction/details")}
        className="w-full py-2.5 bg-gradient-to-r from-emerald-100 to-emerald-200 hover:from-emerald-200 hover:to-emerald-300 text-emerald-800 font-medium text-sm rounded-lg transition-all border border-emerald-300/50 flex items-center justify-center gap-2"
      >
        📖 Lý thuyết Định luật Faraday & Lenz (Lớp 12)
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <div className="space-y-3">
      <DataGrid
        data={{
          "Từ thông Φ": { value: data.magneticFlux, unit: "mWb", color: "#38bdf8", decimals: 2 },
          "Tốc độ dΦ/dt": { value: data.dFluxDt, unit: "mWb/s", color: "#c084fc", decimals: 1 },
          "Suất điện động e_c": { value: data.inducedEmf, unit: "V", color: "#facc15", decimals: 3 },
          "Dòng cảm ứng i_c": { value: data.inducedCurrent, unit: "mA", color: "#34d399", decimals: 1 },
        }}
        columns={2}
      />

      <div className="p-2.5 rounded-lg bg-gray-800/70 border border-gray-700 text-xs text-gray-300 space-y-1">
        <div className="font-semibold text-emerald-300">Nhận xét theo định luật Lenz:</div>
        <p className="text-[11px] text-gray-300">
          {Math.abs(data.inducedCurrent) < 2
            ? "⏸️ Từ thông không đổi (dΦ/dt ≈ 0) ⇒ Không có dòng điện cảm ứng (Kim điện kế chỉ số 0)."
            : data.inducedCurrent > 0
            ? "➡️ Kim điện kế lệch phải (i_c > 0): Từ trường cảm ứng chống lại sự biến thiên từ thông ban đầu."
            : "⬅️ Kim điện kế lệch trái (i_c < 0): Chiều dòng cảm ứng đảo ngược khi chiều biến thiên từ thông đổi dấu."}
        </p>
      </div>
    </div>
  ) : (
    <div className="text-center text-gray-500 text-sm py-6">Đang khởi tạo mô phỏng từ trường...</div>
  );

  return (
    <>
      <ExperimentContainer
        title="Hiện Tượng Cảm Ứng Điện Từ (Lớp 12)"
        description="Khảo sát từ thông Φ, định luật Faraday e_c = −dΦ/dt và quy tắc Lenz"
        cameraPosition={[0, 2.2, 7.6]}
        backgroundColor="#04100d"
        controls={null}
        dataPanel={null}
      >
        <ElectromagneticInductionSceneComponent
          onDataChange={setData}
          motionMode={motionMode}
          manualMagnetX={manualMagnetX}
          oscillationFreq={oscillationFreq}
          coilTurns={coilTurns}
          magnetStrength={magnetStrength}
          reversePolarity={reversePolarity}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying((p) => !p)}
        onReset={() => {
          setManualMagnetX(-2.2);
          setOscillationFreq(0.6);
          setIsPlaying(true);
        }}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
        timeElapsed={0}
      />

      <FloatingControlPanel
        title="⚙️ Thiết lập cảm ứng điện từ"
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
