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
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md fixed top-4 left-4 right-4 rounded-xl backdrop-blur-md px-4 py-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-white" />
            <h1 className="text-xl font-bold">Hệ thống Thi Trực tuyến</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-white bg-white/20 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4" />
              <span>{currentTime.toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-5 h-5 text-white/80" />
              <span className="font-medium text-white">{user?.name || user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white hover:bg-red-100 hover:text-red-600 transition-colors rounded"
            >
              <LogOut className="w-4 h-4" />
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
