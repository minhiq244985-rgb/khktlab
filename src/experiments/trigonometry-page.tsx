"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TrigonometrySceneComponent, { TrigonometryData } from "@/experiments/trigonometry-scene";
import {
  ExperimentContainer,
  FloatingControlPanel,
  ControlGroup,
  ControlSlider,
  DataGrid,
  SimulationController,
  DataPanel,
  ControlCheckbox,
} from "@/components/experiment-ui";

export default function TrigonometryPage() {
  const router = useRouter();
  const [data, setData] = useState<TrigonometryData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [angle, setAngle] = useState(45);
  const [useRadians, setUseRadians] = useState(false);
  const [showSin, setShowSin] = useState(true);
  const [showCos, setShowCos] = useState(true);
  const [showTan, setShowTan] = useState(true);
  const [showCot, setShowCot] = useState(false);
  const [showSec, setShowSec] = useState(false);
  const [showCsc, setShowCsc] = useState(false);
  const [showWaves, setShowWaves] = useState(true);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setResetTrigger((n) => n + 1);
    setIsPlaying(true);
    setSimulationSpeed(1);
    setAngle(45);
  };

  const parameterControls = (
    <div className="space-y-4">
      <ControlGroup title="Điều khiển góc">
        <ControlSlider
          label={useRadians ? "Góc (rad)" : "Góc (độ)"}
          value={angle}
          unit={useRadians ? "rad" : "°"}
          min={0}
          max={useRadians ? 6.28 : 360}
          step={useRadians ? 0.1 : 1}
          color="#8b5cf6"
          onChange={setAngle}
          decimals={useRadians ? 2 : 0}
        />
      </ControlGroup>

      <ControlGroup title="Tùy chọn hiển thị">
        <ControlCheckbox label="Dùng Radians" checked={useRadians} onChange={setUseRadians} color="#8b5cf6" />
        <ControlCheckbox label="Hiển thị Sin" checked={showSin} onChange={setShowSin} color="#3b82f6" />
        <ControlCheckbox label="Hiển thị Cos" checked={showCos} onChange={setShowCos} color="#22c55e" />
        <ControlCheckbox label="Hiển thị Tan" checked={showTan} onChange={setShowTan} color="#ef4444" />
        <ControlCheckbox label="Hiển thị Cot" checked={showCot} onChange={setShowCot} color="#f97316" />
        <ControlCheckbox label="Hiển thị Sec" checked={showSec} onChange={setShowSec} color="#a855f7" />
        <ControlCheckbox label="Hiển thị Csc" checked={showCsc} onChange={setShowCsc} color="#ec4899" />
        <ControlCheckbox label="Hiển thị Đồ thị" checked={showWaves} onChange={setShowWaves} color="#06b6d4" />
      </ControlGroup>

      <div className="bg-violet-50/50 rounded-lg p-3 border border-violet-200/50">
        <div className="text-xs text-gray-600 mb-2 font-medium">Mối quan hệ lượng giác</div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>• sin²(θ) + cos²(θ) = 1</div>
          <div>• tan(θ) = sin(θ) / cos(θ)</div>
          <div>• Nhấp và kéo để xoay góc nhìn</div>
          <div>• Hoạt ảnh hiển thị việc vẽ sóng</div>
        </div>
      </div>

      <button
        onClick={() => router.push("/experiments/trigonometry/details")}
        className="w-full py-2.5 bg-gradient-to-r from-violet-100 to-violet-200 hover:from-violet-200 hover:to-violet-300 text-violet-700 font-medium text-sm rounded-lg transition-all border border-violet-300/50 flex items-center justify-center gap-2"
      >
        📖 Xem chi tiết thí nghiệm
      </button>
    </div>
  );

  const dataPanelContent = data ? (
    <>
      <DataGrid
        data={{
          angle: {
            value: useRadians ? data.radians : data.angle,
            unit: useRadians ? "rad" : "độ",
            color: "#8b5cf6",
            decimals: useRadians ? 3 : 0,
          },
          sin: { value: data.sin, unit: "", color: "#22c55e", decimals: 4 },
          cos: { value: data.cos, unit: "", color: "#3b82f6", decimals: 4 },
          tan: {
            value: Math.abs(data.tan) > 100 ? 0 : data.tan,
            unit: "",
            color: "#ef4444",
            decimals: 4,
          },
        }}
        columns={2}
      />

      <div className="mt-3 space-y-2">
        <div className="p-2 bg-gray-800/50 rounded-lg">
          <div className="text-xs text-gray-400">Góc phần tư</div>
          <div className="text-sm font-bold text-violet-400">{data.quadrant}</div>
        </div>

        {data.exactValue && (
          <div className="p-2 bg-gray-800/50 rounded-lg">
            <div className="text-xs text-gray-400">Góc đặc biệt</div>
            <div className="text-xs font-mono text-green-400">{data.exactValue}</div>
            <div className="mt-1 text-xs text-gray-400">sin: {data.sinValue}</div>
            <div className="text-xs text-gray-400">cos: {data.cosValue}</div>
            <div className="text-xs text-gray-400">tan: {data.tanValue}</div>
          </div>
        )}

        <div className="p-2 bg-gray-800/50 rounded-lg">
          <div className="text-center font-mono text-violet-400 text-sm">
            sin²(θ) + cos²(θ) = 1
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
        title="Khám phá Lượng giác"
        description="Đường tròn đơn vị 3D tương tác với đầy đủ 6 hàm lượng giác, đồ thị thời gian thực và tham chiếu các góc đặc biệt"
        cameraPosition={[0, 0, 10]}
        backgroundColor="#050510"
        controls={null}
        dataPanel={null}
      >
        <TrigonometrySceneComponent
          onDataChange={setData}
          angle={angle}
          useRadians={useRadians}
          showSin={showSin}
          showCos={showCos}
          showTan={showTan}
          showCot={showCot}
          showSec={showSec}
          showCsc={showCsc}
          showGraph={showWaves}
          animationSpeed={simulationSpeed}
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

      <FloatingControlPanel title="📐 Điều khiển Lượng giác" initialPosition={{ x: 20, y: 80 }}>
        {parameterControls}
      </FloatingControlPanel>

      <DataPanel isVisible={showDataPanel} onToggle={() => setShowDataPanel(!showDataPanel)}>
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
