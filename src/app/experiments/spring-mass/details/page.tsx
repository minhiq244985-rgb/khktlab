"use client";

import Link from "next/link";

export default function SpringMassDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 text-gray-100">
      <div className="sticky top-0 z-50 bg-gray-950/85 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-purple-400">
              🌀 Con Lắc Lò Xo: Dao Động Điều Hòa, Tắt Dần & Cộng Hưởng (Vật Lí 11)
            </h1>
            <p className="text-sm text-gray-400 mt-1">Cơ sở lý thuyết chương trình SGK Vật lí 11</p>
          </div>
          <Link
            href="/experiments/spring-mass"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-all"
          >
            ← Quay lại mô phỏng 3D
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-purple-400 mb-3">1. Dao động điều hòa của con lắc lò xo</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Khi bỏ qua ma sát (<code className="text-amber-300">b = 0</code>) và ngoại lực (<code className="text-amber-300">F₀ = 0</code>),
            con lắc lò xo dao động điều hòa dưới tác dụng của lực kéo về <code className="text-cyan-300">F = −k·x</code>.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-xs text-gray-400">Tần số góc riêng</div>
              <code className="text-cyan-300 font-mono">ω₀ = √(k / m) (rad/s)</code>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-xs text-gray-400">Chu kỳ & Tần số riêng</div>
              <code className="text-cyan-300 font-mono">T₀ = 2π√(m / k) ; f₀ = 1 / T₀</code>
            </div>
          </div>
        </section>

        <section className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-amber-400 mb-3">2. Dao động tắt dần & Hiện tượng cộng hưởng cơ</h2>
          <ul className="space-y-3 text-gray-300">
            <li>
              <strong>Dao động tắt dần:</strong> Khi tăng hệ số lực cản môi trường (<code className="text-red-400">b &gt; 0</code>),
              cơ năng của con lắc giảm dần chuyển hóa thành nhiệt năng, làm biên độ giảm dần cho đến khi dừng lại.
            </li>
            <li>
              <strong>Dao động cưỡng bức & Cộng hưởng:</strong> Khi đặt ngoại lực tuần hoàn{" "}
              <code className="text-amber-300">F(t) = F₀cos(2πft)</code>, hệ dao động với tần số bằng tần số ngoại lực <code className="text-amber-300">f</code>.
              Khi <code className="text-yellow-300 font-bold">f = f₀</code>, xảy ra <strong>hiện tượng cộng hưởng</strong>, biên độ dao động đạt giá trị cực đại.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
