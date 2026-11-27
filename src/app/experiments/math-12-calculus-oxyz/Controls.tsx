"use client";

interface ControlsProps {
  mode: "solid" | "oxyz";
  setMode: (v: "solid" | "oxyz") => void;
  upperB: number;
  setUpperB: (v: number) => void;
  sphereR: number;
  setSphereR: (v: number) => void;
}

export default function Controls({
  mode,
  setMode,
  upperB,
  setUpperB,
  sphereR,
  setSphereR,
}: ControlsProps) {
  const volume = (Math.PI * upperB * upperB) / 2;

  return (
    <div className="glass rounded-2xl p-5 border border-white/10 space-y-5">
      <div>
        <h2 className="font-bold text-base mb-2 text-amber-300">1. Chọn Mô Hình Toán Học 12</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("solid")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
              mode === "solid"
                ? "bg-amber-600/35 border-amber-400 text-white"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            🌀 Khối Tròn Xoay
          </button>
          <button
            onClick={() => setMode("oxyz")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
              mode === "oxyz"
                ? "bg-purple-600/35 border-purple-400 text-white"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            🌐 Mặt Cầu Oxyz
          </button>
        </div>
      </div>

      {mode === "solid" ? (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Cận trên tích phân b (miền [0; b])</span>
              <span className="font-mono text-amber-300">b = {upperB.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0.6}
              max={3.2}
              step={0.2}
              value={upperB}
              onChange={(e) => setUpperB(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
            <div className="text-gray-400">Thể tích khối tròn xoay V = π∫₀ᵇ (√x)² dx:</div>
            <div className="text-lg font-bold text-amber-300 font-mono">V = {volume.toFixed(3)} đvtt</div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Bán kính mặt cầu R</span>
              <span className="font-mono text-purple-300">R = {sphereR.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0.6}
              max={2.2}
              step={0.1}
              value={sphereR}
              onChange={(e) => setSphereR(Number(e.target.value))}
              className="w-full accent-purple-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
