"use client";

interface ControlsProps {
  mode: "operon" | "ecology";
  setMode: (v: "operon" | "ecology") => void;
  hasLactose: boolean;
  setHasLactose: (v: boolean) => void;
  producerEnergy: number;
  setProducerEnergy: (v: number) => void;
}

export default function Controls({
  mode,
  setMode,
  hasLactose,
  setHasLactose,
  producerEnergy,
  setProducerEnergy,
}: ControlsProps) {
  return (
    <div className="glass rounded-2xl p-5 border border-white/10 space-y-5">
      <div>
        <h2 className="font-bold text-base mb-2 text-emerald-300">1. Chọn Mô Hình Sinh Học 12</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("operon")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
              mode === "operon"
                ? "bg-emerald-600/35 border-emerald-400 text-white"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            🧬 Điều hòa Operon Lac
          </button>
          <button
            onClick={() => setMode("ecology")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
              mode === "ecology"
                ? "bg-sky-600/35 border-sky-400 text-white"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            🌲 Tháp Năng Lượng 10%
          </button>
        </div>
      </div>

      {mode === "operon" ? (
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs cursor-pointer">
            <span className="font-semibold">Môi trường tế bào E. coli có đường Lactose</span>
            <input
              type="checkbox"
              checked={hasLactose}
              onChange={(e) => setHasLactose(e.target.checked)}
              className="accent-emerald-500 w-4 h-4"
            />
          </label>
          <p className="text-xs text-gray-400">
            Allolactose liên kết làm biến đổi cấu hình không gian của protein ức chế, giúp giải phóng vùng vận hành O (Operator).
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between text-xs">
            <span>Năng lượng sinh vật sản xuất (Bậc 1)</span>
            <span className="font-mono text-emerald-300">{producerEnergy.toLocaleString("vi-VN")} kcal</span>
          </div>
          <input
            type="range"
            min={5000}
            max={50000}
            step={5000}
            value={producerEnergy}
            onChange={(e) => setProducerEnergy(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <p className="text-xs text-gray-400">
            Hiệu suất sinh thái qua mỗi bậc dinh dưỡng chỉ đạt khoảng 10% (90% thất thoát qua hô hấp, nhiệt và chất thải).
          </p>
        </div>
      )}
    </div>
  );
}
