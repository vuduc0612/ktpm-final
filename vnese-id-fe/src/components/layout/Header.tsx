import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-indigo-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl">
              VNeseID Manager
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/" className="text-white hover:text-indigo-200 px-3 py-2 rounded-md">
                  Trang chủ
                </Link>
                <Link to="/extraction" className="text-white hover:text-indigo-200 px-3 py-2 rounded-md">
                  Trích xuất
                </Link>
                <Link to="/training" className="text-white hover:text-indigo-200 px-3 py-2 rounded-md">
                  Huấn luyện
                </Link>
                <div className="relative ml-3">
                  <div>
                    <button
                      type="button"
                      className="flex text-sm bg-indigo-700 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                      id="user-menu"
                      aria-expanded="false"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                      <span className="sr-only">Mở menu người dùng</span>
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-white font-medium">
                        {user?.username.charAt(0).toUpperCase()}
                      </div>
                    </button>
                  </div>
                  {isMenuOpen && (
                    <div
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                        <p className="font-medium">{user?.username}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="text-white hover:text-indigo-200 px-3 py-2 rounded-md">
                Đăng nhập
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              className="text-white hover:text-indigo-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu di động */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Trang chủ
                </Link>
                <Link
                  to="/extraction"
                  className="text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Trích xuất
                </Link>
                <Link
                  to="/training"
                  className="text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Huấn luyện
                </Link>
                <div className="pt-4 pb-3 border-t border-indigo-700">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-800 flex items-center justify-center text-white font-medium">
                        {user?.username.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">{user?.username}</div>
                      <div className="text-sm font-medium text-indigo-300">{user?.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 px-2 space-y-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-700"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 