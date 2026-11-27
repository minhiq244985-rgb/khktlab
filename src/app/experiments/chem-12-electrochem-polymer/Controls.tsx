"use client";

import { E0_TABLE } from "./Scene";

interface ControlsProps {
  mode: "galvanic" | "electrolysis";
  setMode: (v: "galvanic" | "electrolysis") => void;
  anodeMetal: "Zn" | "Fe" | "Mg";
  setAnodeMetal: (v: "Zn" | "Fe" | "Mg") => void;
  cathodeMetal: "Cu" | "Ag";
  setCathodeMetal: (v: "Cu" | "Ag") => void;
  currentA: number;
  setCurrentA: (v: number) => void;
  timeMin: number;
  setTimeMin: (v: number) => void;
}

export default function Controls({
  mode,
  setMode,
  anodeMetal,
  setAnodeMetal,
  cathodeMetal,
  setCathodeMetal,
  currentA,
  setCurrentA,
  timeMin,
  setTimeMin,
}: ControlsProps) {
  const ePin = E0_TABLE[cathodeMetal] - E0_TABLE[anodeMetal];
  const mCu = (64 * currentA * timeMin * 60) / (2 * 96500);

  return (
    <div className="glass rounded-2xl p-5 border border-white/10 space-y-5">
      <div>
        <h2 className="font-bold text-base mb-2 text-pink-300">1. Chọn Thí Nghiệm Hóa Học 12</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("galvanic")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
              mode === "galvanic"
                ? "bg-amber-600/35 border-amber-400 text-white"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            🔋 Pin Điện Hóa Galvani
          </button>
          <button
            onClick={() => setMode("electrolysis")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
              mode === "electrolysis"
                ? "bg-pink-600/35 border-pink-400 text-white"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            ⚡ Điện Phân Dung Dịch
          </button>
        </div>
      </div>

      {mode === "galvanic" ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-300 block mb-1.5">Cực âm (Anode — xảy ra oxi hóa):</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Mg", "Zn", "Fe"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setAnodeMetal(m)}
                  className={`py-2 rounded-lg text-xs font-bold border ${
                    anodeMetal === m
                      ? "bg-sky-600/40 border-sky-400 text-white"
                      : "bg-white/5 border-white/10 text-gray-400"
                  }`}
                >
                  {m} ({E0_TABLE[m]}V)
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-300 block mb-1.5">Cực dương (Cathode — xảy ra khử):</label>
            <div className="grid grid-cols-2 gap-2">
              {(["Cu", "Ag"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setCathodeMetal(m)}
                  className={`py-2 rounded-lg text-xs font-bold border ${
                    cathodeMetal === m
                      ? "bg-orange-600/40 border-orange-400 text-white"
                      : "bg-white/5 border-white/10 text-gray-400"
                  }`}
                >
                  {m} (+{E0_TABLE[m]}V)
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
            <div className="text-gray-400">Suất điện động chuẩn của pin:</div>
            <div className="text-lg font-bold text-amber-300 font-mono">
              E°<sub>pin</sub> = E°(+) − E°(−) = {ePin.toFixed(3)} V
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Cường độ dòng điện (I)</span>
              <span className="font-mono text-pink-300">{currentA.toFixed(1)} A</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={5.0}
              step={0.5}
              value={currentA}
              onChange={(e) => setCurrentA(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Thời gian điện phân (t)</span>
              <span className="font-mono text-sky-300">{timeMin} phút</span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={timeMin}
              onChange={(e) => setTimeMin(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-xs space-y-1">
            <div className="text-gray-400">Định luật Faraday: m = A.I.t / (n.F)</div>
            <div className="text-base font-bold text-pink-300 font-mono">
              m(Cu) = {mCu.toFixed(3)} gam
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
