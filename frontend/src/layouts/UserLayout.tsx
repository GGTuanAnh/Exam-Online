import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { BookOpen, Trophy, LogOut, User, Clock } from 'lucide-react';

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
    { path: '/my-results', icon: Trophy, label: 'Kết quả của tôi' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">Hệ thống Thi Trực tuyến</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4" />
                <span>{currentTime.toLocaleString('vi-VN')}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <User className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">{user?.name || user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
