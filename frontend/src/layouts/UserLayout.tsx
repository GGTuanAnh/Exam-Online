import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { BookOpen, LogOut, User, Clock } from 'lucide-react';

const UserLayout = () => {
  const user = authService.getCurrentUser();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg fixed top-4 left-4 right-4 rounded-2xl backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <BookOpen className="w-9 h-9 text-white" />
            <h1 className="text-2xl font-bold tracking-tight">Hệ thống Thi Trực tuyến</h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-white bg-white/20 px-4 py-2 rounded-full border border-white/20">
              <Clock className="w-5 h-5" />
              <span>{currentTime.toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
              <User className="w-5 h-5 text-white/90" />
              <span className="font-medium text-white/95">{user?.name || user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-all rounded-lg border border-transparent hover:border-white/20"
            >
              <LogOut className="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-20">
        {/* Sidebar */}
        <aside className="w-64 bg-white/80 backdrop-blur-md shadow-sm rounded-xl min-h-[calc(100vh-8rem)] fixed top-20 left-4 mt-4 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors duration-200
                    ${isActive ? 'bg-indigo-600 text-white shadow-inner' : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-600'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 ml-72">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
