"use client";

interface ControlsProps {
  mode: "transport" | "mitosis";
  setMode: (v: "transport" | "mitosis") => void;
  tonicity: "isotonic" | "hypotonic" | "hypertonic";
  setTonicity: (v: "isotonic" | "hypotonic" | "hypertonic") => void;
  phase: "prophase" | "metaphase" | "anaphase" | "telophase";
  setPhase: (v: "prophase" | "metaphase" | "anaphase" | "telophase") => void;
}

export default function Controls({
  mode,
  setMode,
  tonicity,
  setTonicity,
  phase,
  setPhase,
}: ControlsProps) {
  return (
    <div className="glass rounded-2xl p-5 border border-white/10 space-y-5">
      <div>
        <h2 className="font-bold text-base mb-2 text-emerald-300">1. Chọn Thí Nghiệm Sinh Học 10</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("transport")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
              mode === "transport"
                ? "bg-emerald-600/35 border-emerald-400 text-white"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            💧 Thẩm thấu qua màng
          </button>
          <button
            onClick={() => setMode("mitosis")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
              mode === "mitosis"
                ? "bg-purple-600/35 border-purple-400 text-white"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            🧬 Các kỳ Nguyên phân
          </button>
        </div>
      </div>

      {mode === "transport" ? (
        <div className="space-y-2.5">
          <label className="text-xs text-gray-300 block">Nồng độ chất tan môi trường bên ngoài:</label>
          {[
            { id: "hypotonic", label: "Nhược trương (Nồng độ ngoài < trong)" },
            { id: "isotonic", label: "Đẳng trương (Nồng độ ngoài = trong)" },
            { id: "hypertonic", label: "Ưu trương (Nồng độ ngoài > trong)" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTonicity(item.id as "isotonic" | "hypotonic" | "hypertonic")}
              className={`w-full text-left p-3 rounded-xl text-xs font-semibold border transition-all ${
                tonicity === item.id
                  ? "bg-emerald-600/35 border-emerald-400 text-white"
                  : "bg-white/5 border-white/10 text-gray-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          <label className="text-xs text-gray-300 block">Giai đoạn phân chia nhân (Nguyên phân):</label>
          {[
            { id: "prophase", label: "1. Kỳ đầu (Prophase)" },
            { id: "metaphase", label: "2. Kỳ giữa (Metaphase)" },
            { id: "anaphase", label: "3. Kỳ sau (Anaphase)" },
            { id: "telophase", label: "4. Kỳ cuối (Telophase)" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPhase(item.id as "prophase" | "metaphase" | "anaphase" | "telophase")}
              className={`w-full text-left p-3 rounded-xl text-xs font-semibold border transition-all ${
                phase === item.id
                  ? "bg-purple-600/35 border-purple-400 text-white"
                  : "bg-white/5 border-white/10 text-gray-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
