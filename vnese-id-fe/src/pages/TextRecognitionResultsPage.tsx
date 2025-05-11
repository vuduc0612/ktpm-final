import React from 'react';
import { Link } from 'react-router-dom';
import TextRecognitionResults from '../components/training/TextRecognitionResults';
import Button from '../components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const TextRecognitionResultsPage: React.FC = () => {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Kết quả huấn luyện mô hình nhận dạng văn bản
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Đánh giá hiệu suất mô hình OCR và thử nghiệm với dữ liệu mới
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link to="/training/text-recognition">
              <Button 
                variant="secondary"
                className="flex items-center"
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                <span>Quay lại huấn luyện</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <TextRecognitionResults />
        </div>
      </div>
    </div>
  );
};

export default TextRecognitionResultsPage; 