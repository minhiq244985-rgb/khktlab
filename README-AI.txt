CÀI TRỢ LÝ AI (làm ở thư mục gốc sciencelab3d)

1. Lấy khóa miễn phí: vào aistudio.google.com/apikey, đăng nhập Google, bấm Create API key, chép khóa.
2. Vercel -> project khktlab -> Settings -> Environment Variables:
     Name:  GEMINI_API_KEY   Value: (khóa vừa chép)   chọn cả Production
   (tùy chọn) GEMINI_MODEL = gemini-2.5-flash
3. Giải nén zip vào thư mục gốc. Các file: src\lib\aiContext.ts, src\components\AiAssistant.tsx, src\app\api\chat\route.ts
4. Mở src\app\layout.tsx, thêm:
     import AiAssistant from "@/components/AiAssistant";
   và đặt <AiAssistant /> ngay dưới {children} trong <body>.
5. npm run build, rồi: git add -A / git commit -m "add AI assistant" / git push
6. Vercel deploy xong thì BẤM Redeploy một lần nếu bạn thêm khóa sau khi deploy.
KHÔNG đặt khóa trong code hay file .env đẩy lên GitHub.

TÍNH NĂNG "AI TỰ XEM THÍ NGHIỆM"
Khi hỏi trong trang một thí nghiệm, web tự chụp khung 3D và đọc giá trị thanh trượt, ô nhập và chữ đang hiện rồi gửi kèm câu hỏi. Có ô tick để tắt.
Để chụp được khung WebGL, mã đã bật preserveDrawingBuffer cho mọi canvas WebGL (có thể làm hình chậm hơn một chút trên máy yếu).
