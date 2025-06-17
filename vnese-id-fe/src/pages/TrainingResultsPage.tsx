import React, { useEffect, useState } from 'react';
import { useTraining } from '../contexts/TrainingContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';

import IdCardZoneMetric from '../components/IdCardZoneMetric';
import { getCardZoneMetrics, createCardZoneMetrics, IdCardZoneMetric as MetricType, CreateCardZoneMetricData } from '../services/metricService';
import { downloadTrainedModel } from '../services/api';

const TrainingResultsPage: React.FC = () => {
  const {
    error
  } = useTraining();
  
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MetricType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getCardZoneMetrics();
        console.log("Data base:", data);
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
        // Format created_at về ISO-8601 không timezone
        created_at: (() => {
          const d = new Date(metrics.created_at);
          return d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0') + 'T' +
            String(d.getHours()).padStart(2, '0') + ':' +
            String(d.getMinutes()).padStart(2, '0') + ':' +
            String(d.getSeconds()).padStart(2, '0');
        })(),
        user_id: user?.userId || 1 // Sử dụng userId của người dùng đang đăng nhập
      };
      console.log("Save Data:", saveData);
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

  const handleDownloadModel = async () => {
    setDownloadLoading(true);
    setDownloadError(null);
    
    try {
      const modelBlob = await downloadTrainedModel();
      
      // Tạo URL tạm thời cho Blob
      const downloadUrl = window.URL.createObjectURL(modelBlob);
      
      // Tạo phần tử <a> và trigger click để tải xuống
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'best.pt'; // Tên file khi tải xuống
      document.body.appendChild(a);
      a.click();
      
      // Dọn dẹp
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Lỗi khi tải xuống mô hình:', error);
      setDownloadError('Có lỗi xảy ra khi tải xuống mô hình. Vui lòng thử lại.');
    } finally {
      setDownloadLoading(false);
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
        
        {downloadError && (
          <Alert
            type="error"
            title="Lỗi tải xuống"
            onClose={() => setDownloadError(null)}
            className="mb-6"
          >
            {downloadError}
          </Alert>
        )}

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
                  src={`http://localhost:8888/api/metrics/metrics-zone/image/${metrics.confusion_matrix_path}`}
                  alt="Confusion Matrix"
                  className="rounded shadow max-w-full h-auto cursor-pointer"
                  style={{maxHeight: 320}}
                  onClick={() => window.open(`http://localhost:8888/api/metrics/metrics-zone/image/${metrics.confusion_matrix_path}`, '_blank')}
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
                  src={`http://localhost:8888/api/metrics/metrics-zone/image/${metrics.results_path}`}
                  alt="Result"
                  className="rounded shadow max-w-full h-auto cursor-pointer"
                  style={{maxHeight: 320}}
                  onClick={() => window.open(`http://localhost:8888/api/metrics/metrics-zone/image/${metrics.results_path}`, '_blank')}
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
            onClick={handleDownloadModel}
            disabled={downloadLoading}
          >
            {downloadLoading ? 'Đang tải xuống...' : 'Tải về mô hình'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TrainingResultsPage; 