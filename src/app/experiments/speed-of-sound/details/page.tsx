"use client";

import Link from "next/link";

export default function SpeedOfSoundDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-purple-950 text-gray-100">
      <div className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-purple-400">
              📢 Đo Tốc Độ Truyền Âm Trong Không Khí (Vật Lí 11)
            </h1>
            <p className="text-sm text-gray-400 mt-1">Hiện tượng sóng dừng & Cộng hưởng cột khí</p>
          </div>
          <Link
            href="/experiments/speed-of-sound"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-all"
          >
            ← Quay lại mô phỏng 3D
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-purple-400 mb-3">1. Nguyên tắc đo bằng ống cộng hưởng</h2>
          <p className="text-gray-300 leading-relaxed">
            Sóng âm do loa phát ra ở miệng ống (bụng sóng) truyền xuống mặt nước (đầu kín – nút sóng) và phản xạ ngược trở lại.
            Sự giao thoa giữa sóng tới và sóng phản xạ tạo thành <strong>sóng dừng</strong> trong cột khí khi chiều dài cột khí thỏa mãn:
          </p>
          <div className="bg-gray-800/60 rounded-lg p-4 mt-3">
            <code className="text-amber-300 font-mono text-base">l = (2k + 1) · (λ / 4)   (với k = 0, 1, 2,...)</code>
          </div>
        </section>

        <section className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-purple-400 mb-3">2. Công thức tính bước sóng & tốc độ truyền âm</h2>
          <div className="space-y-3">
            <div className="bg-gray-800/60 rounded-lg p-4">
              <div className="text-sm text-gray-400">Khoảng cách giữa hai lần cộng hưởng liên tiếp:</div>
              <code className="text-cyan-300 font-mono text-base">Δl = l₂ − l₁ = λ / 2  ⇒  λ = 2(l₂ − l₁)</code>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-4">
              <div className="text-sm text-gray-400">Tốc độ truyền âm trong không khí:</div>
              <code className="text-emerald-300 font-mono text-base">v = λ · f = 2(l₂ − l₁) · f</code>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
