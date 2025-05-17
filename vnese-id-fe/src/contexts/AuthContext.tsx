import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin } from '../services/api';
import { setCookie, getCookie, removeCookie } from '../services/cookieService';

interface User {
  userId: number;
  email: string;
  username: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  login: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Kiểm tra xem người dùng đã đăng nhập chưa khi tải trang
  useEffect(() => {
    const checkAuth = () => {
      const token = getCookie('auth_token');
      const savedUser = getCookie('user');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Lỗi khi phân tích dữ liệu người dùng:', err);
          // Xóa cookie nếu dữ liệu không hợp lệ
          removeCookie('auth_token');
          removeCookie('user');
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiLogin(username, password);
      
      if (response.success && response.token && response.user) {
        // Lưu token vào cookie
        setCookie('auth_token', response.token);
        // Lưu thông tin người dùng
        setCookie('user', JSON.stringify(response.user));
        
        setUser(response.user);
        setIsAuthenticated(true);
        return true;
      } else {
        setError(response.message || 'Đăng nhập thất bại');
        return false;
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi đăng nhập');
      console.error('Lỗi đăng nhập:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Xóa token và thông tin người dùng khỏi cookie
    removeCookie('auth_token');
    removeCookie('user');
    
    // Cập nhật trạng thái
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 