"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  SpringMassSceneComponent,
  SpringMassData,
} from "@/experiments/spring-mass-scene";
import {
  ExperimentContainer,
  ControlGroup,
  ControlSlider,
  ControlButton,
  DataGrid,
  FloatingControlPanel,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function SpringMassPage() {
  const router = useRouter();
  const [data, setData] = useState<SpringMassData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Tham số cơ bản con lắc lò xo
  const [mass, setMass] = useState(2);
  const [springConstant, setSpringConstant] = useState(50);
  const [damping, setDamping] = useState(0.4);
  const [initialDisplacement, setInitialDisplacement] = useState(2);
  const [numberOfMasses, setNumberOfMasses] = useState(1);

  // Tham số dao động cưỡng bức & cộng hưởng (SGK Vật lí 11)
  const [drivingAmplitude, setDrivingAmplitude] = useState(0);
  const [drivingFrequency, setDrivingFrequency] = useState(0.8);

  const naturalFrequency = useMemo(
    () => 1 / (2 * Math.PI * Math.sqrt(mass / springConstant)),
    [mass, springConstant]
  );

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
  };

  const handleSetResonance = () => {
    setDrivingAmplitude(12);
    setDrivingFrequency(Number(naturalFrequency.toFixed(2)));
    setDamping(0.5);
    setInitialDisplacement(0.2);
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Tham số con lắc lò xo">
        <ControlSlider
          label="Khối lượng (m)"
          value={mass}
          unit="kg"
          min={0.5}
          max={10}
          step={0.5}
          color="#4f8fff"
          onChange={setMass}
          decimals={1}
        />
        <ControlSlider
          label="Độ cứng lò xo (k)"
          value={springConstant}
          unit="N/m"
          min={10}
          max={200}
          step={5}
          color="#22c55e"
          onChange={setSpringConstant}
          decimals={0}
        />
        <ControlSlider
          label="Hệ số cản tắt dần (b)"
          value={damping}
          unit="Ns/m"
          min={0}
          max={3}
          step={0.1}
          color="#ef4444"
          onChange={setDamping}
          decimals={2}
        />
        <ControlSlider
          label="Biên độ ban đầu (A₀)"
          value={initialDisplacement}
          unit="m"
          min={0}
          max={3.5}
          step={0.5}
          color="#f59e0b"
          onChange={setInitialDisplacement}
          decimals={1}
        />
        <ControlSlider
          label="Số vật nặng"
          value={numberOfMasses}
          unit=""
          min={1}
          max={3}
          step={1}
          color="#a855f7"
          onChange={(v) => setNumberOfMasses(Math.round(v))}
          decimals={0}
        />
      </ControlGroup>

      <ControlGroup title="Ngoại lực cưỡng bức & Cộng hưởng">
        <ControlSlider
          label="Biên độ ngoại lực (F₀)"
          value={drivingAmplitude}
          unit="N"
          min={0}
          max={30}
          step={2}
          color="#f97316"
          onChange={setDrivingAmplitude}
          decimals={0}
        />
        <ControlSlider
          label="Tần số ngoại lực (f)"
          value={drivingFrequency}
          unit="Hz"
          min={0.1}
          max={2.5}
          step={0.02}
          color="#eab308"
          onChange={setDrivingFrequency}
          decimals={2}
        />
        <ControlButton
          label={`Kích thích cộng hưởng (f = f₀ = ${naturalFrequency.toFixed(2)} Hz)`}
          icon="⚡"
          variant="warning"
          size="sm"
          fullWidth
          onClick={handleSetResonance}
        />
      </ControlGroup>

      <button
        onClick={() => router.push("/experiments/spring-mass/details")}
        className="w-full py-2.5 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 font-medium text-sm rounded-lg transition-all border border-amber-300/50 flex items-center justify-center gap-2"
      >
        📖 Lý thuyết Dao động & Cộng hưởng (Lớp 11)
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <>
      {data.isResonance && (
        <div className="mb-2.5 p-2 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-200 text-xs font-semibold">
          ⚡ ĐANG XẢY RA CỘNG HƯỞNG CƠ HỌC (f ≈ f₀ = {data.frequency.toFixed(2)} Hz) — Biên độ tăng cực đại!
        </div>
      )}
      <DataGrid
        data={{
          "Chu kỳ riêng T₀": { value: data.period, unit: "s", color: "#f59e0b", decimals: 3 },
          "Tần số riêng f₀": { value: data.frequency, unit: "Hz", color: "#8b5cf6", decimals: 2 },
          "Li độ x": { value: data.displacement, unit: "m", color: "#ec4899", decimals: 2 },
          "Vận tốc v": { value: data.velocity, unit: "m/s", color: "#22c55e", decimals: 2 },
          "Lực đàn hồi": { value: data.springForce, unit: "N", color: "#ef4444", decimals: 1 },
          "Ngoại lực F": { value: data.drivingForce, unit: "N", color: "#f97316", decimals: 1 },
        }}
        columns={2}
      />
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-gray-800/50 rounded">
            <span className="text-gray-500">Động năng Wđ</span>
            <div className="font-mono text-green-400">{data.kineticEnergy.toFixed(2)} J</div>
          </div>
          <div className="p-2 bg-gray-800/50 rounded">
            <span className="text-gray-500">Thế năng đàn hồi</span>
            <div className="font-mono text-amber-400">{data.springPotentialEnergy.toFixed(2)} J</div>
          </div>
          <div className="p-2 bg-gray-800/50 rounded">
            <span className="text-gray-500">Lực cản môi trường</span>
            <div className="font-mono text-blue-400">{data.dampingForce.toFixed(2)} N</div>
          </div>
          <div className="p-2 bg-gray-800/50 rounded">
            <span className="text-gray-500">Cơ năng W</span>
            <div className="font-mono text-purple-400">{data.totalEnergy.toFixed(2)} J</div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Đang chờ dữ liệu mô phỏng...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Con Lắc Lò Xo: Dao Động Điều Hòa & Cộng Hưởng (Lớp 11)"
        description="Khảo sát dao động điều hòa, dao động tắt dần và hiện tượng cộng hưởng cơ học"
        cameraPosition={[0, 1, 14]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <SpringMassSceneComponent
          onDataChange={setData}
          mass={mass}
          springConstant={springConstant}
          damping={damping}
          initialDisplacement={initialDisplacement}
          numberOfMasses={numberOfMasses}
          drivingAmplitude={drivingAmplitude}
          drivingFrequency={drivingFrequency}
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
        title="⚙️ Tham số dao động & Cộng hưởng"
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
