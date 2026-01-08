import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      const success = authService.handleCallback(token, userStr, refreshToken || undefined);
      if (success) {
        // Redirect based on user role
        const user = authService.getCurrentUser();
        const redirectTo = user?.role === 'ADMIN' ? '/admin' : '/';
        navigate(redirectTo);
        return;
      }
    }
    
    // If failed, go back to login with error
    navigate('/login?error=Google_Login_Failed');
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-xl">Đang xử lý đăng nhập...</div>
    </div>
  );
};

export default AuthCallbackPage;
