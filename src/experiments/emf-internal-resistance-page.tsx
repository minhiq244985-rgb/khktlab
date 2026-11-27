"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  EmfInternalResistanceSceneComponent,
  EmfCircuitData,
} from "@/experiments/emf-internal-resistance-scene";
import {
  ExperimentContainer,
  ControlGroup,
  ControlSlider,
  ControlCheckbox,
  ControlButton,
  DataGrid,
  FloatingControlPanel,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

interface UIPoint {
  id: number;
  R: number;
  I: number;
  U: number;
}

export default function EmfInternalResistancePage() {
  const router = useRouter();
  const [data, setData] = useState<EmfCircuitData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  // Tham số nguồn điện và mạch ngoài (SGK Vật lí 11)
  const [emf, setEmf] = useState(6.0);
  const [internalResistance, setInternalResistance] = useState(1.2);
  const [externalResistance, setExternalResistance] = useState(4.0);
  const [switchClosed, setSwitchClosed] = useState(true);

  // Bảng ghi cặp (I, U) để vẽ đồ thị U = E - I.r
  const [points, setPoints] = useState<UIPoint[]>([]);

  const handleRecordPoint = () => {
    if (!data || !switchClosed) return;
    setPoints((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        R: externalResistance,
        I: data.current,
        U: data.terminalVoltage,
      },
    ]);
  };

  // Hồi quy tuyến tính U = a*I + b => E_đo = b, r_đo = -a
  const regression = useMemo(() => {
    if (points.length < 2) return null;
    const n = points.length;
    const sumI = points.reduce((s, p) => s + p.I, 0);
    const sumU = points.reduce((s, p) => s + p.U, 0);
    const sumII = points.reduce((s, p) => s + p.I * p.I, 0);
    const sumIU = points.reduce((s, p) => s + p.I * p.U, 0);
    const denom = n * sumII - sumI * sumI;
    if (Math.abs(denom) < 1e-6) return null;
    const slope = (n * sumIU - sumI * sumU) / denom;
    const intercept = (sumU - slope * sumI) / n;
    return {
      measuredE: intercept,
      measuredR: -slope,
    };
  }, [points]);

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Thông số nguồn điện & Biến trở">
        <ControlSlider
          label="Biến trở mạch ngoài (R)"
          value={externalResistance}
          unit="Ω"
          min={0.5}
          max={20}
          step={0.5}
          color="#a855f7"
          onChange={setExternalResistance}
          decimals={1}
        />
        <ControlSlider
          label="Suất điện động nguồn (E)"
          value={emf}
          unit="V"
          min={3.0}
          max={12.0}
          step={0.5}
          color="#f59e0b"
          onChange={(v) => {
            setEmf(v);
            setPoints([]);
          }}
          decimals={1}
        />
        <ControlSlider
          label="Điện trở trong nguồn (r)"
          value={internalResistance}
          unit="Ω"
          min={0.2}
          max={4.0}
          step={0.2}
          color="#ef4444"
          onChange={(v) => {
            setInternalResistance(v);
            setPoints([]);
          }}
          decimals={1}
        />
        <ControlCheckbox
          label="Đóng khóa K (Cho dòng chạy qua mạch)"
          checked={switchClosed}
          onChange={setSwitchClosed}
          color="#22c55e"
        />
      </ControlGroup>

      <ControlButton
        label="Ghi cặp giá trị (I, U) vào đồ thị"
        icon="📈"
        variant="success"
        fullWidth
        disabled={!switchClosed}
        onClick={handleRecordPoint}
      />

      <button
        onClick={() => router.push("/experiments/emf-internal-resistance/details")}
        className="w-full py-2.5 bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-800 font-medium text-sm rounded-lg transition-all border border-purple-300/50 flex items-center justify-center gap-2"
      >
        📖 Lý thuyết Định luật Ohm toàn mạch (Lớp 11)
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <div className="space-y-3">
      <DataGrid
        data={{
          "Cường độ dòng I": { value: data.current, unit: "A", color: "#34d399", decimals: 3 },
          "Hiệu điện thế U": { value: data.terminalVoltage, unit: "V", color: "#38bdf8", decimals: 3 },
          "Độ giảm thế I·r": { value: data.internalDrop, unit: "V", color: "#f87171", decimals: 3 },
          "Hiệu suất nguồn H": { value: data.efficiency, unit: "%", color: "#fbbf24", decimals: 1 },
        }}
        columns={2}
      />

      {/* Đồ thị đường đặc trưng U(I) */}
      <div className="p-2.5 rounded-lg bg-gray-800/70 border border-gray-700 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sky-300">Đồ thị U(I) = E − I·r ({points.length} điểm)</span>
          {points.length > 0 && (
            <button onClick={() => setPoints([])} className="text-[11px] text-red-400">
              Xóa
            </button>
          )}
        </div>

        <svg viewBox="0 0 220 110" className="w-full h-28 bg-slate-950 rounded border border-slate-800">
          {/* Trục tọa độ */}
          <line x1="28" y1="10" x2="28" y2="90" stroke="#475569" strokeWidth="1" />
          <line x1="28" y1="90" x2="205" y2="90" stroke="#475569" strokeWidth="1" />
          <text x="8" y="18" fill="#94a3b8" fontSize="8">U(V)</text>
          <text x="185" y="103" fill="#94a3b8" fontSize="8">I(A)</text>

          {/* Đường lý thuyết U = E - I*r */}
          {(() => {
            const maxI = Math.max(2.5, emf / Math.max(0.5, internalResistance));
            const maxU = Math.max(7, emf * 1.15);
            const x0 = 28;
            const y0 = 90 - (emf / maxU) * 75;
            const iEnd = Math.min(maxI, emf / internalResistance);
            const x1 = 28 + (iEnd / maxI) * 170;
            const y1 = 90;
            return (
              <>
                <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#38bdf8" strokeDasharray="3 2" strokeWidth="1.2" />
                {points.map((pt) => {
                  const cx = 28 + (pt.I / maxI) * 170;
                  const cy = 90 - (pt.U / maxU) * 75;
                  return <circle key={pt.id} cx={cx} cy={cy} r="3" fill="#facc15" />;
                })}
              </>
            );
          })()}
        </svg>

        {regression ? (
          <div className="text-[11px] text-emerald-300 font-mono">
            Kết quả từ đồ thị: E = {regression.measuredE.toFixed(2)} V | r = {regression.measuredR.toFixed(2)} Ω
          </div>
        ) : (
          <div className="text-[11px] text-gray-400 italic">
            Thay đổi biến trở R ở ít nhất 2 mức và bấm &quot;Ghi cặp giá trị (I, U)&quot; để xác định E và r từ đồ thị.
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="text-center text-gray-500 text-sm py-6">Đang khởi tạo mạch điện...</div>
  );

  return (
    <>
      <ExperimentContainer
        title="Đo Suất Điện Động (E) & Điện Trở Trong (r) (Lớp 11)"
        description="Thí nghiệm khảo sát mạch điện kín và vẽ đường đặc trưng U(I)"
        cameraPosition={[0, 4.6, 6.2]}
        backgroundColor="#060512"
        controls={null}
        dataPanel={null}
      >
        <EmfInternalResistanceSceneComponent
          onDataChange={setData}
          emf={emf}
          internalResistance={internalResistance}
          externalResistance={externalResistance}
          switchClosed={switchClosed}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying((p) => !p)}
        onReset={() => {
          setExternalResistance(4.0);
          setSwitchClosed(true);
          setPoints([]);
        }}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
        timeElapsed={0}
      />

      <FloatingControlPanel
        title="⚙️ Điều chỉnh mạch điện"
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
