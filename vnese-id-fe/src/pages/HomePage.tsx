import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  DocumentTextIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';

const features = [
  {
    name: 'Huấn luyện mô hình nhận dạng',
    description: 'Tạo và huấn luyện mô hình AI để tự động nhận diện vùng chứa CCCD trong ảnh.',
    icon: AcademicCapIcon,
    to: '/training',
    bgColor: 'bg-green-500'
  },
  {
    name: 'Huấn luyện nhận dạng văn bản',
    description: 'Huấn luyện mô hình OCR để nhận dạng và trích xuất văn bản từ ảnh tài liệu.',
    icon: DocumentMagnifyingGlassIcon,
    to: '/training/text-recognition',
    bgColor: 'bg-amber-500'
  },
  {
    name: 'Trích xuất thông tin từ ảnh',
    description: 'Tự động trích xuất thông tin từ ảnh căn cước công dân bằng công nghệ AI.',
    icon: DocumentTextIcon,
    to: '/extraction',
    bgColor: 'bg-purple-500'
  },
];

const HomePage = () => {
  return (
    <div className="h-full">
      {/* Hero Section */}
      <div className="bg-primary text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold sm:text-5xl">
              Hệ thống Quản lý Căn cước công dân
            </h1>
            <p className="mt-5 max-w-3xl mx-auto text-xl">
              Giải pháp toàn diện cho việc lưu trữ, quản lý và trích xuất thông tin căn cước công dân
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link
                key={feature.name}
                to={feature.to}
                className="transform transition duration-300 hover:scale-105"
              >
                <Card className="h-full overflow-hidden shadow-lg border-0">
                  <div className="flex flex-col h-full">
                    <div className={`p-6 ${feature.bgColor} text-white rounded-t-lg mx-auto w-full`}>
                      <div className="flex items-center">
                        <feature.icon className="h-10 w-10" />
                        <h3 className="ml-4 text-xl font-bold text-white">{feature.name}</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-base text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card title="Giới thiệu hệ thống" className="shadow-lg border-0">
            <div className="prose prose-blue max-w-none p-4">
              <p className="text-lg">
                Hệ thống quản lý căn cước công dân giúp cơ quan quản lý dễ dàng lưu trữ và truy xuất thông tin 
                CCCD của người dân. Với việc tích hợp công nghệ AI, hệ thống có thể tự động nhận diện và trích xuất 
                thông tin từ ảnh CCCD, tiết kiệm thời gian và tăng độ chính xác trong quá trình nhập liệu.
              </p>
              <h4 className="text-xl font-semibold mt-6 mb-4">Ưu điểm của hệ thống:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tự động hóa quá trình nhập liệu từ ảnh CCCD
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Lưu trữ thông tin an toàn, bảo mật
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tìm kiếm thông tin nhanh chóng
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Cho phép tùy chỉnh và huấn luyện mô hình AI
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Giao diện thân thiện, dễ sử dụng
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 