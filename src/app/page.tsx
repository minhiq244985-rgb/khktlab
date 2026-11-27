"use client";

import { useState, useMemo, useEffect } from "react";
import { experiments, categories, gradeTabs } from "@/data/experiments";
import { Star, Moon, Sun, Search, X, ArrowRight } from "lucide-react";

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("favorites") || "[]"); } catch { return []; }
}

function Navbar({
  theme,
  toggleTheme,
  onSelectGrade,
}: {
  theme: string;
  toggleTheme: () => void;
  onSelectGrade: (gradeId: "10" | "11" | "12" | "other") => void;
}) {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="text-lg font-bold bg-linear-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          ScienceLab 3D
        </a>
        <div className="hidden md:flex gap-2">
          {gradeTabs.map((tab) => (
            <a
              key={tab.id}
              href="#experiments"
              onClick={() => onSelectGrade(tab.id)}
              className="px-3 py-1.5 rounded-full text-sm text-gray-400 hover:text-[var(--text-primary)] glass transition-all"
            >
              {tab.icon} {tab.name}
            </a>
          ))}
        </div>
        <button onClick={toggleTheme} className="p-2.5 glass rounded-full hover:scale-105 transition-transform" aria-label="Đổi giao diện sáng/tối">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  );
}

export default function Home() {
  const [activeGrade, setActiveGrade] = useState<"10" | "11" | "12" | "other">("10");
  const [activeOtherCategory, setActiveOtherCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle("light", savedTheme === "light");
      }
      setFavorites(getFavorites());
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
  };

  const gradeCounts = useMemo(() => ({
    "10": experiments.filter((e) => e.grade === 10).length,
    "11": experiments.filter((e) => e.grade === 11).length,
    "12": experiments.filter((e) => e.grade === 12).length,
    "other": experiments.filter((e) => !e.grade).length,
  }), []);

  const filtered = useMemo(() => {
    let result = experiments.filter((exp) => {
      const matchSearch =
        search === "" ||
        exp.title.toLowerCase().includes(search.toLowerCase()) ||
        exp.description.toLowerCase().includes(search.toLowerCase()) ||
        exp.topics.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;
      if (showFavoritesOnly) return favorites.includes(exp.id);

      if (activeGrade === "other") {
        if (exp.grade !== undefined) return false;
        return activeOtherCategory === "all" || exp.category === activeOtherCategory;
      }
      return String(exp.grade) === activeGrade;
    });

    return result;
  }, [activeGrade, activeOtherCategory, search, showFavoritesOnly, favorites]);

  const handleToggleFavorite = (id: string) => {
    const current = getFavorites();
    const updated = current.includes(id)
      ? current.filter((f) => f !== id)
      : [...current, id];
    localStorage.setItem("favorites", JSON.stringify(updated));
    setFavorites(updated);
  };

  const categoryLabels: Record<string, string> = {
    physics: "Vật Lý",
    chemistry: "Hóa Học",
    biology: "Sinh Học",
    mathematics: "Toán Học",
  };

  const activeTabInfo = gradeTabs.find((t) => t.id === activeGrade);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        onSelectGrade={(g) => {
          setActiveGrade(g);
          setShowFavoritesOnly(false);
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-[48vh] flex flex-col items-center justify-center text-center px-4 py-12">
        <h1 className="text-4xl md:text-6xl font-black mb-4 bg-linear-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          ScienceLab 3D
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg">
          Phòng thí nghiệm ảo 3D tương tác bám sát chương trình SGK Vật lí 10 – 11 – 12 và mở rộng khoa học liên môn.
        </p>
        <a href="#experiments" className="px-8 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg shadow-blue-500/25 hover:scale-105 transition-transform">
          Bắt Đầu Khám Phá
        </a>
      </section>

      {/* Experiments Section */}
      <section id="experiments" className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-6 text-center">Chọn Thí Nghiệm Theo Chương Trình</h2>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm thí nghiệm, công thức, chủ đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 glass rounded-xl bg-transparent text-[var(--text-primary)] placeholder-gray-500 outline-none border border-white/10"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[var(--text-primary)]">
              <X size={16} />
            </button>
          )}
        </div>

        {/* 4 Mục Chính: Lớp 10, Lớp 11, Lớp 12, Khác (+ Yêu thích) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mb-6">
          {gradeTabs.map((tab) => {
            const isSelected = activeGrade === tab.id && !showFavoritesOnly;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveGrade(tab.id);
                  setShowFavoritesOnly(false);
                }}
                className={`p-4 rounded-2xl text-left transition-all border ${
                  isSelected
                    ? "bg-purple-600/25 border-purple-400 shadow-lg shadow-purple-500/15 scale-[1.02]"
                    : "glass border-white/10 hover:border-white/25 text-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{tab.icon}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 font-mono">
                    {gradeCounts[tab.id]} bài
                  </span>
                </div>
                <div className="font-bold text-base text-[var(--text-primary)]">{tab.name}</div>
                <div className="text-xs text-gray-400 line-clamp-1">{tab.subtitle}</div>
              </button>
            );
          })}
        </div>

        {/* Bộ lọc phụ cho mục "Khác" & nút Yêu thích */}
        <div className="flex flex-wrap gap-2 justify-center items-center pb-4">
          <button
            onClick={() => setShowFavoritesOnly((prev) => !prev)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              showFavoritesOnly
                ? "bg-yellow-500/30 text-yellow-200 border border-yellow-400"
                : "glass text-gray-400 hover:text-[var(--text-primary)]"
            }`}
          >
            ⭐ Yêu Thích ({favorites.length})
          </button>

          {activeGrade === "other" && !showFavoritesOnly && (
            <>
              <span className="text-gray-600 mx-1">|</span>
              <button
                onClick={() => setActiveOtherCategory("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeOtherCategory === "all"
                    ? "bg-amber-500/30 text-[var(--text-primary)] border border-amber-400"
                    : "glass text-gray-400"
                }`}
              >
                Tất cả môn mở rộng
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveOtherCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeOtherCategory === cat.id
                      ? "bg-blue-600/30 text-[var(--text-primary)] border border-blue-400"
                      : "glass text-gray-400"
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Tiêu đề phân mục đang chọn */}
        {!showFavoritesOnly && activeTabInfo && (
          <div className="mt-4 mb-2 flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                {activeTabInfo.icon} {activeTabInfo.name} — {activeTabInfo.subtitle}
              </h3>
            </div>
            <span className="text-xs text-gray-400">Hiển thị {filtered.length} thí nghiệm</span>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 glass rounded-2xl mt-6">
            Không tìm thấy thí nghiệm phù hợp. Hãy thử từ khóa khác hoặc chuyển mục lớp học.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-6">
            {filtered.map((exp) => {
              const fav = favorites.includes(exp.id);
              return (
                <div key={exp.id} className="glass rounded-2xl p-6 relative flex flex-col justify-between border border-white/5 hover:border-white/25 transition-all group">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-3xl">{exp.icon}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {exp.grade ? `Lớp ${exp.grade}` : "Khác"}
                        </span>
                        <button
                          onClick={() => handleToggleFavorite(exp.id)}
                          className="p-1 rounded-full hover:bg-white/10 transition-colors"
                          title={fav ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                        >
                          <Star
                            size={15}
                            className={fav ? "fill-yellow-400 text-yellow-400" : "text-gray-500"}
                          />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-[var(--text-primary)] group-hover:text-blue-400 transition-colors">
                      {exp.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">{exp.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {exp.topics.map((topic) => (
                        <span key={topic} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-300">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-xs text-purple-400">
                      {categoryLabels[exp.category]} • {exp.difficulty}
                    </span>
                    <a href={`/experiments/${exp.id}`} className="text-xs font-semibold text-blue-400 flex items-center gap-1 hover:text-blue-300">
                      Mở lab <ArrowRight size={13} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 pt-8 pb-8 text-center text-gray-500 text-sm mt-20">
        <p className="text-gray-300 font-medium">
          Tạo bởi <span className="text-purple-400 font-semibold">Vũ Minh</span> — ScienceLab 3D © 2026
        </p>
      </footer>
    </main>
  );
}
