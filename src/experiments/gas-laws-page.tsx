"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  GasLawsSceneComponent,
  GasData,
} from "@/experiments/gas-laws-scene";
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

interface BoylePoint {
  id: number;
  V: number; // L
  p: number; // kPa
  pV: number;
}

export default function GasLawsPage() {
  const router = useRouter();
  const [data, setData] = useState<GasData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Tham số khí lí tưởng & Định luật Boyle (SGK Vật lí 12)
  const [isothermalLock, setIsothermalLock] = useState(true);
  const [temperature, setTemperature] = useState(300);
  const [volume, setVolume] = useState(5.0);
  const [numParticles, setNumParticles] = useState(100);

  const [boylePoints, setBoylePoints] = useState<BoylePoint[]>([]);

  const handleRecordBoyle = () => {
    if (!data) return;
    const pKpa = data.pressure / 1000;
    setBoylePoints((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        V: volume,
        p: pKpa,
        pV: pKpa * volume,
      },
    ]);
  };

  const currentPressureKpa = data ? data.pressure / 1000 : 0;
  const pvProduct = currentPressureKpa * volume;

  const avgPV = useMemo(() => {
    if (boylePoints.length === 0) return null;
    return boylePoints.reduce((s, pt) => s + pt.pV, 0) / boylePoints.length;
  }, [boylePoints]);

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Khảo sát Định luật Boyle (Lớp 12)">
        <ControlCheckbox
          label="Khóa quá trình đẳng nhiệt (T = const)"
          checked={isothermalLock}
          onChange={setIsothermalLock}
          color="#10b981"
        />
        <ControlSlider
          label="Thể tích xi-lanh (V)"
          value={volume}
          unit="L"
          min={1.5}
          max={10}
          step={0.5}
          color="#a855f7"
          onChange={setVolume}
          decimals={1}
        />
        <ControlSlider
          label="Nhiệt độ tuyệt đối (T)"
          value={temperature}
          unit="K"
          min={150}
          max={600}
          step={10}
          color="#06d6a0"
          disabled={isothermalLock}
          onChange={(v) => {
            setTemperature(v);
            setBoylePoints([]);
          }}
          decimals={0}
        />
        <ControlSlider
          label="Lượng khí (Số phân tử mô phỏng)"
          value={numParticles}
          unit=""
          min={40}
          max={200}
          step={20}
          color="#22c55e"
          onChange={(v) => {
            setNumParticles(v);
            setBoylePoints([]);
          }}
          decimals={0}
        />
      </ControlGroup>

      <ControlButton
        label="Ghi cặp (V, p) vào đường đẳng nhiệt"
        icon="📊"
        variant="success"
        fullWidth
        onClick={handleRecordBoyle}
      />

      <button
        onClick={() => router.push("/experiments/gas-laws/details")}
        className="w-full py-2.5 bg-gradient-to-r from-emerald-100 to-emerald-200 hover:from-emerald-200 hover:to-emerald-300 text-emerald-800 font-medium text-sm rounded-lg transition-all border border-emerald-300/50 flex items-center justify-center gap-2"
      >
        📖 Lý thuyết Định luật Boyle & Khí lí tưởng (Lớp 12)
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <div className="space-y-3">
      <DataGrid
        data={{
          "Thể tích V": { value: volume, unit: "L", color: "#a855f7", decimals: 1 },
          "Áp suất p": { value: currentPressureKpa, unit: "kPa", color: "#ec4899", decimals: 2 },
          "Nhiệt độ T": { value: temperature, unit: "K", color: "#06d6a0", decimals: 0 },
          "Tích số p·V": { value: pvProduct, unit: "kPa·L", color: "#facc15", decimals: 2 },
        }}
        columns={2}
      />

      {/* Đồ thị đường đẳng nhiệt Hypebol p(V) */}
      <div className="p-2.5 rounded-lg bg-gray-800/70 border border-gray-700 text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-emerald-300">
            Đường đẳng nhiệt p(V) ở T = {temperature} K ({boylePoints.length} điểm)
          </span>
          {boylePoints.length > 0 && (
            <button onClick={() => setBoylePoints([])} className="text-[11px] text-red-400">
              Xóa
            </button>
          )}
        </div>

        <svg viewBox="0 0 220 105" className="w-full h-24 bg-slate-950 rounded border border-slate-800">
          <line x1="28" y1="8" x2="28" y2="86" stroke="#475569" strokeWidth="1" />
          <line x1="28" y1="86" x2="205" y2="86" stroke="#475569" strokeWidth="1" />
          <text x="4" y="16" fill="#94a3b8" fontSize="8">p(kPa)</text>
          <text x="186" y="99" fill="#94a3b8" fontSize="8">V(L)</text>
          {(() => {
            const kConst = pvProduct || 250;
            const maxP = Math.max(200, kConst / 1.4);
            const pts: string[] = [];
            for (let v = 1.5; v <= 10; v += 0.25) {
              const p = kConst / v;
              const x = 28 + (v / 10.5) * 170;
              const y = 86 - Math.min(74, (p / maxP) * 74);
              pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
            }
            return (
              <>
                <polyline fill="none" stroke="#10b981" strokeDasharray="3 2" strokeWidth="1.3" points={pts.join(" ")} />
                {boylePoints.map((pt) => {
                  const cx = 28 + (pt.V / 10.5) * 170;
                  const cy = 86 - Math.min(74, (pt.p / maxP) * 74);
                  return <circle key={pt.id} cx={cx} cy={cy} r="3" fill="#facc15" />;
                })}
              </>
            );
          })()}
        </svg>

        {avgPV !== null ? (
          <div className="text-[11px] text-amber-300 font-mono">
            Trung bình p·V = {avgPV.toFixed(2)} kPa·L (Hằng số khi T = {temperature} K)
          </div>
        ) : (
          <div className="text-[11px] text-gray-400 italic">
            Giữ T không đổi, thay đổi thể tích V và bấm &quot;Ghi cặp (V, p)&quot; để kiểm chứng p₁V₁ = p₂V₂.
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Đang chờ dữ liệu mô phỏng...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Khảo Sát Định Luật Boyle (Khí Lí Tưởng - Lớp 12)"
        description="Nén và giãn khí đẳng nhiệt để kiểm chứng p·V = hằng số và vẽ đường đẳng nhiệt"
        cameraPosition={[30, 22, 30]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <GasLawsSceneComponent
          onDataChange={setData}
          temperature={temperature}
          volume={volume}
          numParticles={numParticles}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying((p) => !p)}
        onReset={() => {
          setVolume(5.0);
          setTemperature(300);
          setBoylePoints([]);
          setTimeElapsed(0);
        }}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
        timeElapsed={timeElapsed}
      />

      <FloatingControlPanel
        title="⚙️ Thông số chất khí (Định luật Boyle)"
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
