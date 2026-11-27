"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import {
  ElectromagneticSceneComponent,
  EMFieldData,
} from "@/experiments/electromagnetic-scene";
import {
  ExperimentContainer,
  ControlGroup,
  ControlSlider,
  DataGrid,
  FloatingControlPanel,
  SimulationController,
  DataPanel,
} from "@/components/experiment-ui";

interface Charge {
  id: string;
  position: THREE.Vector3;
  magnitude: number;
}

export default function ElectromagneticPage() {
  const router = useRouter();
  const [data, setData] = useState<EMFieldData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);

  // Mô phỏng
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Tùy chọn hiển thị
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showEquipotential, setShowEquipotential] = useState(true);
  const [showForceVectors, setShowForceVectors] = useState(true);

  // Vị trí con trỏ để đo trường
  const [cursorPosition, setCursorPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 5, 0));

  // Trạng thái điện tích động
  const [charges, setCharges] = useState<Charge[]>([
    { id: "1", position: new THREE.Vector3(-6, 0, 0), magnitude: 8 },
    { id: "2", position: new THREE.Vector3(6, 0, 0), magnitude: -8 },
    { id: "3", position: new THREE.Vector3(0, 6, 0), magnitude: 5 },
  ]);

  // Theo dõi điện tích đang được chỉnh sửa
  const [selectedChargeId, setSelectedChargeId] = useState<string>("1");

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => {
    setIsPlaying(true);
    setSimulationSpeed(1);
    setTimeElapsed(0);
    setCursorPosition(new THREE.Vector3(0, 5, 0));
  };

  // Thêm điện tích mới
  const addCharge = useCallback(() => {
    const newId = Date.now().toString();
    const angle = Math.random() * Math.PI * 2;
    const radius = 4 + Math.random() * 4;
    setCharges((prev) => [
      ...prev,
      {
        id: newId,
        position: new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0),
        magnitude: 5,
      },
    ]);
    setSelectedChargeId(newId);
  }, []);

  // Xóa điện tích
  const removeCharge = useCallback((id: string) => {
    setCharges((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      // Chọn điện tích khác nếu có
      if (selectedChargeId === id && filtered.length > 0) {
        setSelectedChargeId(filtered[0].id);
      }
      return filtered;
    });
  }, [selectedChargeId]);

  // Cập nhật độ lớn điện tích
  const updateChargeMagnitude = useCallback((id: string, magnitude: number) => {
    setCharges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, magnitude } : c))
    );
  }, []);

  // Đảo dấu điện tích
  const toggleChargeSign = useCallback((id: string) => {
    setCharges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, magnitude: -c.magnitude } : c))
    );
  }, []);

  // Cập nhật vị trí điện tích
  const updateChargePosition = useCallback((id: string, axis: 'x' | 'y', value: number) => {
    setCharges((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, position: new THREE.Vector3(
              axis === 'x' ? value : c.position.x,
              axis === 'y' ? value : c.position.y,
              c.position.z
            )}
          : c
      )
    );
  }, []);

  // Điện tích được chọn để chỉnh sửa
  const selectedCharge = useMemo(
    () => charges.find((c) => c.id === selectedChargeId) || charges[0],
    [charges, selectedChargeId]
  );

  // Cập nhật vị trí con trỏ (mô phỏng theo dõi chuột)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCursorPosition((prev) => {
        // Quỹ đạo chậm quanh tâm để minh họa
        const time = Date.now() * 0.0003;
        return new THREE.Vector3(
          Math.cos(time) * 5,
          Math.sin(time) * 5,
          0
        );
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // === ĐIỀU KHIỂN THÔNG SỐ ===
  const parameterControls = (
    <div className="space-y-4">
      {/* Quản lý điện tích */}
      <ControlGroup title="Các điện tích">
        <div className="space-y-2">
          {/* Bộ chọn điện tích */}
          <div className="flex gap-1 flex-wrap">
            {charges.map((charge, index) => (
              <button
                key={charge.id}
                onClick={() => setSelectedChargeId(charge.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedChargeId === charge.id
                    ? charge.magnitude >= 0
                      ? "bg-red-500 text-white"
                      : "bg-blue-500 text-white"
                    : charge.magnitude >= 0
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                Q{index + 1}: {charge.magnitude > 0 ? "+" : ""}{charge.magnitude.toFixed(0)}µC
              </button>
            ))}
          </div>

          {/* Nút Thêm/Xóa */}
          <div className="flex gap-2">
            <button
              onClick={addCharge}
              disabled={charges.length >= 6}
              className="flex-1 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium text-xs rounded-lg transition-all border border-green-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➕ Thêm điện tích
            </button>
            <button
              onClick={() => removeCharge(selectedChargeId)}
              disabled={charges.length <= 2}
              className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium text-xs rounded-lg transition-all border border-red-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➖ Xóa
            </button>
          </div>
        </div>

        {/* Điều khiển điện tích đã chọn */}
        {selectedCharge && (
          <div className="mt-4 pt-4 border-t border-gray-200/50 space-y-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Chỉnh sửa Q{charges.findIndex(c => c.id === selectedCharge.id) + 1}
            </div>

            {/* Thanh trượt độ lớn */}
            <ControlSlider
              label="Độ lớn"
              value={Math.abs(selectedCharge.magnitude)}
              unit="µC"
              min={1}
              max={15}
              step={1}
              color={selectedCharge.magnitude >= 0 ? "#ef4444" : "#3b82f6"}
              onChange={(val) => updateChargeMagnitude(selectedCharge.id, selectedCharge.magnitude >= 0 ? val : -val)}
              decimals={0}
            />

            {/* Điều khiển vị trí */}
            <ControlSlider
              label="Vị trí X"
              value={selectedCharge.position.x}
              unit="m"
              min={-12}
              max={12}
              step={0.5}
              color="#8b5cf6"
              onChange={(val) => updateChargePosition(selectedCharge.id, 'x', val)}
              decimals={1}
            />
            <ControlSlider
              label="Vị trí Y"
              value={selectedCharge.position.y}
              unit="m"
              min={-12}
              max={12}
              step={0.5}
              color="#8b5cf6"
              onChange={(val) => updateChargePosition(selectedCharge.id, 'y', val)}
              decimals={1}
            />

            {/* Nút chuyển đổi dấu */}
            <button
              onClick={() => toggleChargeSign(selectedCharge.id)}
              className={`w-full py-2 font-medium text-xs rounded-lg transition-all ${
                selectedCharge.magnitude >= 0
                  ? "bg-blue-100 hover:bg-blue-200 text-blue-700"
                  : "bg-red-100 hover:bg-red-200 text-red-700"
              }`}
            >
              {selectedCharge.magnitude >= 0 ? "🔄 Chuyển sang âm" : "🔄 Chuyển sang dương"}
            </button>
          </div>
        )}
      </ControlGroup>

      {/* Vị trí con trỏ để đo */}
      <ControlGroup title="Vị trí đo">
        <ControlSlider
          label="Con trỏ X"
          value={cursorPosition.x}
          unit="m"
          min={-10}
          max={10}
          step={0.5}
          color="#f59e0b"
          onChange={(val) => setCursorPosition(new THREE.Vector3(val, cursorPosition.y, cursorPosition.z))}
          decimals={1}
        />
        <ControlSlider
          label="Con trỏ Y"
          value={cursorPosition.y}
          unit="m"
          min={-10}
          max={10}
          step={0.5}
          color="#f59e0b"
          onChange={(val) => setCursorPosition(new THREE.Vector3(cursorPosition.x, val, cursorPosition.z))}
          decimals={1}
        />
      </ControlGroup>

      {/* Tùy chọn hiển thị */}
      <ControlGroup title="Tùy chọn hiển thị">
        {[
          { label: "Đường sức điện trường", checked: showFieldLines, onChange: setShowFieldLines, color: "text-yellow-500" },
          { label: "Lưới vectơ trường", checked: showVectors, onChange: setShowVectors, color: "text-cyan-500" },
          { label: "Mặt đẳng thế", checked: showEquipotential, onChange: setShowEquipotential, color: "text-purple-500" },
          { label: "Vectơ lực", checked: showForceVectors, onChange: setShowForceVectors, color: "text-green-500" },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center justify-between text-sm text-gray-700 cursor-pointer py-2 px-3 bg-gray-100/50 rounded-lg border border-gray-300/50 hover:bg-gray-200/50 transition-colors">
            <span className={opt.color}>{opt.label}</span>
            <input
              type="checkbox"
              checked={opt.checked}
              onChange={(e) => opt.onChange(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500"
            />
          </label>
        ))}
      </ControlGroup>

      {/* Liên kết chi tiết */}
      <button
        onClick={() => router.push("/experiments/electromagnetic/details")}
        className="w-full py-2.5 bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-700 font-medium text-sm rounded-lg transition-all border border-purple-300/50 flex items-center justify-center gap-2"
      >
        📖 Xem chi tiết thí nghiệm
      </button>
    </div>
  );

  // === NỘI DUNG BẢNG DỮ LIỆU ===
  const dataPanelContent = data ? (
    <div className="space-y-4">
      {/* Trường tại điểm đo */}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Trường tại điểm đo
        </div>
        <DataGrid
          data={{
            electricField: { value: data.electricField, unit: "N/C", color: "#f59e0b", decimals: 2 },
            potential: { value: data.potential, unit: "V", color: "#8b5cf6", decimals: 2 },
            fieldX: { value: data.fieldX, unit: "N/C", color: "#ef4444", decimals: 2 },
            fieldY: { value: data.fieldY, unit: "N/C", color: "#22c55e", decimals: 2 },
          }}
          columns={2}
        />
      </div>

      {/* Lực tương tác giữa các điện tích */}
      {data.forcesBetweenCharges.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Lực tương tác giữa các điện tích
          </div>
          <div className="space-y-2">
            {data.forcesBetweenCharges.map((force, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-gray-50 rounded-lg p-2 text-sm"
              >
                <span className="text-gray-600">
                  {force.charge1} ↔ {force.charge2}
                </span>
                <div className="text-right">
                  <div className="font-semibold" style={{ color: "#ec4899" }}>
                    F = {force.force.toFixed(3)} N
                  </div>
                  <div className="text-xs text-gray-500">
                    d = {force.distance.toFixed(2)} m
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      Đang chờ dữ liệu mô phỏng...
    </div>
  );

  return (
    <>
      <ExperimentContainer
        title="Trường điện từ"
        description="Trực quan hóa điện trường, lực tương tác và mặt đẳng thế"
        cameraPosition={[0, 0, 45]}
        backgroundColor="#030312"
        controls={null}
        dataPanel={null}
      >
        <ElectromagneticSceneComponent
          onDataChange={setData}
          charges={charges}
          showFieldLines={showFieldLines}
          showVectors={showVectors}
          showEquipotential={showEquipotential}
          showForceVectors={showForceVectors}
          cursorPosition={cursorPosition}
        />
      </ExperimentContainer>

      {/* Bộ điều khiển mô phỏng - Luôn hiển thị */}
      <SimulationController
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        speed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
        timeElapsed={timeElapsed}
      />

      {/* Bảng điều khiển thông số - Có thể bật/tắt */}
      <FloatingControlPanel
        title="⚡ Điều khiển điện trường"
        initialPosition={{ x: 20, y: 80 }}
      >
        {parameterControls}
      </FloatingControlPanel>

      {/* Bảng dữ liệu - Nổi, có thể bật/tắt */}
      <DataPanel
        isVisible={showDataPanel}
        onToggle={() => setShowDataPanel(!showDataPanel)}
      >
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
