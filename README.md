# 🎓 Exam Online System

Hệ thống thi trắc nghiệm trực tuyến hiện đại, hỗ trợ quản lý khóa học, ngân hàng câu hỏi, tổ chức thi và chấm điểm tự động. Dự án được xây dựng với kiến trúc Microservices (Frontend/Backend tách biệt) và container hóa với Docker.

## 🚀 Tính năng chính

### 👤 Người dùng (Sinh viên)
*   **Đăng ký/Đăng nhập**: Hỗ trợ đăng nhập qua Email/Password và Google OAuth.
*   **Quản lý tài khoản**: Cập nhật thông tin cá nhân, đổi mật khẩu.
*   **Tham gia thi**: Làm bài thi trắc nghiệm với giao diện trực quan.
*   **Anti-Cheat**: Cơ chế chống gian lận cơ bản trong quá trình làm bài.
*   **Xem kết quả**: Xem điểm số chi tiết và lịch sử thi ngay sau khi nộp bài.
*   **Dashboard**: Thống kê các kỳ thi đã tham gia và kết quả.

### 🛡️ Quản trị viên (Admin/Giáo viên)
*   **Quản lý Khóa học**: Tạo, sửa, xóa các khóa học.
*   **Ngân hàng câu hỏi**: Quản lý kho câu hỏi phong phú, hỗ trợ import từ file.
*   **Tổ chức thi**: Tạo đề thi, cấu hình thời gian, số lượng câu hỏi, trộn đề.
*   **Quản lý người dùng**: Phân quyền, quản lý danh sách sinh viên.
*   **Báo cáo & Thống kê**: Xem phổ điểm, xuất báo cáo kết quả thi.

## 🛠️ Công nghệ sử dụng

### Backend
*   **Framework**: [NestJS](https://nestjs.com/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/)
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **Authentication**: Passport, JWT, Google OAuth2
*   **API Documentation**: Swagger UI

### Frontend
*   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Components**: [Shadcn/UI](https://ui.shadcn.com/) + Headless UI
*   **State Management**: React Query (TanStack Query)
*   **Integrations**: Axios, React Hook Form

### DevOps & Infrastructure
*   **Containerization**: Docker & Docker Compose
*   **Web Server**: Nginx
*   **CI/CD**: (Đang cập nhật)

## 📸 Trang web : https://exam-online-frontend.onrender.com/


## ⚙️ Cài đặt và Chạy dự án

### Yêu cầu tiên quyết
*   [Node.js](https://nodejs.org/) (v20+)
*   [PostgreSQL](https://www.postgresql.org/) (nếu chạy local)
*   [Docker Desktop](https://www.docker.com/) (khuyên dùng)

### Cách 1: Chạy bằng Docker (Khuyên dùng)

1.  **Clone dự án**
    ```bash
    git clone https://github.com/GGTuanAnh/Exam-Online.git
    cd Exam-Online
    ```


## 📂 Cấu trúc dự án

```
Exam-Online/
├── backend/                # Source code Backend (NestJS module structure)
│   ├── src/
│   │   ├── auth/           # Module xác thực
│   │   ├── exams/          # Module quản lý thi
│   │   ├── questions/      # Module câu hỏi
│   │   ├── users/          # Module người dùng
│   │   └── ...
├── frontend/               # Source code Frontend (React)
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── pages/          # Các trang màn hình
│   │   ├── services/       # API call services
│   │   └── ...
├── prisma/                 # Schema Database & Migrations
├── scripts/                # Scripts tiện ích (Seed data, Admin setup...)
├── docker-compose.yml      # Cấu hình Docker
└── nginx.conf              # Cấu hình Web Server
```




