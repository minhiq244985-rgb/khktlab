"use client";

import Link from "next/link";

export default function EmfDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-purple-950 text-gray-100">
      <div className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-purple-400">
              🔋 Đo Suất Điện Động (E) & Điện Trở Trong (r) (Vật Lí 11)
            </h1>
            <p className="text-sm text-gray-400 mt-1">Định luật Ohm đối với toàn mạch</p>
          </div>
          <Link
            href="/experiments/emf-internal-resistance"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-all"
          >
            ← Quay lại mô phỏng 3D
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-purple-400 mb-3">1. Cơ sở lý thuyết</h2>
          <div className="space-y-3">
            <div className="bg-gray-800/60 rounded-lg p-4">
              <div className="text-sm text-gray-400">Định luật Ohm cho toàn mạch kín:</div>
              <code className="text-emerald-300 font-mono text-base">I = E / (R + r)</code>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-4">
              <div className="text-sm text-gray-400">Hiệu điện thế mạch ngoài (hai cực của nguồn điện):</div>
              <code className="text-sky-300 font-mono text-base">U = I · R = E − I · r</code>
            </div>
          </div>
        </section>

        <section className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-purple-400 mb-3">2. Phương pháp xác định E và r từ đồ thị U(I)</h2>
          <p className="text-gray-300 leading-relaxed">
            Hàm số <code className="text-sky-300">U = E − r·I</code> có dạng đường thẳng nghịch biến trên hệ trục <code className="text-amber-300">(I, U)</code>:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300 mt-3">
            <li>Khi <code className="text-amber-300">I = 0</code> (mạch hở, ngắt khóa K): <code className="text-emerald-300">U = E</code> (tung độ gốc chính là suất điện động).</li>
            <li>Độ dốc của đường thẳng <code className="text-amber-300">tan α = ΔU / ΔI = −r</code> cho phép xác định điện trở trong <code className="text-red-400">r</code>.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
