export type GradeLevel = 10 | 11 | 12;
export type SubjectCategory = "physics" | "chemistry" | "biology" | "mathematics";

export interface Experiment {
  id: string;
  title: string;
  description: string;
  category: SubjectCategory;
  difficulty: "Cơ bản" | "Trung bình" | "Nâng cao";
  icon: string;
  color: string;
  topics: string[];
  grade?: GradeLevel; // 10, 11, 12 thuộc chương trình SGK; undefined thuộc mục Khác
}

export const gradeTabs = [
  { id: "all", name: "Tất cả", subtitle: "Toàn bộ thí nghiệm 3D", icon: "📚", color: "#6366F1" },
  { id: "10", name: "Lớp 10", subtitle: "Nền tảng tự nhiên & Toán 10", icon: "🔟", color: "#38BDF8" },
  { id: "11", name: "Lớp 11", subtitle: "Chuyển hóa, Dao động & Giải tích 11", icon: "1️⃣1️⃣", color: "#A855F7" },
  { id: "12", name: "Lớp 12", subtitle: "Chuyên sâu SGK & Ôn thi THPT", icon: "1️⃣2️⃣", color: "#10B981" },
  { id: "other", name: "Khác", subtitle: "Kiến thức mở rộng & liên môn", icon: "🔬", color: "#F59E0B" },
] as const;

export const categories: { id: SubjectCategory; name: string; icon: string; color: string }[] = [
  { id: "physics", name: "Vật Lý", icon: "⚡", color: "#60A5FA" },
  { id: "chemistry", name: "Hóa Học", icon: "🧪", color: "#F472B6" },
  { id: "biology", name: "Sinh Học", icon: "🧬", color: "#34D399" },
  { id: "mathematics", name: "Toán Học", icon: "📐", color: "#FBBF24" },
];

export const experiments: Experiment[] = [
];
