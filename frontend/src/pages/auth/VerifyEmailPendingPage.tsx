import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

const VerifyEmailPendingPage: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email || 'your-email@example.com';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 p-4">
      <div className="bg-white/90 backdrop-blur-lg p-8 md:p-12 rounded-2xl shadow-2xl max-w-2xl w-full border border-white/20">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <Mail className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-xl">✉️</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Kiểm tra email của bạn
        </h1>

        {/* Description */}
        <div className="text-center mb-8">
          <p className="text-gray-700 text-lg mb-2">
            Chúng tôi đã gửi email xác thực đến:
          </p>
          <p className="text-indigo-600 font-semibold text-xl mb-4">
            {email}
          </p>
          <p className="text-gray-600">
            Vui lòng kiểm tra hộp thư đến (hoặc thư mục spam) và nhấn vào liên kết xác thực để kích hoạt tài khoản.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Hướng dẫn kích hoạt:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm md:text-base">
            <li>Mở email từ <strong>Exam Online System</strong></li>
            <li>Tìm nút hoặc liên kết <strong>"Xác thực tài khoản"</strong></li>
            <li>Nhấn vào liên kết để hoàn tất đăng ký</li>
            <li>Sau khi xác thực, bạn có thể đăng nhập vào hệ thống</li>
          </ol>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-yellow-800">
            <strong>💡 Lưu ý:</strong> Nếu không thấy email sau vài phút, hãy kiểm tra thư mục <strong>Spam</strong> hoặc <strong>Junk</strong>. Email xác thực có thể mất 2-3 phút để được gửi đến.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/login"
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Đã xác thực, đăng nhập ngay
            <ArrowRight className="w-5 h-5" />
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all duration-200"
          >
            <RefreshCw className="w-5 h-5" />
            Gửi lại email
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Cần hỗ trợ? {' '}
            <a href="mailto:support@example.com" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Liên hệ chúng tôi
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPendingPage;
