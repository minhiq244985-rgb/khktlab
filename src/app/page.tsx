"use client";

import { useState, useMemo, useEffect } from "react";
import { experiments, categories, gradeTabs, SubjectCategory } from "@/data/experiments";
import { Star, Moon, Sun, Search, X, ArrowRight, Download, Layers } from "lucide-react";

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("favorites") || "[]");
  } catch {
    return [];
  }
}

type GradeTabId = "all" | "10" | "11" | "12" | "other";
type SubjectFilterId = "all" | SubjectCategory;

function Navbar({
  theme,
  toggleTheme,
  activeGrade,
  activeSubject,
  onSelectGradeAndSubject,
}: {
  theme: string;
  toggleTheme: () => void;
  activeGrade: GradeTabId;
  activeSubject: SubjectFilterId;
  onSelectGradeAndSubject: (gradeId: GradeTabId, subjectId?: SubjectFilterId) => void;
}) {
  const openPwaModal = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-pwa-install-guide"));
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        <a
          href="/"
          className="text-lg font-bold bg-linear-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent shrink-0"
        >
          ScienceLab 3D
        </a>

        {/* Menu nhanh Lớp + Dropdown Môn học trên Desktop */}
        <div className="hidden md:flex items-center gap-1.5">
          {gradeTabs.map((tab) => {
            const isGradeActive = activeGrade === tab.id;
            return (
              <div key={tab.id} className="relative group">
                <a
                  href="#experiments"
                  onClick={() => onSelectGradeAndSubject(tab.id, "all")}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1.5 ${
                    isGradeActive
                      ? "bg-purple-600/30 text-[var(--text-primary)] border border-purple-400/50 font-semibold"
                      : "text-gray-400 hover:text-[var(--text-primary)] glass"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </a>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-0 top-full pt-1.5 w-48 z-50">
                  <div className="rounded-xl bg-slate-950/95 backdrop-blur-xl border border-white/15 shadow-2xl p-1.5 space-y-0.5">
                    <a
                      href="#experiments"
                      onClick={() => onSelectGradeAndSubject(tab.id, "all")}
                      className={`block px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        isGradeActive && activeSubject === "all"
                          ? "bg-purple-600/40 text-white font-semibold"
                          : "text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      📚 Tất cả môn ({tab.name})
                    </a>
                    {categories.map((cat) => (
                      <a
                        key={cat.id}
                        href="#experiments"
                        onClick={() => onSelectGradeAndSubject(tab.id, cat.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          isGradeActive && activeSubject === cat.id
                            ? "bg-blue-600/40 text-white font-semibold"
                            : "text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openPwaModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-linear-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-500 text-white border border-white/15 transition-all"
            title="Cài đặt ứng dụng cho Máy tính, iOS, Android"
          >
            <Download size={14} />
            <span>Cài App</span>
          </button>
          <button
            onClick={toggleTheme}
            className="p-2.5 glass rounded-full hover:scale-105 transition-transform"
            aria-label="Đổi giao diện sáng/tối"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default function Home() {
  const [activeGrade, setActiveGrade] = useState<GradeTabId>("all");
  const [activeSubject, setActiveSubject] = useState<SubjectFilterId>("all");
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

  const gradeCounts = useMemo(
    () => ({
      all: experiments.length,
      "10": experiments.filter((e) => e.grade === 10).length,
      "11": experiments.filter((e) => e.grade === 11).length,
      "12": experiments.filter((e) => e.grade === 12).length,
      other: experiments.filter((e) => !e.grade).length,
    }),
    []
  );

  const subjectCountsInActiveGrade = useMemo(() => {
    const inGrade = experiments.filter((e) =>
      activeGrade === "all" ? true : activeGrade === "other" ? e.grade === undefined : String(e.grade) === activeGrade
    );
    return {
      all: inGrade.length,
      physics: inGrade.filter((e) => e.category === "physics").length,
      chemistry: inGrade.filter((e) => e.category === "chemistry").length,
      biology: inGrade.filter((e) => e.category === "biology").length,
      mathematics: inGrade.filter((e) => e.category === "mathematics").length,
    };
  }, [activeGrade]);

  const filtered = useMemo(() => {
    return experiments.filter((exp) => {
      const matchSearch =
        search === "" ||
        exp.title.toLowerCase().includes(search.toLowerCase()) ||
        exp.description.toLowerCase().includes(search.toLowerCase()) ||
        exp.topics.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;
      if (showFavoritesOnly) return favorites.includes(exp.id);

      const matchGrade =
        activeGrade === "all" ? true : activeGrade === "other" ? exp.grade === undefined : String(exp.grade) === activeGrade;
      if (!matchGrade) return false;

      if (activeSubject !== "all" && exp.category !== activeSubject) {
        return false;
      }
      return true;
    });
  }, [activeGrade, activeSubject, search, showFavoritesOnly, favorites]);

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
  const activeSubjectInfo = categories.find((c) => c.id === activeSubject);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        activeGrade={activeGrade}
        activeSubject={activeSubject}
        onSelectGradeAndSubject={(g, s = "all") => {
          setActiveGrade(g);
          setActiveSubject(s);
          setShowFavoritesOnly(false);
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-[44vh] flex flex-col items-center justify-center text-center px-4 py-10">
        <h1 className="text-4xl md:text-6xl font-black mb-4 bg-linear-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          ScienceLab 3D
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto mb-7 text-base md:text-lg">
          Phòng thí nghiệm ảo 3D tương tác bám sát chương trình SGK <b>Lớp 10 – 11 – 12</b> đầy đủ 4 môn{" "}
          <span className="text-sky-400 font-semibold">Vật Lý</span>,{" "}
          <span className="text-pink-400 font-semibold">Hóa Học</span>,{" "}
          <span className="text-emerald-400 font-semibold">Sinh Học</span> &{" "}
          <span className="text-amber-400 font-semibold">Toán Học</span>.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="#experiments"
            className="px-7 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg shadow-blue-500/25 hover:scale-105 transition-transform"
          >
            Bắt Đầu Khám Phá
          </a>
          <button
            onClick={() => window.dispatchEvent(new Event("open-pwa-install-guide"))}
            className="px-6 py-3 glass border border-white/15 rounded-full font-semibold text-sm flex items-center gap-2 hover:border-purple-400/50 transition-all"
          >
            <Download size={16} className="text-purple-400" />
            <span>Cài Ứng Dụng (PC / iOS / Android)</span>
          </button>
        </div>
      </section>

      {/* Experiments Section */}
      <section id="experiments" className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          Chọn Lớp Học & Môn Học Theo SGK
        </h2>

        {/* Search */}
        <div className="max-w-md mx-auto mb-7 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm thí nghiệm, công thức, chủ đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 glass rounded-xl bg-transparent text-[var(--text-primary)] placeholder-gray-500 outline-none border border-white/10"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[var(--text-primary)]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* TẦNG 1: 4 Mục Chính Theo Lớp */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-5xl mx-auto mb-4">
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

        {/* TẦNG 2: Mục Nhỏ Chia Bên Dưới Các Lớp Theo Môn */}
        <div className="max-w-4xl mx-auto mb-6 p-3 rounded-2xl glass border border-white/10">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Layers size={13} className="text-purple-400" />
              Phân loại theo môn trong {activeTabInfo?.name}
            </span>
            <span className="text-[11px] text-gray-400">
              Đang lọc: <b className="text-purple-300">{activeTabInfo?.name}</b> •{" "}
              <b className="text-sky-300">
                {showFavoritesOnly
                  ? "Yêu thích"
                  : activeSubject === "all"
                  ? "Tất cả 4 môn"
                  : activeSubjectInfo?.name}
              </b>
            </span>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => {
                setActiveSubject("all");
                setShowFavoritesOnly(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 border ${
                activeSubject === "all" && !showFavoritesOnly
                  ? "bg-purple-600/35 text-[var(--text-primary)] border-purple-400 shadow-sm"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-[var(--text-primary)]"
              }`}
            >
              <span>📚 Tất cả môn</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                {subjectCountsInActiveGrade.all}
              </span>
            </button>

            {categories.map((cat) => {
              const isSubSelected = activeSubject === cat.id && !showFavoritesOnly;
              const count = subjectCountsInActiveGrade[cat.id];
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveSubject(cat.id);
                    setShowFavoritesOnly(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 border ${
                    isSubSelected
                      ? "bg-blue-600/35 text-[var(--text-primary)] border-blue-400 shadow-sm"
                      : "bg-white/5 border-white/10 text-gray-400 hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => setShowFavoritesOnly((prev) => !prev)}
              className={`ml-auto px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all border ${
                showFavoritesOnly
                  ? "bg-yellow-500/30 text-yellow-200 border-yellow-400"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-[var(--text-primary)]"
              }`}
            >
              ⭐ Yêu Thích ({favorites.length})
            </button>
          </div>
        </div>

        {/* Tiêu đề phân mục đang chọn */}
        {!showFavoritesOnly && activeTabInfo && (
          <div className="mt-4 mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">
                {activeTabInfo.icon} {activeTabInfo.name}
                {activeSubjectInfo ? ` — Môn ${activeSubjectInfo.name}` : ` — ${activeTabInfo.subtitle}`}
              </h3>
            </div>
            <span className="text-xs text-gray-400">Hiển thị {filtered.length} thí nghiệm</span>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 glass rounded-2xl mt-6">
            Không tìm thấy thí nghiệm phù hợp. Hãy thử chọn &quot;Tất cả môn&quot; hoặc chuyển mục lớp học.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-6">
            {filtered.map((exp) => {
              const fav = favorites.includes(exp.id);
              return (
                <div
                  key={exp.id}
                  className="glass rounded-2xl p-6 relative flex flex-col justify-between border border-white/5 hover:border-white/25 transition-all group"
                >
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
                    <a
                      href={`/experiments/${exp.id}`}
                      className="text-xs font-semibold text-blue-400 flex items-center gap-1 hover:text-blue-300"
                    >
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
