import React from 'react';
import { useTraining } from '../../contexts/TrainingContext';
import Card from '../ui/Card';

const TrainingResults: React.FC = () => {
  const { 
    trainingData, 
    isTraining, 
    progress, 
    currentEpoch, 
    totalEpochs,
    metrics,
    validationMetrics
  } = useTraining();

  // Chuyển đổi progress thành phần trăm cho dễ đọc
  const progressPercent = Math.round(progress);

  return (
    <Card title="Kết quả huấn luyện">
      <div className="space-y-6">
        {/* Phần progress huấn luyện */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-medium text-gray-900">Tiến độ huấn luyện</h3>
            <span className="text-sm font-medium text-gray-700">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Epoch: {currentEpoch} / {totalEpochs}
          </div>
        </div>

        {/* Thông tin loss và accuracy */}
       

        {/* Validation metrics */}
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-3">Kết quả xác thực</h3>
          {validationMetrics && (validationMetrics.mAP50 > 0 || validationMetrics.mAP5095 > 0) ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-xs text-gray-500">mAP50</div>
                <div className="text-base font-medium">{validationMetrics.mAP50.toFixed(4)}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-xs text-gray-500">mAP50-95</div>
                <div className="text-base font-medium">{validationMetrics.mAP5095.toFixed(4)}</div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Chưa có dữ liệu xác thực</p>
          )}
        </div>

        {/* Trạng thái hiện tại */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2 ${
              isTraining ? 'bg-green-500 animate-pulse' : 
              trainingData.status === 'completed' ? 'bg-blue-500' :
              trainingData.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
            }`}></div>
            <div className="text-sm font-medium">
              {isTraining ? 'Đang huấn luyện...' : 
              trainingData.status === 'completed' ? 'Huấn luyện hoàn thành' :
              trainingData.status === 'failed' ? 'Huấn luyện thất bại' : 
              trainingData.status === 'stopped' ? 'Đã dừng huấn luyện' : 'Chưa huấn luyện'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TrainingResults; 