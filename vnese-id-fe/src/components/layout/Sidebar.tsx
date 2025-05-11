import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  AcademicCapIcon, 
  DocumentTextIcon, 
  Bars3Icon,
  XMarkIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Trang chủ', to: '/', icon: HomeIcon },
  { name: 'Huấn luyện mô hình nhận dạng vùng CCCD', to: '/training', icon: AcademicCapIcon },
  { name: 'Huấn luyện nhận dạng văn bản', to: '/training/text-recognition', icon: DocumentMagnifyingGlassIcon },
  { name: 'Trích xuất thông tin', to: '/extraction', icon: DocumentTextIcon },
];

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className = '' }: SidebarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-50 w-full bg-white shadow-sm p-4">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
        >
          <span className="sr-only">Mở menu</span>
          {isMobileMenuOpen ? (
            <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
          ) : (
            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-25">
          <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white">
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Quản lý CCCD
              </h2>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="ml-auto p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
              >
                <span className="sr-only">Đóng menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-2 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) =>
                    `${
                      isActive
                        ? 'bg-gray-100 text-accent'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-2 text-base font-medium rounded-md`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon
                    className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 h-6 w-6 mr-3"
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 ${className}`}>
        <div className="px-6 pb-5">
          <h2 className="text-2xl font-bold text-gray-900">
            Quản lý CCCD
          </h2>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 py-4 px-3 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `${
                    isActive
                      ? 'bg-gray-100 text-accent font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-3 py-2.5 text-sm rounded-md`
                }
              >
                <item.icon
                  className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 h-5 w-5 mr-3"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 