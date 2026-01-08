import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, Loader } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { showToast } from '../../lib/toast';

const VerifyEmailSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token xác thực không hợp lệ');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Xác thực email thành công!');
        showToast.success('Tài khoản đã được kích hoạt! Bạn có thể đăng nhập ngay.');
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err: any) {
        setStatus('error');
        const errorMsg = err.response?.data?.message || 'Xác thực email thất bại. Token có thể đã hết hạn.';
        setMessage(errorMsg);
        showToast.error(errorMsg);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 p-4">
      <div className="bg-white/90 backdrop-blur-lg p-8 md:p-12 rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
        {status === 'loading' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg mb-6">
              <Loader className="w-12 h-12 text-white animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Đang xác thực email...
            </h1>
            <p className="text-gray-600">
              Vui lòng chờ trong giây lát
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg mb-6 animate-bounce-slow">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Xác thực thành công!
            </h1>
            <p className="text-gray-700 text-lg mb-2">
              {message}
            </p>
            <p className="text-gray-600 mb-8">
              Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập và bắt đầu sử dụng hệ thống ngay bây giờ.
            </p>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-8">
              <p className="text-sm text-green-800">
                🎉 <strong>Chúc mừng!</strong> Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây...
              </p>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-8 rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Đăng nhập ngay
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-500 to-pink-600 rounded-full shadow-lg mb-6">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Xác thực thất bại
            </h1>
            <p className="text-gray-700 text-lg mb-8">
              {message}
            </p>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-8">
              <p className="text-sm text-red-800">
                <strong>Lý do có thể:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                <li>Token xác thực đã hết hạn</li>
                <li>Liên kết đã được sử dụng trước đó</li>
                <li>Liên kết không hợp lệ</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-xl hover:from-red-700 hover:to-pink-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Đăng ký lại
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all duration-200"
              >
                Về trang đăng nhập
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default VerifyEmailSuccessPage;
