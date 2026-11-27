"use client";

import Link from "next/link";

export default function GasLawsDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 text-gray-100">
      <div className="sticky top-0 z-50 bg-gray-950/85 backdrop-blur-xl border-b border-emerald-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-emerald-400">
              🎈 Khảo Sát Định Luật Boyle & Khí Lí Tưởng (Vật Lí 12)
            </h1>
            <p className="text-sm text-gray-400 mt-1">Quá trình đẳng nhiệt & Phương trình trạng thái</p>
          </div>
          <Link
            href="/experiments/gas-laws"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all"
          >
            ← Quay lại mô phỏng 3D
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-emerald-400 mb-3">1. Nội dung Định luật Boyle</h2>
          <p className="text-gray-300 leading-relaxed">
            Trong quá trình đẳng nhiệt của một lượng khí xác định (nhiệt độ tuyệt đối <code className="text-cyan-300">T</code> không đổi),
            áp suất <code className="text-pink-300">p</code> tỉ lệ nghịch với thể tích <code className="text-purple-300">V</code>:
          </p>
          <div className="bg-gray-800/60 rounded-lg p-4 mt-3">
            <code className="text-amber-300 font-mono text-base">p · V = hằng số   hay   p₁ · V₁ = p₂ · V₂</code>
          </div>
        </section>

        <section className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-emerald-400 mb-3">2. Đường đẳng nhiệt trong hệ tọa độ (p, V)</h2>
          <p className="text-gray-300 leading-relaxed">
            Trong hệ tọa độ <code className="text-cyan-300">(p, V)</code>, đường đẳng nhiệt là một nhánh của đường <strong>Hypebol</strong>.
            Đường đẳng nhiệt ứng với nhiệt độ cao hơn nằm ở phía trên và bên phải đường đẳng nhiệt ứng với nhiệt độ thấp hơn.
          </p>
        </section>
      </div>
    </div>
  );
}
