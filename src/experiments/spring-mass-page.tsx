"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SpringMassSceneComponent,
  SpringMassData,
} from "@/experiments/spring-mass-scene";
import {
  ExperimentContainer,
  ControlGroup,
  ControlSlider,
  DataGrid,
  FloatingControlPanel,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

export default function SpringMassPage() {
  const router = useRouter();
  const [data, setData] = useState<SpringMassData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Simulation
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Physics parameters
  const [mass, setMass] = useState(2);
  const [springConstant, setSpringConstant] = useState(50);
  const [damping, setDamping] = useState(0.3);
  const [initialDisplacement, setInitialDisplacement] = useState(2);
  const [numberOfMasses, setNumberOfMasses] = useState(1);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
  };

  // === PARAMETER CONTROLS ===
  const parameterControls = (
    <div className="space-y-4">
      {/* Physics Parameters */}
      <ControlGroup title="Tham số vật lý">
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
          label="Hệ số tắt dần (b)"
          value={damping}
          unit="Ns/m"
          min={0}
          max={2}
          step={0.1}
          color="#ef4444"
          onChange={setDamping}
          decimals={2}
        />
        <ControlSlider
          label="Độ lệch ban đầu"
          value={initialDisplacement}
          unit="m"
          min={0.5}
          max={4}
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

      {/* Details link */}
      <button
        onClick={() => router.push("/experiments/spring-mass/details")}
        className="w-full py-2.5 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-700 font-medium text-sm rounded-lg transition-all border border-amber-300/50 flex items-center justify-center gap-2"
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
          period: { value: data.period, unit: "s (Chu kỳ)", color: "#f59e0b", decimals: 3 },
          frequency: { value: data.frequency, unit: "Hz (Tần số)", color: "#8b5cf6", decimals: 2 },
          displacement: { value: data.displacement, unit: "m (Li độ)", color: "#ec4899", decimals: 2 },
          velocity: { value: data.velocity, unit: "m/s (Vận tốc)", color: "#22c55e", decimals: 2 },
          springForce: { value: data.springForce, unit: "N (Lực đàn hồi)", color: "#ef4444", decimals: 1 },
          dampingForce: { value: data.dampingForce, unit: "N (Lực cản)", color: "#3b82f6", decimals: 2 },
        }}
        columns={2}
      />
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-gray-800/50 rounded">
            <span className="text-gray-500">Động năng</span>
            <div className="font-mono text-green-400">{data.kineticEnergy.toFixed(2)} J</div>
          </div>
          <div className="p-2 bg-gray-800/50 rounded">
            <span className="text-gray-500">Thế năng đàn hồi</span>
            <div className="font-mono text-amber-400">{data.springPotentialEnergy.toFixed(2)} J</div>
          </div>
          <div className="p-2 bg-gray-800/50 rounded">
            <span className="text-gray-500">Thế năng trọng trường</span>
            <div className="font-mono text-blue-400">{data.gravitationalPotentialEnergy.toFixed(2)} J</div>
          </div>
          <div className="p-2 bg-gray-800/50 rounded">
            <span className="text-gray-500">Cơ năng toàn phần</span>
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
        title="Hệ con lắc lò xo"
        description="Khám phá dao động điều hòa với định luật Hooke: F = -kx - bv. Hỗ trợ 1-3 vật mắc nối tiếp."
        cameraPosition={[18, 10, 18]}
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
          resetTrigger={resetTrigger}
          isPlaying={isPlaying}
          simulationSpeed={simulationSpeed}
        />
      </ExperimentContainer>

      {/* Simulation Controller - Always Visible */}
      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
        timeElapsed={data?.elapsedTime ?? 0}
      />

      {/* Parameter Controls - Toggleable */}
      <FloatingControlPanel
        title="⚙️ Tham số con lắc lò xo"
        initialPosition={{ x: 20, y: 80 }}
      >
        {parameterControls}
      </FloatingControlPanel>

      {/* Data Panel - Floating Toggleable */}
      <DataPanel
        isVisible={showDataPanel}
        onToggle={() => setShowDataPanel(!showDataPanel)}
      >
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
