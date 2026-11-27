export type Subject = "Vật Lý" | "Hóa Học" | "Sinh Học" | "Toán Học";

export const EXPERIMENTS: Record<string, { title: string; subject: Subject }> = {
  // SGK Lớp 10
  "free-fall": { title: "Đo gia tốc rơi tự do (Vật lí 10)", subject: "Vật Lý" },
  "air-track-collision": { title: "Bảo toàn động lượng & cơ năng trên đệm khí (Vật lí 10)", subject: "Vật Lý" },
  "chem-10-structure-enthalpy-rate": { title: "Cấu tạo nguyên tử, biến thiên Enthalpy ΔH & Tốc độ phản ứng (Hóa học 10)", subject: "Hóa Học" },
  "bio-10-cell-transport-division": { title: "Cấu trúc tế bào, vận chuyển qua màng & phân bào (Sinh học 10)", subject: "Sinh Học" },
  "math-10-vectors-conics": { title: "Vectơ, hệ thức lượng & ba đường Conic 3D (Toán 10)", subject: "Toán Học" },

  // SGK Lớp 11
  "pendulum": { title: "Con lắc đơn (Vật lí 11)", subject: "Vật Lý" },
  "spring-mass": { title: "Con lắc lò xo & Cộng hưởng (Vật lí 11)", subject: "Vật Lý" },
  "speed-of-sound": { title: "Đo tốc độ truyền âm trong không khí (Vật lí 11)", subject: "Vật Lý" },
  "emf-internal-resistance": { title: "Đo suất điện động E và điện trở trong r (Vật lí 11)", subject: "Vật Lý" },
  "chem-11-equilibrium-titration": { title: "Cân bằng hóa học Le Chatelier & Chuẩn độ Acid – Base (Hóa học 11)", subject: "Hóa Học" },
  "bio-11-metabolism-homeostasis": { title: "Quang hợp, hô hấp tế bào & tuần hoàn – cảm ứng (Sinh học 11)", subject: "Sinh Học" },
  "math-11-trig-sequence-space": { title: "Lượng giác, cấp số & quan hệ vuông góc không gian (Toán 11)", subject: "Toán Học" },

  // SGK Lớp 12
  "calorimetry": { title: "Đo nhiệt dung riêng & ẩn nhiệt chuyển thể (Vật lí 12)", subject: "Vật Lý" },
  "gas-laws": { title: "Định luật Boyle & Chất khí (Vật lí 12)", subject: "Vật Lý" },
  "electromagnetic-induction": { title: "Hiện tượng cảm ứng điện từ (Vật lí 12)", subject: "Vật Lý" },
  "chem-12-electrochem-polymer": { title: "Pin điện hóa Galvani, điện phân & Ester – Kim loại (Hóa học 12)", subject: "Hóa Học" },
  "bio-12-genetics-evolution-ecology": { title: "Di truyền phân tử DNA – Operon Lac, Mendel & Sinh thái (Sinh học 12)", subject: "Sinh Học" },
  "math-12-calculus-oxyz": { title: "Khảo sát hàm số, tích phân tròn xoay & hình học Oxyz (Toán 12)", subject: "Toán Học" },

  // Mở rộng
  "3d-geometry": { title: "Hình học không gian 3D", subject: "Toán Học" },
  "acid-base-reactions": { title: "Phản ứng axit – bazơ", subject: "Hóa Học" },
  "atomic-structure": { title: "Cấu trúc nguyên tử", subject: "Hóa Học" },
  "calculus-visualizer": { title: "Trực quan hóa giải tích", subject: "Toán Học" },
  "cell-structure": { title: "Cấu trúc tế bào", subject: "Sinh Học" },
  "cellular-respiration": { title: "Hô hấp tế bào", subject: "Sinh Học" },
  "chemical-bonding": { title: "Liên kết hóa học", subject: "Hóa Học" },
  "complex-numbers": { title: "Số phức", subject: "Toán Học" },
  "crystal-lattice": { title: "Mạng tinh thể", subject: "Hóa Học" },
  diffusion: { title: "Sự khuếch tán", subject: "Vật Lý" },
  "dna-replication": { title: "Nhân đôi DNA", subject: "Sinh Học" },
  doppler: { title: "Hiệu ứng Doppler", subject: "Vật Lý" },
  "double-slit": { title: "Thí nghiệm khe Young (hai khe)", subject: "Vật Lý" },
  ecosystem: { title: "Hệ sinh thái", subject: "Sinh Học" },
  electrolysis: { title: "Điện phân", subject: "Hóa Học" },
  electromagnetic: { title: "Điện trường & Mặt đẳng thế", subject: "Vật Lý" },
  "fibonacci-spiral": { title: "Xoắn ốc Fibonacci", subject: "Toán Học" },
  "fourier-transform": { title: "Biến đổi Fourier", subject: "Toán Học" },
  "gravitational-orbits": { title: "Quỹ đạo hấp dẫn", subject: "Vật Lý" },
  "immune-response": { title: "Đáp ứng miễn dịch", subject: "Sinh Học" },
  "linear-algebra": { title: "Đại số tuyến tính", subject: "Toán Học" },
  mandelbrot: { title: "Tập Mandelbrot", subject: "Toán Học" },
  "mitosis-meiosis": { title: "Nguyên phân và giảm phân", subject: "Sinh Học" },
  "natural-selection": { title: "Chọn lọc tự nhiên", subject: "Sinh Học" },
  "nervous-system": { title: "Hệ thần kinh", subject: "Sinh Học" },
  "ohms-law": { title: "Định luật Ohm", subject: "Vật Lý" },
  "periodic-trends": { title: "Xu hướng bảng tuần hoàn", subject: "Hóa Học" },
  photosynthesis: { title: "Quang hợp", subject: "Sinh Học" },
  "probability-distributions": { title: "Phân phối xác suất", subject: "Toán Học" },
  "projectile-motion": { title: "Chuyển động ném xiên", subject: "Vật Lý" },
  "protein-synthesis": { title: "Tổng hợp protein", subject: "Sinh Học" },
  refraction: { title: "Khúc xạ ánh sáng", subject: "Vật Lý" },
  thermochemistry: { title: "Nhiệt hóa học", subject: "Hóa Học" },
  titration: { title: "Chuẩn độ", subject: "Hóa Học" },
  "topology-surfaces": { title: "Mặt tô-pô", subject: "Toán Học" },
  trigonometry: { title: "Lượng giác", subject: "Toán Học" },
  "wave-interference": { title: "Giao thoa sóng", subject: "Vật Lý" },
};

export function slugFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/experiments\/([^/]+)/);
  return m && EXPERIMENTS[m[1]] ? m[1] : null;
}
