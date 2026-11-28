"use client";
import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, RotateCcw, BookOpen, Sliders } from "lucide-react";
const Scene = dynamic(() => import("./Scene"), { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center bg-[#060913] text-gray-400 text-xs">Loading 3D...</div> });
export default function ExperimentPage() { const [p1, setP1] = useState<number>(1.5);
 const [p2, setP2] = useState<number>(0.2);
 const [paused, setPaused] = useState<boolean>(false);
 const topics = ["Dao động cưỡng bức","Hiện tượng cộng hưởng cơ học"];
 return (<main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
<header className="sticky top-0 z-40 glass border-b border-white/10 px-4 py-3">
<div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
<div className="flex items-center gap-3">
<Link href="/#experiments" className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
<ArrowLeft size={18} /></Link>
<div>
<span className="text-xs font-semibold uppercase tracking-wider text-sky-400">Vật Lí Lớp 11 • GDPT 2018</span>
<h1 className="text-lg md:text-xl font-bold">Hệ Con Lắc Barton & Cộng Hưởng Cơ Học</h1></div></div>
<span className="hidden sm:inline-block text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300">Vật Lí</span></div></header>
<div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
<div className="lg:col-span-8 space-y-6">
<div className="h-[460px] md:h-[520px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
<Scene p1={p1} p2={p2} paused={paused} /></div>
<section className="glass rounded-2xl p-6 border border-white/10 space-y-3">
<div className="flex items-center gap-2 text-purple-400 font-bold">
<BookOpen size={18} />
<h2>Cơ Sở Lý Thuyết SGK</h2></div>
<p className="text-sm text-gray-300 leading-relaxed">Quan sát hệ nhiều con lắc chiều dài khác nhau treo trên cùng trục ngang khi con lắc dẫn dao động, minh họa hiện tượng cộng hưởng.</p>
<div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/30 font-mono text-sm text-cyan-300">f_ngoại_lực = f_0 ⇒ Biên độ A_max</div>
<div className="flex flex-wrap gap-2 pt-1">
{topics.map((t) => <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
{t}
</span>)}
</div></section></div>
<div className="lg:col-span-4">
<div className="glass rounded-2xl p-5 border border-white/10 space-y-5 sticky top-20">
<div className="flex items-center justify-between border-b border-white/10 pb-3">
<div className="flex items-center gap-2 font-bold text-base">
<Sliders size={17} className="text-purple-400" />
<span>Điều Khiển 3D</span></div>
<button onClick={() => { setP1(1.5);
 setP2(0.2);
 setPaused(false);
 }} className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 flex items-center gap-1">
<RotateCcw size={13} /> Reset</button></div>
<div className="space-y-2">
<div className="flex justify-between text-xs">
<span className="text-gray-300">Tần số ngoại lực f (Hz)</span>
<span className="font-mono font-bold text-sky-400">
{p1}
</span></div>
<input type="range" min={0.5} max={2.5} step={0.1} value={p1} onChange={(e) => setP1(Number(e.target.value))} className="w-full accent-purple-500" /></div>
<div className="space-y-2">
<div className="flex justify-between text-xs">
<span className="text-gray-300">Hệ số cản môi trường</span>
<span className="font-mono font-bold text-emerald-400">
{p2}
</span></div>
<input type="range" min={0.1} max={1} step={0.1} value={p2} onChange={(e) => setP2(Number(e.target.value))} className="w-full accent-emerald-500" /></div>
<button onClick={() => setPaused((v) => !v)} className="w-full py-2.5 rounded-xl font-semibold text-sm bg-linear-to-r from-blue-600 to-purple-600 text-white">
{paused ? "Tiếp tục" : "Tạm dừng"}
</button></div></div></div></main>);
 }