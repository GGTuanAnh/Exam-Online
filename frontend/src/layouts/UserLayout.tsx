import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { BookOpen, LogOut, User, Clock, GraduationCap, Menu, X } from 'lucide-react';

const UserLayout = () => {
  const user = authService.getCurrentUser();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const navItems = [
    { path: '/', icon: BookOpen, label: 'Bài thi khả dụng' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      {/* ── Top Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-3">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-200/50 px-5 py-3 flex items-center justify-between">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                  <GraduationCap className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h1 className="text-[14px] font-bold leading-none tracking-tight">ExamOnline</h1>
                  <p className="text-[9px] text-white/60 leading-none mt-0.5 uppercase tracking-widest">Thi trực tuyến</p>
                </div>
              </div>

              {/* Nav links */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${isActive
                          ? 'bg-white/20 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Clock + User + Logout */}
            <div className="flex items-center gap-3">
              {/* Live clock */}
              <div className="hidden lg:flex items-center gap-1.5 text-sm text-white/80 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono text-xs font-medium">
                  {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              {/* User pill */}
              <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white/90" />
                </div>
                <span className="font-medium text-white/95 max-w-[100px] truncate hidden sm:block">
                  {user?.email?.split('@')[0] || user?.email}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-lg border border-transparent hover:border-white/20 group"
              >
                <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                <span className="hidden sm:block">Đăng xuất</span>
              </button>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-1.5 rounded-lg hover:bg-white/10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {mobileMenuOpen && (
            <div className="mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 md:hidden">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="pt-[90px] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserLayout;
