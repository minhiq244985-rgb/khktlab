"use client";

interface ControlsProps {
  mode: "conic" | "vector";
  setMode: (v: "conic" | "vector") => void;
  planeAngle: number;
  setPlaneAngle: (v: number) => void;
  vecAx: number;
  setVecAx: (v: number) => void;
  vecAy: number;
  setVecAy: (v: number) => void;
  vecBx: number;
  setVecBx: (v: number) => void;
  vecBy: number;
  setVecBy: (v: number) => void;
}

export default function Controls({
  mode,
  setMode,
  planeAngle,
  setPlaneAngle,
  vecAx,
  setVecAx,
  vecAy,
  setVecAy,
  vecBx,
  setVecBx,
  vecBy,
  setVecBy,
}: ControlsProps) {
  const dot = vecAx * vecBx + vecAy * vecBy;

  return (
    <div className="glass rounded-2xl p-5 border border-white/10 space-y-5">
      <div>
        <h2 className="font-bold text-base mb-2 text-amber-300">1. Chọn Mô Hình Toán Học 10</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("conic")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
              mode === "conic"
                ? "bg-amber-600/35 border-amber-400 text-white"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            📐 Ba Đường Conic 3D
          </button>
          <button
            onClick={() => setMode("vector")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
              mode === "vector"
                ? "bg-sky-600/35 border-sky-400 text-white"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            ↗️ Vectơ & Tích Vô Hướng
          </button>
        </div>
      </div>

      {mode === "conic" ? (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Góc nghiêng mặt phẳng cắt hình nón</span>
              <span className="font-mono text-amber-300">{planeAngle}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={75}
              value={planeAngle}
              onChange={(e) => setPlaneAngle(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setPlaneAngle(22)} className="py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs">
              Elip (22°)
            </button>
            <button onClick={() => setPlaneAngle(45)} className="py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs">
              Parabol (45°)
            </button>
            <button onClick={() => setPlaneAngle(68)} className="py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs">
              Hypebol (68°)
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sky-300">Vectơ u⃗ = ({vecAx}; {vecAy})</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="range" min={-2.5} max={2.5} step={0.5} value={vecAx} onChange={(e) => setVecAx(Number(e.target.value))} className="accent-sky-400" />
              <input type="range" min={-2.0} max={2.0} step={0.5} value={vecAy} onChange={(e) => setVecAy(Number(e.target.value))} className="accent-sky-400" />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-pink-300">Vectơ v⃗ = ({vecBx}; {vecBy})</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="range" min={-2.5} max={2.5} step={0.5} value={vecBx} onChange={(e) => setVecBx(Number(e.target.value))} className="accent-pink-400" />
              <input type="range" min={-2.0} max={2.0} step={0.5} value={vecBy} onChange={(e) => setVecBy(Number(e.target.value))} className="accent-pink-400" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div>Tích vô hướng: <b>u⃗·v⃗ = {dot.toFixed(2)}</b></div>
            <div className="text-gray-400 mt-0.5">
              {Math.abs(dot) < 1e-6 ? "✅ Hai vectơ VUÔNG GÓC với nhau!" : "Hai vectơ không vuông góc."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
