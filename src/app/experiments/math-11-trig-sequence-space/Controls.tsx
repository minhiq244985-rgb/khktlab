"use client";

interface ControlsProps {
  mode: "trig" | "pyramid";
  setMode: (v: "trig" | "pyramid") => void;
  angleDeg: number;
  setAngleDeg: (v: number) => void;
  heightSA: number;
  setHeightSA: (v: number) => void;
}

export default function Controls({
  mode,
  setMode,
  angleDeg,
  setAngleDeg,
  heightSA,
  setHeightSA,
}: ControlsProps) {
  const dihedralDeg = (Math.atan(heightSA / 2.4) * 180) / Math.PI;
  const vol = ((1 / 3) * 2.4 * 2.4 * heightSA).toFixed(2);

  return (
    <div className="glass rounded-2xl p-5 border border-white/10 space-y-5">
      <div>
        <h2 className="font-bold text-base mb-2 text-amber-300">1. Chọn Mô Hình Toán Học 11</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("pyramid")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
              mode === "pyramid"
                ? "bg-amber-600/35 border-amber-400 text-white"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            🏛️ Chóp S.ABCD & Nhị diện
          </button>
          <button
            onClick={() => setMode("trig")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
              mode === "trig"
                ? "bg-sky-600/35 border-sky-400 text-white"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            ⭕ Đường Tròn Lượng Giác
          </button>
        </div>
      </div>

      {mode === "pyramid" ? (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Chiều cao đường cao SA (đáy vuông a = 2,4)</span>
              <span className="font-mono text-rose-300">SA = {heightSA.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={3.6}
              step={0.2}
              value={heightSA}
              onChange={(e) => setHeightSA(Number(e.target.value))}
              className="w-full accent-rose-400"
            />
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
            <div>Góc phẳng nhị diện [S, BC, A]: <b>{dihedralDeg.toFixed(2)}°</b></div>
            <div>Thể tích khối chóp V = ⅓·S<sub>đáy</sub>·SA = <b>{vol}</b></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Góc lượng giác α</span>
              <span className="font-mono text-amber-300">{angleDeg}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={5}
              value={angleDeg}
              onChange={(e) => setAngleDeg(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
