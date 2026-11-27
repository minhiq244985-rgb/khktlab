"use client";

interface ControlsProps {
  mode: "orbital" | "enthalpy" | "rate";
  setMode: (v: "orbital" | "enthalpy" | "rate") => void;
  orbitalType: "1s" | "2px" | "2py" | "2pz";
  setOrbitalType: (v: "1s" | "2px" | "2py" | "2pz") => void;
  reactionType: "exo" | "endo";
  setReactionType: (v: "exo" | "endo") => void;
  tempC: number;
  setTempC: (v: number) => void;
  concM: number;
  setConcM: (v: number) => void;
  hasCatalyst: boolean;
  setHasCatalyst: (v: boolean) => void;
}

export default function Controls({
  mode,
  setMode,
  orbitalType,
  setOrbitalType,
  reactionType,
  setReactionType,
  tempC,
  setTempC,
  concM,
  setConcM,
  hasCatalyst,
  setHasCatalyst,
}: ControlsProps) {
  const rateRelative = (
    concM *
    Math.pow(2.2, (tempC - 20) / 10) *
    (hasCatalyst ? 2.5 : 1.0)
  ).toFixed(2);

  return (
    <div className="glass rounded-2xl p-5 border border-white/10 space-y-5">
      <div>
        <h2 className="font-bold text-base mb-2 text-pink-300">1. Chọn Chuyên Đề SGK Hóa 10</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "orbital", label: "Obitan AO" },
            { id: "enthalpy", label: "Enthalpy ΔH" },
            { id: "rate", label: "Tốc độ PƯ" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id as "orbital" | "enthalpy" | "rate")}
              className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                mode === item.id
                  ? "bg-pink-600/35 border-pink-400 text-white"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {mode === "orbital" && (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-300 block">
            Hình dạng đám mây electron (AO):
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(["1s", "2px", "2py", "2pz"] as const).map((ao) => (
              <button
                key={ao}
                onClick={() => setOrbitalType(ao)}
                className={`py-2 rounded-lg text-xs font-bold border ${
                  orbitalType === ao
                    ? "bg-sky-600/40 border-sky-400 text-white"
                    : "bg-white/5 border-white/10 text-gray-400"
                }`}
              >
                {ao}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            Obitan s có dạng hình cầu đối xứng; các obitan 2px, 2py, 2pz có dạng hình số 8 nổi định hướng theo 3 trục x, y, z.
          </p>
        </div>
      )}

      {mode === "enthalpy" && (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-300 block">Loại phản ứng nhiệt hóa:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setReactionType("exo")}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                reactionType === "exo"
                  ? "bg-rose-600/35 border-rose-400 text-white"
                  : "bg-white/5 border-white/10 text-gray-400"
              }`}
            >
              🔥 Tỏa nhiệt (ΔrH &lt; 0)
            </button>
            <button
              onClick={() => setReactionType("endo")}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                reactionType === "endo"
                  ? "bg-sky-600/35 border-sky-400 text-white"
                  : "bg-white/5 border-white/10 text-gray-400"
              }`}
            >
              ❄️ Thu nhiệt (ΔrH &gt; 0)
            </button>
          </div>

          <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs cursor-pointer">
            <span>Sử dụng chất xúc tác (giảm năng lượng hoạt hóa Ea)</span>
            <input
              type="checkbox"
              checked={hasCatalyst}
              onChange={(e) => setHasCatalyst(e.target.checked)}
              className="accent-pink-500 w-4 h-4"
            />
          </label>
        </div>
      )}

      {mode === "rate" && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300">Nhiệt độ phản ứng (T)</span>
              <span className="font-mono text-pink-300">{tempC} °C</span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              value={tempC}
              onChange={(e) => setTempC(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300">Nồng độ chất tham gia (C)</span>
              <span className="font-mono text-sky-300">{concM.toFixed(1)} M</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.1}
              value={concM}
              onChange={(e) => setConcM(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs cursor-pointer">
            <span>Thêm chất xúc tác (MnO₂ / Enzyme)</span>
            <input
              type="checkbox"
              checked={hasCatalyst}
              onChange={(e) => setHasCatalyst(e.target.checked)}
              className="accent-emerald-500 w-4 h-4"
            />
          </label>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
            <div className="text-gray-400">Tốc độ va chạm hiệu quả tương đối:</div>
            <div className="text-lg font-bold text-emerald-300 font-mono">{rateRelative}× v₀</div>
          </div>
        </div>
      )}
    </div>
  );
}
