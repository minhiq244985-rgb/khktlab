'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectileMotionSceneComponent, ProjectileData } from "@/experiments/projectile-motion-scene";
import { ExperimentContainer, FloatingControlPanel, SimulationController, DataPanel } from "@/components/experiment-ui";
import { ControlGroup, ControlSlider, DataGrid } from "@/components/experiment-ui/ExperimentControls";

const GRAVITY_PRESETS = [
  { label: "Trái Đất", value: 9.81, emoji: "🌍" },
  { label: "Mặt Trăng", value: 1.62, emoji: "🌙" },
  { label: "Sao Hỏa", value: 3.72, emoji: "🔴" },
  { label: "Sao Mộc", value: 24.79, emoji: "🟠" },
];

interface ProjectileConfig {
  velocity: number;
  angle: number;
  gravity: number;
  mass: number;
  airResistance: boolean;
  dragCoefficient: number;
  targetDistance: number;
  showTrail: boolean;
  showPrediction: boolean;
  showVelocityVector: boolean;
  showGhostMarkers: boolean;
  showDistanceMarkers: boolean;
}

export default function ProjectileMotionPage() {
  const router = useRouter();
  const [data, setData] = useState<ProjectileData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);
  const [config, setConfig] = useState<ProjectileConfig>({
    velocity: 30,
    angle: 45,
    gravity: 9.81,
    mass: 1,
    airResistance: false,
    dragCoefficient: 0.02,
    targetDistance: 50,
    showTrail: true,
    showPrediction: true,
    showVelocityVector: true,
    showGhostMarkers: true,
    showDistanceMarkers: true,
  });
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [hasLaunched, setHasLaunched] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const handleLaunch = () => {
    setHasLaunched(true);
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setTimeElapsed(0);
  };

  const handleReset = () => {
    setHasLaunched(false);
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setData(null);
    setTimeElapsed(0);
  };

  const updateConfig = (key: keyof ProjectileConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Điều khiển phóng">
        <div className="flex gap-2">
          <button
            onClick={handleLaunch}
            disabled={hasLaunched}
            className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg transition-all shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Phóng
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-lg transition-all shadow-lg text-sm"
          >
            🔄 Đặt lại
          </button>
        </div>
      </ControlGroup>

      <ControlGroup title="Thông số vật lý">
        <ControlSlider label="Vận tốc (v₀)" value={config.velocity} unit="m/s" min={5} max={80} step={1} color="#a855f7" onChange={(v) => updateConfig("velocity", v)} disabled={hasLaunched} />
        <ControlSlider label="Góc bắn (θ)" value={config.angle} unit="°" min={5} max={85} step={1} color="#ec4899" onChange={(v) => updateConfig("angle", v)} decimals={0} disabled={hasLaunched} />
        <ControlSlider label="Khối lượng (m)" value={config.mass} unit="kg" min={0.1} max={10} step={0.1} color="#3b82f6" onChange={(v) => updateConfig("mass", v)} />

        <div className="mt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Trọng lực (g)</span>
            <span className="font-mono text-green-600">{config.gravity.toFixed(2)} m/s²</span>
          </div>
          <input
            type="range" min="0.5" max="26" step="0.01" value={config.gravity}
            onChange={(e) => updateConfig("gravity", parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer touch-none"
            style={{ accentColor: "#22c55e" }}
          />
          <div className="flex flex-wrap gap-1.5 mt-1">
            {GRAVITY_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => updateConfig("gravity", p.value)}
                className={`px-2 py-1 text-xs rounded-md border transition-all ${
                  Math.abs(config.gravity - p.value) < 0.05
                    ? "bg-green-600/30 border-green-500 text-green-700"
                    : "bg-gray-200/50 border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </div>
      </ControlGroup>

      <ControlGroup title="Môi trường">
        <label className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
          <span>Lực cản không khí (F ∝ v²)</span>
          <input
            type="checkbox" checked={config.airResistance}
            onChange={(e) => updateConfig("airResistance", e.target.checked)}
            className="w-4 h-4 rounded accent-purple-500"
            disabled={hasLaunched}
          />
        </label>
        {config.airResistance && (
          <ControlSlider label="Hệ số cản" value={config.dragCoefficient} unit="" min={0.001} max={0.15} step={0.001} color="#f59e0b" onChange={(v) => updateConfig("dragCoefficient", v)} decimals={3} disabled={hasLaunched} />
        )}
        <ControlSlider label="Khoảng cách mục tiêu" value={config.targetDistance} unit="m" min={10} max={150} step={5} color="#f97316" onChange={(v) => updateConfig("targetDistance", v)} decimals={0} />
      </ControlGroup>

      <ControlGroup title="Tùy chọn hiển thị">
        {[
          { label: "Đường quỹ đạo", key: "showTrail" as const },
          { label: "Đường dự đoán", key: "showPrediction" as const },
          { label: "Véc-tơ vận tốc", key: "showVelocityVector" as const },
          { label: "Điểm mốc (0.5s)", key: "showGhostMarkers" as const },
          { label: "Đánh dấu khoảng cách", key: "showDistanceMarkers" as const },
        ].map((opt) => (
          <label key={opt.key} className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50">
            <span>{opt.label}</span>
            <input
              type="checkbox" checked={config[opt.key]}
              onChange={(e) => updateConfig(opt.key, e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500"
            />
          </label>
        ))}
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/projectile-motion/details")}
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
          toaDoX: { value: data.currentX, unit: "m", color: "#a855f7" },
          toaDoY: { value: data.currentY, unit: "m", color: "#ec4899" },
          tocDo: { value: data.speed, unit: "m/s", color: "#22c55e" },
          thoiGian: { value: data.flightTime, unit: "s", color: "#06d6a0" },
          doCaoMax: { value: data.maxHeight, unit: "m", color: "#f59e0b" },
          tamXa: { value: data.range, unit: "m", color: "#818cf8" },
        }}
        columns={2}
      />
      <div className="mt-3 pt-3 border-t border-gray-300 grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-gray-100/50 rounded">
          <span className="text-gray-600">Động năng</span>
          <div className="font-mono text-orange-600">{data.kineticEnergy.toFixed(1)} J</div>
        </div>
        <div className="p-2 bg-gray-100/50 rounded">
          <span className="text-gray-600">Thế năng</span>
          <div className="font-mono text-blue-600">{data.potentialEnergy.toFixed(1)} J</div>
        </div>
      </div>
      {data.hasLanded && (
        <div className="mt-2 p-2 bg-green-900/30 border border-green-500/30 rounded-lg text-xs space-y-1">
          <div className="text-green-400 font-semibold">✅ Đã chạm đất!</div>
          <div className="flex justify-between text-gray-400">
            <span>Tầm xa:</span>
            <span className="font-mono text-purple-300">{data.range.toFixed(1)} m</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Dự đoán:</span>
            <span className="font-mono text-pink-300">{data.predictedRange.toFixed(1)} m</span>
          </div>
          {data.impactVelocity > 0 && (
            <div className="flex justify-between text-gray-400">
              <span>Tốc độ chạm:</span>
              <span className="font-mono text-red-300">{data.impactVelocity.toFixed(1)} m/s @ {data.impactAngle.toFixed(0)}°</span>
            </div>
          )}
        </div>
      )}
    </>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      {hasLaunched ? "Đang chờ dữ liệu mô phỏng..." : "Nhấn Phóng để bắt đầu"}
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Chuyển động ném xiên"
        description="Nghiên cứu quỹ đạo parabol dưới trọng lực với lực cản không khí thực tế và luyện tập bắn mục tiêu"
        cameraPosition={[70, 40, 70]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <ProjectileMotionSceneComponent
          onDataChange={setData}
          velocity={config.velocity}
          angle={config.angle}
          gravity={config.gravity}
          mass={config.mass}
          airResistance={config.airResistance}
          dragCoefficient={config.dragCoefficient}
          targetDistance={config.targetDistance}
          showTrail={config.showTrail}
          showPrediction={config.showPrediction}
          showVelocityVector={config.showVelocityVector}
          showGhostMarkers={config.showGhostMarkers}
          showDistanceMarkers={config.showDistanceMarkers}
          resetTrigger={resetTrigger}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
        />
      </ExperimentContainer>

      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying((p) => !p)}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
        timeElapsed={timeElapsed}
      />

      <FloatingControlPanel
        title="🎯 Thông số ném xiên"
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
