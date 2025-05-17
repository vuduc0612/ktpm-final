import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  redirectPath?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  redirectPath = '/login' 
}) => {
  const { isAuthenticated, loading } = useAuth();

  // Hiển thị loading nếu đang kiểm tra trạng thái xác thực
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Chuyển hướng đến trang đăng nhập nếu chưa xác thực
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Hiển thị các trang con nếu đã xác thực
  return <Outlet />;
};

export default PrivateRoute; 