import React from 'react';
import { Link } from 'react-router-dom';
import TextRecognitionTraining from '../components/training/TextRecognitionTraining';
import Button from '../components/ui/Button';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const TextRecognitionTrainingPage: React.FC = () => {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Huấn luyện mô hình nhận dạng văn bản
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Cấu hình và huấn luyện mô hình OCR để nhận dạng và trích xuất văn bản từ ảnh CCCD/CMND
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Link to="/training/text-recognition/results">
              <Button 
                variant="secondary" 
                className="flex items-center"
              >
                <span>Xem kết quả huấn luyện</span>
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/extraction">
              <Button variant="secondary">
                Quay lại trích xuất
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <TextRecognitionTraining />
        </div>

        {/* Thêm nút xem kết quả huấn luyện ở cuối trang */}
        <div className="mt-8 flex justify-center">
          <Link to="/training/text-recognition/results">
            <Button 
              variant="primary" 
              className="flex items-center px-8 py-3"
            >
              <span>Xem kết quả huấn luyện</span>
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TextRecognitionTrainingPage; 