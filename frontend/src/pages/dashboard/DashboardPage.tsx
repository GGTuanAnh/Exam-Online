import React from 'react';
import { authService } from '../../services/auth.service';

const DashboardPage: React.FC = () => {
  const user = authService.getCurrentUser();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tổng quan</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Xin chào, {user?.name}!</h2>
        <p className="text-gray-600">
          Chào mừng bạn đến với hệ thống quản lý thi trực tuyến.
          Vui lòng chọn chức năng từ menu bên trái để bắt đầu làm việc.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-blue-700">Môn học</h3>
          <p className="text-sm text-blue-600 mt-1">Quản lý danh sách môn học và học phần</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <h3 className="font-semibold text-green-700">Ngân hàng câu hỏi</h3>
          <p className="text-sm text-green-600 mt-1">Xây dựng và quản lý câu hỏi thi</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
          <h3 className="font-semibold text-purple-700">Tổ chức thi</h3>
          <p className="text-sm text-purple-600 mt-1">Lên lịch và quản lý ca thi</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
