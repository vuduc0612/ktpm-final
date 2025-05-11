import React, { useEffect, useState } from 'react';
import { useTraining } from '../contexts/TrainingContext';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';

import IdCardZoneMetric from '../components/IdCardZoneMetric';
import { getCardZoneMetrics, createCardZoneMetrics, IdCardZoneMetric as MetricType, CreateCardZoneMetricData } from '../services/metricService';

const TrainingResultsPage: React.FC = () => {
  const {
    trainingData,
    error
  } = useTraining();
  
  const [metrics, setMetrics] = useState<MetricType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getCardZoneMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const handleSaveResults = async () => {
    if (!metrics) return;
    
    setSaveLoading(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // Chuẩn bị data để lưu
      const saveData: CreateCardZoneMetricData = {
        epoch: metrics.epoch,
        train_box_loss: metrics.train_box_loss,
        train_obj_loss: metrics.train_obj_loss,
        train_cls_loss: metrics.train_cls_loss,
        precision: metrics.precision,
        recall: metrics.recall,
        val_box_loss: metrics.val_box_loss,
        val_obj_loss: metrics.val_obj_loss,
        val_cls_loss: metrics.val_cls_loss,
        created_at: new Date().toISOString(),
        user_id: 1 // Giả sử user_id là 1, trong thực tế nên lấy từ context hoặc storage
      };
      
      // Gọi API để lưu
      await createCardZoneMetrics(saveData);
      setSaveSuccess(true);
    } catch (error) {
      console.error('Error saving metrics:', error);
      setSaveError('Có lỗi xảy ra khi lưu kết quả. Vui lòng thử lại.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Kết quả huấn luyện mô hình nhận dạng CCCD</h1>
        </div>

        {error && (
          <Alert
            type="error"
            title="Lỗi"
            onClose={() => { }}
            className="mb-6"
          >
            {error}
          </Alert>
        )}
        
        {saveSuccess && (
          <Alert
            type="success"
            title="Thành công"
            onClose={() => setSaveSuccess(false)}
            className="mb-6"
          >
            Lưu kết quả thành công!
          </Alert>
        )}
        
        {saveError && (
          <Alert
            type="error"
            title="Lỗi"
            onClose={() => setSaveError(null)}
            className="mb-6"
          >
            {saveError}
          </Alert>
        )}

        {/* Thông tin tổng quan về mô hình */}
        {/* <div className="mb-6">
          <Card title="Thông tin mô hình">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Tên mô hình</div>
                <div className="font-medium">{trainingData?.name || 'Chưa có tên'}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Thời gian huấn luyện</div>
                <div className="font-medium">{trainingData?.duration || '0:00:00'}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Trạng thái</div>
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full mr-2 ${trainingData?.status === 'training' ? 'bg-green-500 animate-pulse' :
                      trainingData?.status === 'completed' ? 'bg-blue-500' :
                        trainingData?.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                  <span className="font-medium">
                    {trainingData?.status === 'training' ? 'Đang huấn luyện' :
                      trainingData?.status === 'completed' ? 'Hoàn thành' :
                        trainingData?.status === 'failed' ? 'Thất bại' : 'Chưa huấn luyện'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div> */}

        {/* Kết quả chi tiết */}
        <div className="mb-6">
          <IdCardZoneMetric metrics={metrics} loading={loading} />
        </div>

        {/* Confusion Matrix và các thông tin khác */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Ma trận nhầm lẫn (Confusion Matrix)">
            <div className="p-4 flex flex-col items-center">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">Đang tải...</p>
                </div>
              ) : metrics?.confusion_matrix_path ? (
                <img
                  src={`http://localhost:8888/api/training/metrics-zone/image/${metrics.confusion_matrix_path}`}
                  alt="Confusion Matrix"
                  className="rounded shadow max-w-full h-auto cursor-pointer"
                  style={{maxHeight: 320}}
                  onClick={() => window.open(`http://localhost:8888/api/training/metrics-zone/image/${metrics.confusion_matrix_path}`, '_blank')}
                  title="Click để xem ảnh chi tiết"
                />
              ) : (
                <p className="text-gray-500 italic">Ma trận nhầm lẫn sẽ được hiển thị khi hoàn thành huấn luyện</p>
              )}
            </div>
          </Card>
          <Card title="Kết quả (Results)">
            <div className="p-4 flex flex-col items-center">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">Đang tải...</p>
                </div>
              ) : metrics?.results_path ? (
                <img
                  src={`http://localhost:8888/api/training/metrics-zone/image/${metrics.results_path}`}
                  alt="Result"
                  className="rounded shadow max-w-full h-auto cursor-pointer"
                  style={{maxHeight: 320}}
                  onClick={() => window.open(`http://localhost:8888/api/training/metrics-zone/image/${metrics.results_path}`, '_blank')}
                  title="Click để xem ảnh chi tiết"
                />
              ) : (
                <p className="text-gray-500 italic">Kết quả sẽ được hiển thị khi hoàn thành huấn luyện</p>
              )}
            </div>
          </Card>
        </div>

        {/* Các nút tác vụ */}
        <div className="mt-6 flex justify-end space-x-4">
          <Button
            variant="secondary"
            onClick={handleSaveResults}
            disabled={saveLoading || !metrics}
          >
            {saveLoading ? 'Đang lưu...' : 'Lưu kết quả'}
          </Button>
          <Button
            variant="primary"
          >
            Tải về mô hình
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TrainingResultsPage; 