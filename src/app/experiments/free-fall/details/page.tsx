"use client";

import Link from "next/link";

export default function FreeFallDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-sky-950 text-gray-100">
      <div className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-sky-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-sky-400">
              ⏱️ Thực Hành Đo Gia Tốc Rơi Tự Do (Vật Lí 10)
            </h1>
            <p className="text-sm text-gray-400 mt-1">Cơ sở lý thuyết & Quy trình thí nghiệm SGK</p>
          </div>
          <Link
            href="/experiments/free-fall"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg transition-all"
          >
            ← Quay lại mô phỏng 3D
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-sky-400 mb-3">1. Mục đích thí nghiệm</h2>
          <p className="text-gray-300 leading-relaxed">
            Khảo sát chuyển động rơi tự do của viên bi thép để kiểm chứng tính chất chuyển động thẳng nhanh dần đều
            và xác định gia tốc rơi tự do <code className="text-sky-300">g</code> tại nơi làm thí nghiệm thông qua
            hai cổng quang điện và đồng hồ đo thời gian hiện số.
          </p>
        </section>

        <section className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-sky-400 mb-3">2. Cơ sở lý thuyết & Công thức</h2>
          <div className="space-y-3">
            <div className="bg-gray-800/60 rounded-lg p-4">
              <div className="font-semibold text-sky-300">Quãng đường rơi tự do từ trạng thái nghỉ (v₀ = 0):</div>
              <code className="text-amber-300 font-mono text-base">s = ½ · g · t²</code>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-4">
              <div className="font-semibold text-sky-300">Xác định g qua 2 cổng quang tại s₁ và s₂:</div>
              <code className="text-amber-300 font-mono text-base">
                Δt = t₂ − t₁ = √(2s₂/g) − √(2s₁/g) ⇒ g = [ (√(2s₂) − √(2s₁)) / Δt ]²
              </code>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-4">
              <div className="font-semibold text-sky-300">Tính giá trị trung bình và sai số tuyệt đối trung bình:</div>
              <code className="text-emerald-300 font-mono text-sm">
                ḡ = (g₁ + g₂ + ... + gₙ) / n  ;  Δḡ = (|g₁ − ḡ| + ... + |gₙ − ḡ|) / n
              </code>
            </div>
          </div>
        </section>

        <section className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-sky-400 mb-3">3. Các bước tiến hành trong phòng thí nghiệm ảo</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Đặt vị trí cổng quang 1 (<code className="text-sky-300">s₁</code>) và cổng quang 2 (<code className="text-purple-300">s₂</code>) trên thước milimét.</li>
            <li>Ngắt điện nam châm điện (bấm <strong>Thả lại bi</strong>) để viên bi rơi tự do thẳng đứng qua hai tia hồng ngoại.</li>
            <li>Đọc thời gian <code className="text-yellow-300">Δt</code> trên đồng hồ hiện số và bấm <strong>Ghi số liệu</strong>.</li>
            <li>Lặp lại phép đo 3–5 lần để bảng thống kê tự động tính <code className="text-emerald-300">ḡ ± Δḡ</code> và sai số tỉ đối <code className="text-emerald-300">δ</code>.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
