"use client";

import Link from "next/link";

export default function InductionDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-emerald-950 text-gray-100">
      <div className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-emerald-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-emerald-400">
              🧲 Hiện Tượng Cảm Ứng Điện Từ (Vật Lí 12)
            </h1>
            <p className="text-sm text-gray-400 mt-1">Từ thông, Định luật Faraday & Định luật Lenz</p>
          </div>
          <Link
            href="/experiments/electromagnetic-induction"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all"
          >
            ← Quay lại mô phỏng 3D
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-emerald-400 mb-3">1. Từ thông qua một mạch kín</h2>
          <div className="bg-gray-800/60 rounded-lg p-4">
            <code className="text-sky-300 font-mono text-base">Φ = N · B · S · cos α   (đơn vị: Weber - Wb)</code>
            <p className="text-xs text-gray-400 mt-2">
              Trong đó N là số vòng dây, B là cảm ứng từ, S là diện tích vòng dây và α là góc hợp bởi vectơ pháp tuyến n với B.
            </p>
          </div>
        </section>

        <section className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-emerald-400 mb-3">2. Định luật Faraday & Định luật Lenz</h2>
          <div className="space-y-3">
            <div className="bg-gray-800/60 rounded-lg p-4">
              <div className="font-semibold text-amber-300">Định luật Faraday về cảm ứng điện từ:</div>
              <code className="text-amber-300 font-mono text-base">e_c = − dΦ / dt   (Độ lớn: |e_c| = |ΔΦ / Δt|)</code>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-4">
              <div className="font-semibold text-emerald-300">Định luật Lenz về chiều dòng điện cảm ứng:</div>
              <p className="text-gray-300 text-sm mt-1">
                Dòng điện cảm ứng xuất hiện trong mạch kín có chiều sao cho từ trường cảm ứng có tác dụng chống lại
                sự biến thiên của từ thông ban đầu qua mạch kín.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
