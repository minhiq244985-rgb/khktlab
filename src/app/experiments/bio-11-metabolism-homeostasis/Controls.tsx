"use client";

interface ControlsProps {
  lightLux: number;
  setLightLux: (v: number) => void;
  co2Ppm: number;
  setCo2Ppm: (v: number) => void;
  heartRate: number;
  setHeartRate: (v: number) => void;
}

export default function Controls({
  lightLux,
  setLightLux,
  co2Ppm,
  setCo2Ppm,
  heartRate,
  setHeartRate,
}: ControlsProps) {
  const photoRate = Math.min(100, Math.round((lightLux / 100) * (co2Ppm / 600) * 100));
  const cardiacOutput = ((heartRate * 70) / 1000).toFixed(2);

  return (
    <div className="glass rounded-2xl p-5 border border-white/10 space-y-5">
      <h2 className="font-bold text-base text-emerald-300">Điều Chỉnh Nhân Tố Sinh Lý (SGK 11)</h2>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span>Cường độ ánh sáng (Pha sáng)</span>
          <span className="font-mono text-amber-300">{lightLux}%</span>
        </div>
        <input
          type="range"
          min={5}
          max={100}
          value={lightLux}
          onChange={(e) => setLightLux(Number(e.target.value))}
          className="w-full accent-amber-400"
        />
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span>Nồng độ CO₂ (Chu trình Calvin)</span>
          <span className="font-mono text-emerald-300">{co2Ppm} ppm</span>
        </div>
        <input
          type="range"
          min={100}
          max={900}
          step={20}
          value={co2Ppm}
          onChange={(e) => setCo2Ppm(Number(e.target.value))}
          className="w-full accent-emerald-400"
        />
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span>Nhịp tim tuần hoàn máu (Động vật)</span>
          <span className="font-mono text-rose-300">{heartRate} nhịp/phút</span>
        </div>
        <input
          type="range"
          min={55}
          max={160}
          value={heartRate}
          onChange={(e) => setHeartRate(Number(e.target.value))}
          className="w-full accent-rose-400"
        />
      </div>

      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1.5">
        <div className="flex justify-between">
          <span className="text-gray-400">Hiệu suất quang hợp & giải phóng O₂:</span>
          <span className="font-bold text-emerald-300">{photoRate}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Lưu lượng tim (Q = nhịp × 70 mL):</span>
          <span className="font-bold text-rose-300">{cardiacOutput} L/phút</span>
        </div>
      </div>
    </div>
  );
}
