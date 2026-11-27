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
  const [mode, setMode] = useState<"transport" | "mitosis">("transport");
  const [tonicity, setTonicity] = useState<"isotonic" | "hypotonic" | "hypertonic">("isotonic");
  const [phase, setPhase] = useState<"prophase" | "metaphase" | "anaphase" | "telophase">("metaphase");

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
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Sinh Học Lớp 10 • Tế Bào Học & Chu Kỳ Tế Bào
              </span>
              <h1 className="text-lg md:text-xl font-bold">Cấu Trúc Tế Bào, Vận Chuyển Qua Màng & Phân Bào</h1>
            </div>
          </div>
          <span className="hidden sm:inline-block text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300">
            Môn Sinh Học
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-[460px] md:h-[520px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <Scene mode={mode} tonicity={tonicity} phase={phase} />
          </div>
          <Theory />
        </div>
        <div className="lg:col-span-4">
          <Controls mode={mode} setMode={setMode} tonicity={tonicity} setTonicity={setTonicity} phase={phase} setPhase={setPhase} />
        </div>
      </div>
    </main>
  );
}
