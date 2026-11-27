"use client";

import Link from "next/link";

export default function CalorimetryDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-emerald-950 text-gray-100">
      <div className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-emerald-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-emerald-400">
              🌡️ Đo Nhiệt Dung Riêng & Ẩn Nhiệt Chuyển Thể (Vật Lí 12)
            </h1>
            <p className="text-sm text-gray-400 mt-1">Vật lí nhiệt — Chương trình SGK Vật lí 12</p>
          </div>
          <Link
            href="/experiments/calorimetry"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all"
          >
            ← Quay lại mô phỏng 3D
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-emerald-400 mb-3">1. Công thức xác định các đại lượng nhiệt học</h2>
          <div className="space-y-3">
            <div className="bg-gray-800/60 rounded-lg p-4">
              <div className="font-semibold text-sky-300">Nhiệt dung riêng (c):</div>
              <code className="text-amber-300 font-mono text-base">Q = P · t = m · c · ΔT  ⇒  c = (P · t) / (m · ΔT)</code>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-4">
              <div className="font-semibold text-cyan-300">Nhiệt nóng chảy riêng (λ):</div>
              <code className="text-amber-300 font-mono text-base">Q = λ · m  ⇒  λ = (P · t_nc) / m</code>
              <p className="text-xs text-gray-400 mt-1">Trong suốt thời gian nóng chảy ở 0°C, nhiệt độ của hệ không đổi.</p>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-4">
              <div className="font-semibold text-orange-300">Nhiệt hóa hơi riêng (L):</div>
              <code className="text-amber-300 font-mono text-base">Q = L · Δm  ⇒  L = (P · t_hh) / Δm</code>
              <p className="text-xs text-gray-400 mt-1">Trong suốt quá trình sôi ở 100°C, nhiệt lượng cung cấp dùng để phá vỡ liên kết phân tử hóa hơi.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
