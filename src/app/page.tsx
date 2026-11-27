"use client";

import { useState, useMemo, useEffect } from "react";
import { experiments, categories } from "@/data/experiments";
import { AnimatePresence, motion } from "framer-motion";
import { Star, Moon, Sun, Mail, Globe, Search, X, ChevronDown, ArrowRight } from "lucide-react";

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("favorites") || "[]"); } catch { return []; }
}

function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

function Navbar({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="text-lg font-bold bg-linear-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          ScienceLab 3D
        </a>
        <div className="hidden md:flex gap-2">
          {categories.map((cat) => (
            <a key={cat.id} href="#experiments" className="px-3 py-1.5 rounded-full text-sm text-gray-400 hover:text-white glass transition-all">
              {cat.icon} {cat.name}
            </a>
          ))}
        </div>
        <button onClick={toggleTheme} className="p-2.5 glass rounded-full hover:scale-105 transition-transform">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle("light", savedTheme === "light");
      }
      setFavoritesCount(getFavorites().length);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
  };

  const filtered = useMemo(() => {
    let result = experiments.filter((exp) => {
      const matchCat = activeCategory === "all" || exp.category === activeCategory;
      const matchSearch =
        search === "" ||
        exp.title.toLowerCase().includes(search.toLowerCase()) ||
        exp.description.toLowerCase().includes(search.toLowerCase()) ||
        exp.difficulty.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
    if (showFavoritesOnly) {
      const favorites = getFavorites();
      result = result.filter((exp) => favorites.includes(exp.id));
    }
    return result;
  }, [activeCategory, search, showFavoritesOnly]);

  const handleToggleFavorite = (id: string) => {
    const favorites = getFavorites();
    if (favorites.includes(id)) {
      localStorage.setItem("favorites", JSON.stringify(favorites.filter((f) => f !== id)));
    } else {
      localStorage.setItem("favorites", JSON.stringify([...favorites, id]));
    }
    setFavoritesCount(getFavorites().length);
  };

  const categoryLabels: Record<string, string> = {
    physics: "Vật Lý",
    chemistry: "Hóa Học",
    biology: "Sinh Học",
    mathematics: "Toán Học",
  };

  return (
    <main className="min-h-screen bg-[#0a0b10] text-gray-100">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <h1 className="text-4xl md:text-6xl font-black mb-4 bg-linear-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          ScienceLab 3D
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto mb-8">
          Phòng thí nghiệm ảo 3D tương tác phục vụ học tập và nghiên cứu khoa học.
        </p>
        <a href="#experiments" className="px-8 py-3 bg-linear-to-r from-blue-600 to-purple-600 rounded-full font-semibold">
          Bắt Đầu Khám Phá
        </a>
      </section>

      {/* Experiments Section */}
      <section id="experiments" className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Khám Phá Thí Nghiệm</h2>
        
        {/* Search */}
        <div className="max-w-md mx-auto mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm thí nghiệm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 glass rounded-xl bg-transparent text-white placeholder-gray-500 outline-none border border-white/10"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-3 justify-center overflow-x-auto pb-4">
          <button
            onClick={() => { setActiveCategory("all"); setShowFavoritesOnly(false); }}
            className={`px-5 py-2.5 rounded-full font-medium transition-all ${
              activeCategory === "all" && !showFavoritesOnly ? "bg-purple-600/30 text-white border border-purple-500/50" : "glass text-gray-400"
            }`}
          >
            Tất Cả Thí Nghiệm
          </button>
          <button
            onClick={() => { setActiveCategory("all"); setShowFavoritesOnly((prev) => !prev); }}
            className={`px-5 py-2.5 rounded-full font-medium transition-all ${
              showFavoritesOnly ? "bg-yellow-600/30 text-white border border-yellow-500/50" : "glass text-gray-400"
            }`}
          >
            ⭐ Yêu Thích ({favoritesCount})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setShowFavoritesOnly(false); }}
              className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                activeCategory === cat.id && !showFavoritesOnly ? "bg-blue-600/30 text-white border border-blue-500/50" : "glass text-gray-400"
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
          {filtered.map((exp) => (
            <div key={exp.id} className="glass rounded-2xl p-6 relative flex flex-col justify-between border border-white/5 hover:border-white/20 transition-all">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl">{exp.icon}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-300">{exp.difficulty}</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{exp.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{exp.description}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-xs text-purple-400">{categoryLabels[exp.category]}</span>
                <a href={`/experiments/${exp.id}`} className="text-xs text-gray-300 flex items-center gap-1 hover:text-white">
                  Mở lab <ArrowRight size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 pt-8 pb-8 text-center text-gray-500 text-sm mt-20">
        <p className="text-gray-300 font-medium mb-1">
          Tạo bởi <span className="text-purple-400 font-semibold">Vũ Minh</span> — ScienceLab 3D © 2026
        </p>
        <p className="text-gray-600 text-xs">
          Phát triển và Việt hóa dựa trên mã nguồn mở <a href="https://github.com/rudra496/sciencelab3d" target="_blank" className="text-purple-400 hover:underline">rudra496/sciencelab3d</a> (MIT License).
        </p>
      </footer>
    </main>
  );
}