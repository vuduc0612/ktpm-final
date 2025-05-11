import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1 w-full h-screen overflow-x-hidden">
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