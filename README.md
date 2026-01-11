# 🎓 Exam Online System

Hệ thống thi trắc nghiệm trực tuyến hiện đại, hỗ trợ quản lý khóa học, ngân hàng câu hỏi, tổ chức thi và chấm điểm tự động. Dự án được xây dựng với kiến trúc Microservices (Frontend/Backend tách biệt) và container hóa với Docker.

![Project Banner](<!-- Link ảnh banner dự án -->)

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

## 📸 Hình ảnh demo

| Dashboard | Giao diện thi |
|:---:|:---:|
| ![Dashboard](<!-- Link ảnh Dashboard -->) | ![Exam Interface](<!-- Link ảnh Giao diện thi -->) |

| Quản lý câu hỏi | Kết quả thi |
|:---:|:---:|
| ![Question Bank](<!-- Link ảnh Quản lý câu hỏi -->) | ![Results](<!-- Link ảnh Kết quả thi -->) |

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

2.  **Cấu hình môi trường**
    *   Copy file `.env.example` thành `.env` ở root folder.
    *   Cập nhật các thông số Database, Google Auth, JWT Secret trong file `.env`.

3.  **Khởi chạy Docker Compose**
    ```bash
    docker-compose up -d --build
    ```
    *   Backend sẽ chạy tại: `http://localhost:3000`
    *   Frontend sẽ chạy tại: `http://localhost:80` (hoặc port cấu hình trong nginx)
    *   API Docs: `http://localhost:3000/api-docs`

### Cách 2: Chạy Local (Thủ công)

#### Backend
1.  Di chuyển vào thư mục root:
    ```bash
    npm install
    ```
2.  Cấu hình Database trong `.env` và chạy migration:
    ```bash
    npx prisma migrate dev
    ```
3.  Seed dữ liệu mẫu (nếu có):
    ```bash
    npm run seed
    ```
4.  Khởi động server:
    ```bash
    npm run start:dev
    ```

#### Frontend
1.  Di chuyển vào thư mục frontend:
    ```bash
    cd frontend
    npm install
    ```
2.  Khởi động development server:
    ```bash
    npm run dev
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



