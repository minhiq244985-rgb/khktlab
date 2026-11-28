export type Subject = "Vật Lý" | "Hóa Học" | "Sinh Học" | "Toán Học";

export const EXPERIMENTS: Record<string, { title: string; subject: Subject }> = {
  "free-fall": {
    "title": "Đo Gia Tốc Rơi Tự Do (Vật Lý 10)",
    "subject": "Vật Lý"
  },
  "air-track-collision": {
    "title": "Bảo Toàn Động Lượng & Cơ Năng (Đệm Khí) (Vật Lý 10)",
    "subject": "Vật Lý"
  },
  "chem-10-structure-enthalpy-rate": {
    "title": "Cấu Tạo Nguyên Tử, Enthalpy (ΔH) & Tốc Độ Phản Ứng (Hóa Học 10)",
    "subject": "Hóa Học"
  },
  "bio-10-cell-transport-division": {
    "title": "Cấu Trúc Tế Bào, Vận Chuyển Qua Màng & Phân Bào (Sinh Học 10)",
    "subject": "Sinh Học"
  },
  "math-10-vectors-conics": {
    "title": "Vectơ, Hệ Thức Lượng & Ba Đường Conic 3D (undefined 10)",
    "subject": "Toán Học"
  },
  "pendulum": {
    "title": "Dao Động Điều Hòa: Con Lắc Đơn (Vật Lý 11)",
    "subject": "Vật Lý"
  },
  "spring-mass": {
    "title": "Dao Động Điều Hòa: Con Lắc Lò Xo & Cộng Hưởng (Vật Lý 11)",
    "subject": "Vật Lý"
  },
  "speed-of-sound": {
    "title": "Đo Tốc Độ Truyền Âm Trong Không Khí (Vật Lý 11)",
    "subject": "Vật Lý"
  },
  "emf-internal-resistance": {
    "title": "Đo Suất Điện Động (E) & Điện Trở Trong (r) (Sinh Học 11)",
    "subject": "Sinh Học"
  },
  "chem-11-equilibrium-titration": {
    "title": "Cân Bằng Hóa Học (Le Chatelier) & Chuẩn Độ Acid – Base (Hóa Học 11)",
    "subject": "Hóa Học"
  },
  "bio-11-metabolism-homeostasis": {
    "title": "Quang Hợp, Hô Hấp Tế Bào & Tuần Hoàn – Cảm Ứng (Sinh Học 11)",
    "subject": "Sinh Học"
  },
  "math-11-trig-sequence-space": {
    "title": "Lượng Giác, Cấp Số & Quan Hệ Vuông Góc Không Gian (undefined 11)",
    "subject": "Toán Học"
  },
  "calorimetry": {
    "title": "Đo Nhiệt Dung Riêng & Ẩn Nhiệt Chuyển Thể (Vật Lý 12)",
    "subject": "Vật Lý"
  },
  "gas-laws": {
    "title": "Khảo Sát Định Luật Boyle (Khí Lí Tưởng) (Vật Lý 12)",
    "subject": "Vật Lý"
  },
  "electromagnetic-induction": {
    "title": "Hiện Tượng Cảm Ứng Điện Từ (Vật Lý 12)",
    "subject": "Vật Lý"
  },
  "chem-12-electrochem-polymer": {
    "title": "Pin Điện Hóa (Galvani), Điện Phân & Ester – Kim Loại (Hóa Học 12)",
    "subject": "Hóa Học"
  },
  "bio-12-genetics-evolution-ecology": {
    "title": "Di Truyền Phân Tử (DNA – Operon Lac), Mendel & Sinh Thái (Sinh Học 12)",
    "subject": "Sinh Học"
  },
  "math-12-calculus-oxyz": {
    "title": "Khảo Sát Hàm Số, Tích Phân Tròn Xoay & Hình Học Oxyz (undefined 12)",
    "subject": "Toán Học"
  },
  "3d-geometry": {
    "title": "Hình Học Không Gian 3D (undefined)",
    "subject": "Toán Học"
  },
  "acid-base-reactions": {
    "title": "Phản Ứng Axit - Bazơ (Hóa Học 11)",
    "subject": "Hóa Học"
  },
  "atomic-structure": {
    "title": "Cấu Tạo Nguyên Tử & Quỹ Đạo Electron (Hóa Học 10)",
    "subject": "Hóa Học"
  },
  "calculus-visualizer": {
    "title": "Trực Quan Hóa Giải Tích (Đạo Hàm & Tích Phân) (undefined 12)",
    "subject": "Toán Học"
  },
  "cell-structure": {
    "title": "Cấu Trúc Tế Bào Nhân Thực 3D (Sinh Học 10)",
    "subject": "Sinh Học"
  },
  "cellular-respiration": {
    "title": "Hô Hấp Tế Bào (Sinh Học 10)",
    "subject": "Sinh Học"
  },
  "chemical-bonding": {
    "title": "Liên Kết Hóa Học 3D (Hóa Học 10)",
    "subject": "Hóa Học"
  },
  "complex-numbers": {
    "title": "Mặt Phẳng Số Phức 3D (undefined)",
    "subject": "Toán Học"
  },
  "crystal-lattice": {
    "title": "Mạng Tinh Thể Không Gian (Hóa Học 12)",
    "subject": "Hóa Học"
  },
  "diffusion": {
    "title": "Khuếch Tán & Thẩm Thấu (Sinh Học 10)",
    "subject": "Sinh Học"
  },
  "dna-replication": {
    "title": "Quá Trình Nhân Đôi DNA (Sinh Học 12)",
    "subject": "Sinh Học"
  },
  "doppler": {
    "title": "Hiệu Ứng Doppler (Vật Lý)",
    "subject": "Vật Lý"
  },
  "double-slit": {
    "title": "Thí Nghiệm Khe Y-âng (Vật Lý 11)",
    "subject": "Vật Lý"
  },
  "ecosystem": {
    "title": "Mô Phỏng Hệ Sinh Thái & Chuỗi Thức Ăn (Sinh Học 12)",
    "subject": "Sinh Học"
  },
  "electrolysis": {
    "title": "Điện Phân Dung Dịch (Hóa Học 12)",
    "subject": "Hóa Học"
  },
  "electromagnetic": {
    "title": "Điện Trường & Mặt Đẳng Thế 3D (Vật Lý 11)",
    "subject": "Vật Lý"
  },
  "fibonacci-spiral": {
    "title": "Dãy Số Fibonacci & Tỷ Lệ Vàng 3D (undefined 11)",
    "subject": "Toán Học"
  },
  "fourier-transform": {
    "title": "Biến Đổi Fourier Trực Quan (undefined)",
    "subject": "Toán Học"
  },
  "gravitational-orbits": {
    "title": "Quỹ Đạo Hành Tinh & Định Luật Kepler (Vật Lý 11)",
    "subject": "Vật Lý"
  },
  "immune-response": {
    "title": "Phản Ứng Miễn Dịch Động (Hóa Học 11)",
    "subject": "Hóa Học"
  },
  "linear-algebra": {
    "title": "Đại Số Tuyến Tính & Biến Đổi Ma Trận (undefined)",
    "subject": "Toán Học"
  },
  "mandelbrot": {
    "title": "Tập Hợp Mandelbrot & Hình Fractal 3D (undefined)",
    "subject": "Toán Học"
  },
  "mitosis-meiosis": {
    "title": "Phân Bào Nguyên Phân & Giảm Phân (Sinh Học 10)",
    "subject": "Sinh Học"
  },
  "natural-selection": {
    "title": "Chọn Lọc Tự Nhiên & Tiến Hóa (Sinh Học 12)",
    "subject": "Sinh Học"
  },
  "nervous-system": {
    "title": "Hệ Thần Kinh & Dẫn Truyền Xung Thần Kinh (Sinh Học 11)",
    "subject": "Sinh Học"
  },
  "ohms-law": {
    "title": "Định Luật Ohm & Mạch Điện Tải (Vật Lý 11)",
    "subject": "Vật Lý"
  },
  "periodic-trends": {
    "title": "Xu Hướng Trong Bảng Tuần Hoàn (Sinh Học 10)",
    "subject": "Sinh Học"
  },
  "photosynthesis": {
    "title": "Quang Hợp Thực Vật (Sinh Học 11)",
    "subject": "Sinh Học"
  },
  "probability-distributions": {
    "title": "Phân Phối Xác Suất & Thống Kê (undefined)",
    "subject": "Toán Học"
  },
  "projectile-motion": {
    "title": "Chuyển Động Ném Xiên (Vật Lý 10)",
    "subject": "Vật Lý"
  },
  "protein-synthesis": {
    "title": "Tổng Hợp Protein (Phiên Mã & Dịch Mã) (Sinh Học 12)",
    "subject": "Sinh Học"
  },
  "refraction": {
    "title": "Khúc Xạ Ánh Sáng & Định Luật Snell (Vật Lý)",
    "subject": "Vật Lý"
  },
  "thermochemistry": {
    "title": "Nhiệt Hóa Học & Phản Ứng Thu/Tỏa Nhiệt (Hóa Học 10)",
    "subject": "Hóa Học"
  },
  "titration": {
    "title": "Chuẩn Độ Axit - Bazơ (Hóa Học 11)",
    "subject": "Hóa Học"
  },
  "topology-surfaces": {
    "title": "Tô-pô Học & Các Mặt Không Định Hướng (undefined)",
    "subject": "Toán Học"
  },
  "trigonometry": {
    "title": "Lượng Giác & Đường Tròn Đơn Vị (undefined 11)",
    "subject": "Toán Học"
  },
  "wave-interference": {
    "title": "Giao Thoa Sóng Mặt Nước (Vật Lý 11)",
    "subject": "Vật Lý"
  },
  "phys-10-force-composition": {
    "title": "Kéo Vòng Nhẫn Bằng 3 Lực Kế Không Gian (Vật Lý 10)",
    "subject": "Vật Lý"
  },
  "phys-10-inclined-newton": {
    "title": "Xe Lăn Trượt Trên Mặt Phẳng Nghiêng & Đệm Khí (Vật Lý 10)",
    "subject": "Vật Lý"
  },
  "phys-10-torque-lever": {
    "title": "Đòn Bẩy & Đĩa Quay 3D (Moment Lực) (Vật Lý 10)",
    "subject": "Vật Lý"
  },
  "phys-10-conical-pendulum": {
    "title": "Con Lắc Nón & Vật Quay Trên Bàn Xoay 3D (Vật Lý 10)",
    "subject": "Vật Lý"
  },
  "chem-10-vsepr-hydrogen": {
    "title": "Hình Học Phân Tử VSEPR (H2O, NH3, CH4, CO2) & Liên Kết Hydrogen (Hóa Học 10)",
    "subject": "Hóa Học"
  },
  "bio-10-biomolecules": {
    "title": "Chuỗi Xoắn Kép DNA & Cấu Trúc Bậc 1-4 Của Protein (Sinh Học 10)",
    "subject": "Sinh Học"
  },
  "bio-10-enzyme-substrate": {
    "title": "Tương Tác Enzyme - Cơ Chất & Ức Chế Cạnh Tranh (Sinh Học 10)",
    "subject": "Sinh Học"
  },
  "phys-11-barton-resonance": {
    "title": "Hệ Con Lắc Barton & Cộng Hưởng Cơ Học (Vật Lý 11)",
    "subject": "Vật Lý"
  },
  "chem-11-nitrogen-geometry": {
    "title": "Cấu Tạo Phân Tử NH3 (Chóp Tam Giác) & Ion NH4+ (Tứ Diện) (Hóa Học 11)",
    "subject": "Hóa Học"
  },
  "chem-11-cis-trans-isomers": {
    "title": "Liên Kết Đơn, Liên Kết Bội & Đồng Phân Hình Học Cis - Trans (Hóa Học 11)",
    "subject": "Hóa Học"
  },
  "chem-11-alkene-addition-polymer": {
    "title": "Phản Ứng Cộng Br2 Vào Ethylene & Trùng Hợp Polymer (Hóa Học 11)",
    "subject": "Hóa Học"
  },
  "bio-11-xylem-stomata": {
    "title": "Dòng Mạch Gỗ Xylem & Đóng Mở Tế Bào Khí Khổng (Sinh Học 11)",
    "subject": "Sinh Học"
  },
  "bio-11-heart-circulation": {
    "title": "Mô Hình Tim 3D, Chu Kỳ Tim & Hệ Tuần Hoàn (Sinh Học 11)",
    "subject": "Sinh Học"
  },
  "phys-12-phase-transition": {
    "title": "Chuyển Thể Rắn - Lỏng - Khí & Thuyết Động Học Phân Tử (Vật Lý 12)",
    "subject": "Vật Lý"
  },
  "phys-12-magnetic-force": {
    "title": "Lực Từ Tác Dụng Lên Khung Dây & Quy Tắc Bàn Tay Trái (Vật Lý 12)",
    "subject": "Vật Lý"
  },
  "phys-12-electromagnetic-wave": {
    "title": "Sóng Điện Từ 3D (Hai Vectơ E và B Vuông Góc) (Vật Lý 12)",
    "subject": "Vật Lý"
  },
  "phys-12-nuclear-rutherford": {
    "title": "Tán Xạ Hạt Alpha Rutherford & Phóng Xạ Hạt Nhân (Vật Lý 12)",
    "subject": "Vật Lý"
  },
  "chem-12-soap-micelle": {
    "title": "Xà Phòng Hóa Chất Béo & Hạt Cầu Micelle Giặt Rửa (Hóa Học 12)",
    "subject": "Hóa Học"
  },
  "chem-12-carbohydrate-structure": {
    "title": "Cấu Trúc Không Gian Glucose & Chuỗi Xoắn Tinh Bột (Hóa Học 12)",
    "subject": "Hóa Học"
  },
  "chem-12-transition-complex": {
    "title": "Hình Học Phức Chất Kim Loại Chuyển Tiếp (Hóa Học 12)",
    "subject": "Hóa Học"
  },
  "bio-12-operon-lac": {
    "title": "Điều Hòa Biểu Hiện Gen Theo Mô Hình Operon Lac (Sinh Học 12)",
    "subject": "Sinh Học"
  },
  "bio-12-chromosome-mutation": {
    "title": "Đột Biến Cấu Trúc & Số Lượng Nhiễm Sắc Thể 3D (Sinh Học 12)",
    "subject": "Sinh Học"
  }
};

export function slugFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/experiments\/([^/]+)/);
  return m && EXPERIMENTS[m[1]] ? m[1] : null;
}
