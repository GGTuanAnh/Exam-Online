import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Library, 
  Users, 
  BookOpen, 
  Database, 
  FileQuestion, 
  FileText, 
  Calendar, 
  Award, 
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { authService } from '../services/auth.service';
import { cn } from '../lib/utils';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/' },
    { icon: Users, label: 'Người dùng', path: '/users', adminOnly: true },
    { icon: BookOpen, label: 'Môn học', path: '/courses' },
    { icon: Database, label: 'Ngân hàng câu hỏi', path: '/question-banks' },
    { icon: FileQuestion, label: 'Câu hỏi', path: '/questions' },
    { icon: FileText, label: 'Đề thi', path: '/exams' },
    { icon: Calendar, label: 'Ca thi', path: '/exam-sessions' },
    { icon: Award, label: 'Kết quả', path: '/exam-results' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <Library className="w-8 h-8" />
            Exam System
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            if (item.adminOnly && user?.role !== 'ADMIN') return null;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-gray-700 hover:bg-gray-100"
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
