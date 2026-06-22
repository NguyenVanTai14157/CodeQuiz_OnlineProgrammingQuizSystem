# 🎓 CodeQuiz - Online Programming Quiz System

CodeQuiz là một nền tảng thi trắc nghiệm lập trình trực tuyến mạnh mẽ, được thiết kế để giúp người dùng ôn tập và kiểm tra kiến thức về nhiều ngôn ngữ lập trình khác nhau như Java, Python, SQL, JavaScript, và nhiều hơn nữa.

![CodeQuiz Banner](https://images.unsplash.com/photo-1434031216660-c54565b3bb71?q=80&w=2070&auto=format&fit=crop)

## 🚀 Tính năng nổi bật

### Đối với Người dùng (User)
- **Đăng ký/Đăng nhập**: Hệ thống xác thực bảo mật với JWT.
- **Duyệt khóa học/Môn học**: Danh sách các chủ đề lập trình phong phú.
- **Làm bài thi**: Giao diện thi trắc nghiệm trực quan, có đếm ngược thời gian.
- **Xem kết quả**: Xem lại điểm số và đáp án sau khi hoàn thành.
- **Trang cá nhân**: Quản lý thông tin và lịch sử thi.

### Đối với Quản trị viên (Admin)
- **Dashboard**: Thống kê tổng quan về hệ thống.
- **Quản lý người dùng**: Thêm, sửa, xóa và phân quyền người dùng.
- **Quản lý môn học (Subjects)**: Tùy chỉnh các danh mục môn học.
- **Quản lý câu hỏi (Questions)**: Ngân hàng câu hỏi đa dạng với các mức độ khó khác nhau.
- **Quản lý đề thi (Exams)**: Tạo và cấu trúc các đề thi từ ngân hàng câu hỏi.

## 🛠️ Công nghệ sử dụng

### Frontend
- **Framework**: [Angular 19+](https://angular.io/) (Zoneless architecture).
- **Styling**: Vanilla CSS (Modern design patterns, Glassmorphism).
- **State Management**: RxJS.
- **Build Tool**: Angular CLI.

### Backend
- **Framework**: [Spring Boot 3.4.1](https://spring.io/projects/spring-boot).
- **Language**: Java 21.
- **Security**: Spring Security + JSON Web Token (JWT).
- **Database Access**: Spring Data JPA.
- **Persistence**: PostgreSQL (Neon Tech).
- **Utilities**: Lombok, Validation API.

## 🏗️ Cấu trúc dự án

```text
CodeQuiz_OnlineProgrammingQuizSystem/
├── backend/                # Source code Java Spring Boot
│   ├── src/main/java       # Backend logic
│   ├── src/main/resources  # Cấu hình application.properties
│   └── Dockerfile          # Cấu hình Docker cho backend
├── frontend/               # Source code Angular
│   ├── src/app             # Components, Services, Models
│   ├── src/assets          # Hình ảnh, icons
│   └── vercel.json         # Cấu hình deploy Vercel
└── README.md
```

## ⚙️ Cài đặt và Chạy thử

### 1. Prerequisites
- Java 21 SDK
- Node.js (v20+) & npm
- PostgreSQL (Local hoặc Cloud như Neon.tech)

### 2. Backend Setup
```bash
cd backend
# Cấu hình database trong src/main/resources/application.properties
./gradlew bootRun
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Truy cập: `http://localhost:4200`

## 🌐 Triển khai (Deployment)

Dự án hiện đang được cấu hình để triển khai trên:
- **Frontend**: [Vercel](https://vercel.com/)
- **Backend**: [Render](https://render.com/)
- **Database**: [Neon.tech](https://neon.tech/)

## 📝 Biến môi trường (Environment Variables)

Cần cấu hình các biến môi trường sau để ứng dụng hoạt động ổn định:
- `SPRING_DATASOURCE_URL`: URL kết nối database.
- `SPRING_DATASOURCE_USERNAME`: Username database.
- `SPRING_DATASOURCE_PASSWORD`: Password database.
- `JWT_SECRET`: Khóa bí mật cho JWT (Sử dụng chuỗi ngẫu nhiên dài).

---

👨‍💻 Author

Nguyen Van Tai
GitHub:
https://github.com/NguyenVanTai14157

