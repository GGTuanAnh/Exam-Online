import { Outlet, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';
import {
  Users,
  BookOpen,
  Database,
  HelpCircle,
  FileText,
  ClipboardList,
  Trophy,
  LogOut,
  User,
  LayoutDashboard
} from 'lucide-react';

const AdminLayout = () => {
  const user = authService.getCurrentUser();
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const navItems = [
    { path: '/admin/users', icon: Users, label: 'Người dùng' },
    { path: '/admin/courses', icon: BookOpen, label: 'Khóa học' },
    { path: '/admin/question-banks', icon: Database, label: 'Ngân hàng câu hỏi' },
    { path: '/admin/questions', icon: HelpCircle, label: 'Câu hỏi' },
    { path: '/admin/exams', icon: FileText, label: 'Đề thi' },
    { path: '/admin/exam-sessions', icon: ClipboardList, label: 'Ca thi' },
    { path: '/admin/exam-results', icon: Trophy, label: 'Kết quả' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md fixed top-0 left-0 right-0 z-50 h-16">
        <div className="flex h-full px-6 items-center justify-between">
          <div className="flex items-center space-x-3 w-64">
            <LayoutDashboard className="w-8 h-8 text-white" />
            <h1 className="text-xl font-bold">Admin Portal</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <User className="w-4 h-4 text-white/90" />
              <span className="font-medium">{user?.name || user?.email}</span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-white text-indigo-600 rounded-full">Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] fixed top-16 left-0 overflow-y-auto z-40">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group
                    ${isActive
                      ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 ml-64 bg-gray-50 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
