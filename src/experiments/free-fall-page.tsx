"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FreeFallSceneComponent,
  FreeFallData,
} from "@/experiments/free-fall-scene";
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

interface TrialRecord {
  id: number;
  s1: number;
  s2: number;
  t1: number;
  t2: number;
  deltaT: number;
  g: number;
}

export default function FreeFallPage() {
  const router = useRouter();
  const [data, setData] = useState<FreeFallData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Điều khiển mô phỏng
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(0.5); // mặc định 0.5x để quan sát rõ
  const [resetTrigger, setResetTrigger] = useState(0);

  // Tham số thí nghiệm SGK Lớp 10
  const [gate1Pos, setGate1Pos] = useState(0.2); // 20 cm
  const [gate2Pos, setGate2Pos] = useState(0.8); // 80 cm
  const [trueG, setTrueG] = useState(9.81);
  const [ballDiameter, setBallDiameter] = useState(20);
  const [enableNoise, setEnableNoise] = useState(true);

  // Bảng ghi số liệu thực nghiệm (Data Logger)
  const [records, setRecords] = useState<TrialRecord[]>([]);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
  };

  const handleRecordTrial = () => {
    if (!data || data.gate1Time === null || data.gate2Time === null || data.deltaT === null || data.measuredG === null) {
      return;
    }
    setRecords((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        s1: gate1Pos,
        s2: gate2Pos,
        t1: data.gate1Time!,
        t2: data.gate2Time!,
        deltaT: data.deltaT!,
        g: data.measuredG!,
      },
    ]);
  };

  // Thống kê sai số theo SGK Vật lí 10
  const stats = useMemo(() => {
    if (records.length === 0) return null;
    const meanG = records.reduce((acc, r) => acc + r.g, 0) / records.length;
    const absErr =
      records.reduce((acc, r) => acc + Math.abs(r.g - meanG), 0) / records.length;
    const relErr = (absErr / meanG) * 100;
    return { meanG, absErr, relErr };
  }, [records]);

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Bố trí cổng quang điện">
        <ControlSlider
          label="Vị trí cổng quang 1 (s₁)"
          value={gate1Pos * 100}
          unit="cm"
          min={5}
          max={45}
          step={5}
          color="#38bdf8"
          onChange={(v) => {
            const m = v / 100;
            setGate1Pos(m);
            if (gate2Pos <= m + 0.1) setGate2Pos(Math.min(1.0, m + 0.2));
            setResetTrigger((n) => n + 1);
          }}
          decimals={0}
        />
        <ControlSlider
          label="Vị trí cổng quang 2 (s₂)"
          value={gate2Pos * 100}
          unit="cm"
          min={25}
          max={100}
          step={5}
          color="#a855f7"
          onChange={(v) => {
            const m = v / 100;
            setGate2Pos(m);
            if (gate1Pos >= m - 0.1) setGate1Pos(Math.max(0.05, m - 0.2));
            setResetTrigger((n) => n + 1);
          }}
          decimals={0}
        />
        <ControlSlider
          label="Đường kính bi thép"
          value={ballDiameter}
          unit="mm"
          min={15}
          max={30}
          step={1}
          color="#94a3b8"
          onChange={setBallDiameter}
          decimals={0}
        />
        <ControlSlider
          label="Gia tốc nơi thí nghiệm (g₀)"
          value={trueG}
          unit="m/s²"
          min={9.75}
          max={9.85}
          step={0.01}
          color="#10b981"
          onChange={(v) => {
            setTrueG(v);
            setResetTrigger((n) => n + 1);
          }}
          decimals={2}
        />
        <ControlCheckbox
          label="Mô phỏng sai số ngẫu nhiên (±1 ms)"
          checked={enableNoise}
          onChange={setEnableNoise}
          color="#f59e0b"
        />
      </ControlGroup>

      <div className="grid grid-cols-2 gap-2">
        <ControlButton
          label="Thả lại bi"
          icon="🔄"
          variant="primary"
          size="sm"
          onClick={handleReset}
        />
        <ControlButton
          label="Ghi số liệu"
          icon="📝"
          variant="success"
          size="sm"
          disabled={!data || data.measuredG === null}
          onClick={handleRecordTrial}
        />
      </div>

      <button
        onClick={() => router.push("/experiments/free-fall/details")}
        className="w-full py-2.5 bg-gradient-to-r from-sky-100 to-sky-200 hover:from-sky-200 hover:to-sky-300 text-sky-800 font-medium text-sm rounded-lg transition-all border border-sky-300/50 flex items-center justify-center gap-2"
      >
        📖 Lý thuyết & Hướng dẫn SGK Lớp 10
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <div className="space-y-3">
      <DataGrid
        data={{
          "Quãng đường s": { value: data.fallDistance * 100, unit: "cm", color: "#38bdf8", decimals: 1 },
          "Vận tốc tức thời v": { value: data.instantVelocity, unit: "m/s", color: "#22c55e", decimals: 2 },
          "Thời điểm qua E₁ (t₁)": { value: data.gate1Time ?? 0, unit: "s", color: "#60a5fa", decimals: 4 },
          "Thời điểm qua E₂ (t₂)": { value: data.gate2Time ?? 0, unit: "s", color: "#c084fc", decimals: 4 },
          "Thời gian Δt = t₂ - t₁": { value: data.deltaT ?? 0, unit: "s", color: "#facc15", decimals: 4 },
          "Gia tốc g đo được": { value: data.measuredG ?? 0, unit: "m/s²", color: "#f97316", decimals: 3 },
        }}
        columns={2}
      />

      {/* Bảng ghi kết quả nhiều lần đo */}
      <div className="pt-2 border-t border-gray-700">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-gray-300">
            Bảng ghi số liệu ({records.length} lần đo)
          </span>
          {records.length > 0 && (
            <button
              onClick={() => setRecords([])}
              className="text-[11px] text-red-400 hover:text-red-300"
            >
              Xóa bảng
            </button>
          )}
        </div>

        {records.length === 0 ? (
          <p className="text-[11px] text-gray-400 italic">
            Chờ bi rơi qua 2 cổng quang rồi bấm &quot;Ghi số liệu&quot; để tính g trung bình và sai số.
          </p>
        ) : (
          <div className="max-h-36 overflow-y-auto rounded border border-gray-700 text-[11px] font-mono">
            <table className="w-full text-left">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="px-2 py-1">Lần</th>
                  <th className="px-2 py-1">Δs (m)</th>
                  <th className="px-2 py-1">Δt (s)</th>
                  <th className="px-2 py-1">g (m/s²)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-200">
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="px-2 py-1">#{r.id}</td>
                    <td className="px-2 py-1">{(r.s2 - r.s1).toFixed(2)}</td>
                    <td className="px-2 py-1">{r.deltaT.toFixed(4)}</td>
                    <td className="px-2 py-1 text-amber-400">{r.g.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {stats && (
          <div className="mt-2 p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-xs space-y-0.5">
            <div className="text-emerald-300 font-semibold">
              Kết quả: g = {stats.meanG.toFixed(3)} ± {stats.absErr.toFixed(3)} m/s²
            </div>
            <div className="text-gray-400 text-[11px]">
              Sai số tỉ đối δ = {stats.relErr.toFixed(2)}%
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="text-center text-gray-500 text-sm py-6">Đang khởi tạo bộ thí nghiệm...</div>
  );

  return (
    <>
      <ExperimentContainer
        title="Đo Gia Tốc Rơi Tự Do (Lớp 10)"
        description="Thí nghiệm thực hành đo gia tốc rơi tự do bằng cổng quang điện & đồng hồ hiện số"
        cameraPosition={[0, 0.4, 9.2]}
        backgroundColor="#060b19"
        controls={null}
        dataPanel={null}
      >
        <FreeFallSceneComponent
          onDataChange={setData}
          trueG={trueG}
          gate1Pos={gate1Pos}
          gate2Pos={gate2Pos}
          ballDiameter={ballDiameter}
          enableNoise={enableNoise}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
          resetTrigger={resetTrigger}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
        timeElapsed={data?.elapsedTime ?? 0}
      />

      <FloatingControlPanel
        title="⚙️ Dụng cụ đo rơi tự do"
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
