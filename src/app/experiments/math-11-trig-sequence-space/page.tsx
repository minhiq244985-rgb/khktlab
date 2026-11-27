"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Controls from "./Controls";
import Theory from "./Theory";
import { ArrowLeft } from "lucide-react";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#060913] text-gray-400">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Đang khởi tạo mô phỏng 3D SGK...</p>
      </div>
    </div>
  ),
});

export default function ExperimentPage() {
  const [mode, setMode] = useState<"trig" | "pyramid">("pyramid");
  const [angleDeg, setAngleDeg] = useState(60);
  const [heightSA, setHeightSA] = useState(2.2);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-40 glass border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/#experiments"
              className="p-2 glass rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Quay lại"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Toán Học Lớp 11 • Hàm Số Lượng Giác & Hình Học Không Gian
              </span>
              <h1 className="text-lg md:text-xl font-bold">Lượng Giác, Cấp Số & Quan Hệ Vuông Góc Không Gian</h1>
            </div>
          </div>
          <span className="hidden sm:inline-block text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300">
            Môn Toán Học
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-[460px] md:h-[520px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <Scene mode={mode} angleDeg={angleDeg} heightSA={heightSA} />
          </div>
          <Theory />
        </div>
        <div className="lg:col-span-4">
          <Controls mode={mode} setMode={setMode} angleDeg={angleDeg} setAngleDeg={setAngleDeg} heightSA={heightSA} setHeightSA={setHeightSA} />
        </div>
      </div>
    </main>
  );
}
