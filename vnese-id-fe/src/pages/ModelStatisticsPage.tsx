import React from 'react';
import Card from '../components/ui/Card';
import { useState } from 'react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

// Types
interface ModelStats {
  totalModels: number;
  bestPrecision: number;
  bestRecall: number;
}

interface TrainedModel {
  id: string;
  name: string;
  createdAt: string;
  trainedBy: string;
  epochs: number;
  precision: number;
  recall: number;
  mAP50: number;
  trainingTime: string;
  totalDataset: number;
}

const ModelStatisticsPage: React.FC = () => {
  // Mock data - sẽ được thay thế bằng API call
  const stats: ModelStats = {
    totalModels: 15,
    bestPrecision: 0.95,
    bestRecall: 0.92
  };

  const trainedModels: TrainedModel[] = [
    {
      id: '1',
      name: 'yolov5_cccd_v1',
      createdAt: '2024-03-29T08:00:00',
      trainedBy: 'Vu Huu Duc',
      epochs: 100,
      precision: 0.95,
      recall: 0.90,
      mAP50: 0.92,
      trainingTime: '2h 30m',
      totalDataset: 1500
    },
    {
      id: '2',
      name: 'yolov5_cccd_v2',
      createdAt: '2024-03-28T10:30:00',
      trainedBy: 'Vu Huu Duc',
      epochs: 150,
      precision: 0.93,
      recall: 0.92,
      mAP50: 0.91,
      trainingTime: '3h 15m',
      totalDataset: 2000
    },
    {
      id: '3',
      name: 'yolov8_cccd_v1',
      createdAt: '2024-03-27T14:20:00',
      trainedBy: 'Vu Huu Duc',
      epochs: 200,
      precision: 0.96,
      recall: 0.94,
      mAP50: 0.95,
      trainingTime: '4h 45m',
      totalDataset: 2500
    },
    {
      id: '4',
      name: 'yolov8_cccd_v2',
      createdAt: '2024-03-26T09:15:00',
      trainedBy: 'Vu Huu Duc',
      epochs: 180,
      precision: 0.94,
      recall: 0.93,
      mAP50: 0.93,
      trainingTime: '4h',
      totalDataset: 3000
    },
    {
      id: '5',
      name: 'yolov8_cccd_v3',
      createdAt: '2024-03-25T16:40:00',
      trainedBy: 'Vu Huu Duc',
      epochs: 250,
      precision: 0.97,
      recall: 0.95,
      mAP50: 0.96,
      trainingTime: '5h 30m',
      totalDataset: 3500
    }
  ];

  // Get top 5 models based on average of precision and recall
  const topModels = [...trainedModels]
    .sort((a, b) => {
      const scoreA = (a.precision + a.recall) / 2;
      const scoreB = (b.precision + b.recall) / 2;
      return scoreB - scoreA;
    })
    .slice(0, 5);

  // Filters
  const [filters, setFilters] = useState({
    modelType: '',
    dateRange: {
      start: '',
      end: ''
    },
    minPrecision: '',
    minRecall: '',
  });

  // Filter controls
  const renderFilters = () => (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <Select
        label="Loại mô hình"
        value={filters.modelType}
        onChange={(e) => setFilters({...filters, modelType: e.target.value})}
        options={[
          { value: '', label: 'Tất cả' },
          { value: 'yolov5', label: 'YOLOv5' },
          { value: 'yolov8', label: 'YOLOv8' }
        ]}
      />
      <Input
        type="date"
        label="Từ ngày"
        value={filters.dateRange.start}
        onChange={(e) => setFilters({
          ...filters, 
          dateRange: {...filters.dateRange, start: e.target.value}
        })}
      />
      <Input
        type="date"
        label="Đến ngày"
        value={filters.dateRange.end}
        onChange={(e) => setFilters({
          ...filters, 
          dateRange: {...filters.dateRange, end: e.target.value}
        })}
      />
      
    </div>
  );

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Thống kê mô hình nhận dạng vùng CCCD
        </h1>

        {/* Add Filters */}
        {renderFilters()}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
          <Card>
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Tổng số mô hình</h3>
              <div className="mt-1">
                <div className="text-3xl font-semibold text-blue-600">
                  {stats.totalModels}
                </div>
                <div className="text-sm text-gray-500">mô hình đã huấn luyện</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Precision cao nhất</h3>
              <div className="mt-1">
                <div className="text-3xl font-semibold text-green-600">
                  {(stats.bestPrecision * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">độ chính xác tốt nhất</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Recall cao nhất</h3>
              <div className="mt-1">
                <div className="text-3xl font-semibold text-purple-600">
                  {(stats.bestRecall * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">độ phủ tốt nhất</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Top 5 Models */}
        <Card className="mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Top 5 mô hình hiệu quả nhất
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {topModels.map((model, index) => (
                <div key={model.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="text-xs text-gray-400">{new Date(model.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">{model.name}</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Precision:</span>
                      <span className="text-xs font-medium text-green-600">{(model.precision * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Recall:</span>
                      <span className="text-xs font-medium text-blue-600">{(model.recall * 100).toFixed(1)}%</span>
                    </div>
                   
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Models List */}
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Danh sách mô hình đã huấn luyện
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên mô hình
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người huấn luyện
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số dataset
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Epochs
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precision
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recall
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian huấn luyện
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trainedModels.map((model) => (
                    <tr key={model.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {model.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(model.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {model.trainedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {model.totalDataset.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {model.epochs}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(model.precision * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(model.recall * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {model.trainingTime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ModelStatisticsPage; 