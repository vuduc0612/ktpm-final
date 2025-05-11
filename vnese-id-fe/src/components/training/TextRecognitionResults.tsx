import React, { useState } from 'react';
import { useTraining } from '../../contexts/TrainingContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import Button from '../ui/Button';
import { TextRecogniteMetrics } from '../../types';
import { ArrowDownTrayIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

// Đăng ký các thành phần Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Dữ liệu mẫu cho metrics
const sampleMetrics: TextRecogniteMetrics = {
  accuracy: 0.946,
  wordRecognized: 1205,
  wordMissed: 68,
  confidenceScore: 0.92,
  falsePositive: 0.03,
  falseNegative: 0.05,
  user: {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'nva@example.com',
    role: 'admin'
  }
};

const TextRecognitionResults: React.FC = () => {
  const { trainingData } = useTraining();
  const [selectedMetric, setSelectedMetric] = useState<string>('accuracy');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const formatAccuracy = (value: number): string => {
    return (value * 100).toFixed(1) + '%';
  };

  // Tạo dữ liệu giả cho biểu đồ
  const generateChartData = () => {
    // Nếu có dữ liệu thực từ trainingData, sử dụng nó thay vì dữ liệu giả
    const epochs = Array.from({ length: trainingData.currentEpoch || 10 }, (_, i) => i + 1);
    
    let values;
    if (selectedMetric === 'accuracy') {
      // Tạo dữ liệu độ chính xác tăng dần
      values = epochs.map(epoch => {
        const baseValue = epoch / (trainingData.totalEpochs || 10) * 0.8;
        return Math.min(0.2 + baseValue + Math.random() * 0.05, 1);
      });
    } else {
      // Tạo dữ liệu loss giảm dần
      values = epochs.map(epoch => {
        const baseValue = 1 - epoch / (trainingData.totalEpochs || 10) * 0.8;
        return Math.max(0.1, baseValue + Math.random() * 0.1);
      });
    }

    return {
      labels: epochs,
      datasets: [
        {
          label: selectedMetric === 'accuracy' ? 'Độ chính xác' : 'Độ lỗi',
          data: values,
          borderColor: selectedMetric === 'accuracy' ? 'rgb(53, 162, 235)' : 'rgb(255, 99, 132)',
          backgroundColor: selectedMetric === 'accuracy' ? 'rgba(53, 162, 235, 0.5)' : 'rgba(255, 99, 132, 0.5)',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: selectedMetric === 'accuracy' ? 'Độ chính xác qua các epoch' : 'Độ lỗi qua các epoch',
      },
    },
    scales: {
      y: {
        min: selectedMetric === 'accuracy' ? 0 : undefined,
        max: selectedMetric === 'accuracy' ? 1 : undefined,
      },
    },
  };

  const handleSaveResults = () => {
    // Giả lập lưu kết quả
    setTimeout(() => {
      setSaveSuccess(true);
      
      // Ẩn thông báo sau 3 giây
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
  };

  const handleExportResults = () => {
    // Tạo dữ liệu để xuất
    const metrics = trainingData.metrics;
    const exportData = {
      accuracy: metrics?.accuracy || sampleMetrics.accuracy,
      wordRecognized: metrics?.wordRecognized || sampleMetrics.wordRecognized,
      wordMissed: metrics?.wordMissed || sampleMetrics.wordMissed,
      confidenceScore: metrics?.confidenceScore || sampleMetrics.confidenceScore,
      falsePositive: metrics?.falsePositive || sampleMetrics.falsePositive,
      falseNegative: metrics?.falseNegative || sampleMetrics.falseNegative,
      user: metrics?.user?.name || sampleMetrics.user.name,
      date: new Date().toISOString()
    };
    
    // Chuyển đổi thành chuỗi JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([jsonString], { type: 'application/json' });
    
    // Tạo URL và link tải xuống
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `training-results-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Biểu đồ kết quả huấn luyện */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-medium text-gray-700">Biểu đồ huấn luyện</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="accuracy">Độ chính xác</option>
              <option value="loss">Độ lỗi</option>
            </select>
          </div>
        </div>
        <div className="p-4">
          {trainingData.currentEpoch > 0 ? (
            <Line options={chartOptions} data={generateChartData()} />
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">
                Chưa có dữ liệu huấn luyện. Bắt đầu huấn luyện để xem biểu đồ.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Các thông số đánh giá */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-medium text-gray-700">Thông số đánh giá</h3>
            <div className="flex space-x-2">
              <Button 
                variant="secondary" 
                className="flex items-center space-x-1 text-sm"
                onClick={handleExportResults}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Xuất kết quả</span>
              </Button>
              <Button 
                variant="primary" 
                className="flex items-center space-x-1 text-sm"
                onClick={handleSaveResults}
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>Lưu kết quả</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="p-4">
          {saveSuccess && (
            <div className="mb-4 bg-green-50 p-3 rounded-md border border-green-200 text-green-800">
              Đã lưu kết quả huấn luyện thành công!
            </div>
          )}
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Độ chính xác</div>
              <div className="text-lg font-semibold">{formatAccuracy(trainingData.metrics?.accuracy || sampleMetrics.accuracy)}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Từ nhận dạng đúng</div>
              <div className="text-lg font-semibold">{trainingData.metrics?.wordRecognized || sampleMetrics.wordRecognized}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Từ nhận dạng sai</div>
              <div className="text-lg font-semibold">{trainingData.metrics?.wordMissed || sampleMetrics.wordMissed}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Điểm tin cậy</div>
              <div className="text-lg font-semibold">{formatAccuracy(trainingData.metrics?.confidenceScore || sampleMetrics.confidenceScore)}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">False Positive</div>
              <div className="text-lg font-semibold">{formatAccuracy(trainingData.metrics?.falsePositive || sampleMetrics.falsePositive)}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">False Negative</div>
              <div className="text-lg font-semibold">{formatAccuracy(trainingData.metrics?.falseNegative || sampleMetrics.falseNegative)}</div>
            </div>
          </div>
          
          {/* Thông tin người dùng */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="text-xs text-gray-500 mb-2">Người huấn luyện mô hình</div>
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-medium">
                {(trainingData.metrics?.user?.name || sampleMetrics.user.name).charAt(0)}
              </div>
              <div className="ml-2">
                <div className="text-sm font-medium">{trainingData.metrics?.user?.name || sampleMetrics.user.name}</div>
                <div className="text-xs text-gray-500">{trainingData.metrics?.user?.email || sampleMetrics.user.email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextRecognitionResults; 