"use client";

import { calcTitrationPH } from "./Scene";

interface ControlsProps {
  mode: "equilibrium" | "titration";
  setMode: (v: "equilibrium" | "titration") => void;
  naohVol: number;
  setNaohVol: (v: number) => void;
  eqTemp: number;
  setEqTemp: (v: number) => void;
  eqPressure: number;
  setEqPressure: (v: number) => void;
}

export default function Controls({
  mode,
  setMode,
  naohVol,
  setNaohVol,
  eqTemp,
  setEqTemp,
  eqPressure,
  setEqPressure,
}: ControlsProps) {
  const pH = calcTitrationPH(naohVol);

  return (
    <div className="glass rounded-2xl p-5 border border-white/10 space-y-5">
      <div>
        <h2 className="font-bold text-base mb-2 text-pink-300">1. Chọn Thí Nghiệm Hóa Học 11</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("titration")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
              mode === "titration"
                ? "bg-pink-600/35 border-pink-400 text-white"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            ⚗️ Chuẩn độ Acid – Base
          </button>
          <button
            onClick={() => setMode("equilibrium")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
              mode === "equilibrium"
                ? "bg-amber-600/35 border-amber-400 text-white"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            ⚖️ Cân bằng Le Chatelier
          </button>
        </div>
      </div>

      {mode === "titration" ? (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
            Bình tam giác chứa <b>20,0 mL dung dịch HCl 0,10 M</b> + 2 giọt phenolphthalein. Nhỏ từ từ dung dịch chuẩn <b>NaOH 0,10 M</b> từ buret:
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Thể tích NaOH 0,1M đã nhỏ</span>
              <span className="font-mono text-pink-300">{naohVol.toFixed(1)} mL</span>
            </div>
            <input
              type="range"
              min={0}
              max={35}
              step={0.5}
              value={naohVol}
              onChange={(e) => setNaohVol(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setNaohVol(20.0)}
              className="flex-1 py-2 rounded-xl bg-emerald-600/30 border border-emerald-400/50 text-xs font-semibold text-emerald-200"
            >
              Điểm tương đương (20.0 mL)
            </button>
            <button
              onClick={() => setNaohVol(20.5)}
              className="flex-1 py-2 rounded-xl bg-pink-600/30 border border-pink-400/50 text-xs font-semibold text-pink-200"
            >
              Điểm kết thúc (20.5 mL)
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/10 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Giá trị pH dung dịch:</span>
              <span className="font-mono font-bold text-base text-pink-300">{pH.toFixed(2)}</span>
            </div>
            <div className="text-gray-400">
              Trạng thái:{" "}
              <b className="text-white">
                {pH < 7
                  ? "Môi trường Acid (HCl dư, không màu)"
                  : pH === 7
                  ? "Trung hòa hoàn toàn (pH = 7,00)"
                  : "Môi trường Base (Phenolphthalein hóa hồng)"}
              </b>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
            Hệ thuận nghịch: <b>2NO₂(g) ⇌ N₂O₄(g)</b> với Δ<sub>r</sub>H°<sub>298</sub> = -58 kJ (chiều thuận tỏa nhiệt và giảm số mol khí).
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Nhiệt độ bình phản ứng</span>
              <span className="font-mono text-amber-300">{eqTemp} °C</span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              value={eqTemp}
              onChange={(e) => setEqTemp(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Áp suất hệ khí</span>
              <span className="font-mono text-sky-300">{eqPressure.toFixed(1)} atm</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={3.0}
              step={0.1}
              value={eqPressure}
              onChange={(e) => setEqPressure(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
