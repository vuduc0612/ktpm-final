import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {isAuthenticated && <Sidebar />}
      
      {/* Main content */}
      <div className={`flex flex-col flex-1 w-full h-screen overflow-x-hidden ${isAuthenticated ? 'lg:pl-64' : ''}`}>
        <Header />
        
        <main className="flex-1">
          {children}
        </main>
        
        <footer className="bg-white border-t border-gray-200 py-2 px-4 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} - Hệ thống Quản lý Căn cước công dân
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Layout; 