import { Outlet, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';
import {
  Users, BookOpen, Database, HelpCircle, FileText,
  ClipboardList, Trophy, LogOut, User, LayoutDashboard,
  ChevronRight, GraduationCap
} from 'lucide-react';

const AdminLayout = () => {
  const user = authService.getCurrentUser();
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const navItems = [
    { path: '/admin/users', icon: Users, label: 'Người dùng', color: 'text-blue-500' },
    { path: '/admin/courses', icon: BookOpen, label: 'Khóa học', color: 'text-emerald-500' },
    { path: '/admin/question-banks', icon: Database, label: 'Ngân hàng câu hỏi', color: 'text-violet-500' },
    { path: '/admin/questions', icon: HelpCircle, label: 'Câu hỏi', color: 'text-amber-500' },
    { path: '/admin/exams', icon: FileText, label: 'Đề thi', color: 'text-rose-500' },
    { path: '/admin/exam-sessions', icon: ClipboardList, label: 'Ca thi', color: 'text-cyan-500' },
    { path: '/admin/exam-results', icon: Trophy, label: 'Kết quả', color: 'text-orange-500' },
  ];

  // Breadcrumb from path
  const currentNav = navItems.find(n => location.pathname.startsWith(n.path));

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      {/* ── Header ── */}
      <header className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50 h-[62px]">
        <div className="flex h-full px-6 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold leading-none tracking-tight">ExamOnline</h1>
              <p className="text-[10px] text-white/60 leading-none mt-0.5 uppercase tracking-widest">Admin Portal</p>
            </div>
          </div>

          {/* Breadcrumb */}
          {currentNav && (() => {
            const NavIcon = currentNav.icon;
            return (
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Link to="/admin" className="flex items-center gap-1.5 text-white/60 hover:text-white/90 transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                  <NavIcon className="w-3.5 h-3.5 text-white" />
                  <span className="text-white font-semibold text-[13px]">{currentNav.label}</span>
                </div>
              </div>
            );
          })()}

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white/90" />
              </div>
              <span className="font-medium text-white/95 max-w-[120px] truncate">{user?.email}</span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-amber-400 text-amber-900 rounded-full tracking-wide">Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-lg border border-transparent hover:border-white/20 group"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              <span className="hidden sm:block">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-[62px]">
        {/* ── Sidebar ── */}
        <aside className="w-60 bg-white border-r border-gray-100 min-h-[calc(100vh-62px)] fixed top-[62px] left-0 flex flex-col shadow-sm z-40">
          {/* Nav items */}
          <nav className="flex-1 p-3 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 group relative
                    ${isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full" />
                  )}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                    ${isActive ? 'bg-indigo-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : item.color}`} />
                  </div>
                  <span className={`text-sm font-medium ${isActive ? 'text-indigo-700' : ''}`}>
                    {item.label}
                  </span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-gray-700 truncate">ExamOnline v1.0</p>
                <p className="text-[10px] text-gray-400">Hệ thống thi trực tuyến</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 ml-60 min-h-[calc(100vh-62px)] bg-[#f5f6fa]">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
