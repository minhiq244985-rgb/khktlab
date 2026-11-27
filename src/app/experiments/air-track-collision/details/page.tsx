"use client";

import Link from "next/link";

export default function AirTrackDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-sky-950 text-gray-100">
      <div className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-sky-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-sky-400">
              🚝 Bảo Toàn Động Lượng & Cơ Năng Trên Đệm Khí (Vật Lí 10)
            </h1>
            <p className="text-sm text-gray-400 mt-1">Cơ sở lý thuyết & Phân tích va chạm</p>
          </div>
          <Link
            href="/experiments/air-track-collision"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg transition-all"
          >
            ← Quay lại mô phỏng 3D
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-sky-400 mb-3">1. Nguyên tắc tạo hệ cô lập trên băng đệm khí</h2>
          <p className="text-gray-300 leading-relaxed">
            Băng đệm khí thổi các luồng khí nén qua hàng trăm lỗ nhỏ li ti nâng xe trượt lơ lửng,
            triệt tiêu hầu hết lực ma sát trượt theo phương ngang. Khi đó ngoại lực theo phương ngang bằng 0,
            hai xe trượt tạo thành một <strong>hệ cô lập</strong>.
          </p>
        </section>

        <section className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-sky-400 mb-3">2. Các biểu thức định luật bảo toàn</h2>
          <div className="space-y-3">
            <div className="bg-gray-800/60 rounded-lg p-4">
              <div className="font-semibold text-sky-300">Định luật bảo toàn động lượng (đúng cho mọi va chạm của hệ cô lập):</div>
              <code className="text-amber-300 font-mono text-base">m₁·v₁ + m₂·v₂ = m₁·v₁&apos; + m₂·v₂&apos;</code>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-4">
              <div className="font-semibold text-emerald-300">Va chạm đàn hồi (bảo toàn cả động năng):</div>
              <code className="text-emerald-300 font-mono text-sm">
                ½m₁v₁² + ½m₂v₂² = ½m₁v₁&apos;² + ½m₂v₂&apos;²
              </code>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-4">
              <div className="font-semibold text-orange-300">Va chạm mềm (hai vật dính vào nhau chuyển động cùng vận tốc v):</div>
              <code className="text-orange-300 font-mono text-base">v = (m₁v₁ + m₂v₂) / (m₁ + m₂)</code>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
