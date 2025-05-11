import React from 'react';
import type { IdCardZoneMetric } from '../services/metricService';
import Card from './ui/Card';

const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="p-4 bg-gray-50 rounded-lg">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="font-medium">{value}</div>
  </div>
);

interface IdCardZoneMetricProps {
  metrics: IdCardZoneMetric | null;
  loading: boolean;
}

const IdCardZoneMetric: React.FC<IdCardZoneMetricProps> = ({ metrics, loading }) => {
  if (loading) {
    return <Card title="Kết quả huấn luyện mô hình">
      <div className="flex justify-center items-center h-32">Đang tải...</div>
    </Card>;
  }

  if (!metrics) {
    return <Card title="Kết quả huấn luyện mô hình">
      <div className="text-gray-500 text-center">Không có dữ liệu metrics</div>
    </Card>;
  }

  return (
    <Card title="Kết quả huấn luyện mô hình">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <InfoItem label="Epoch" value={metrics.epoch} />
        <InfoItem label="Precision" value={(metrics.precision * 100).toFixed(2) + '%'} />
        <InfoItem label="Recall" value={(metrics.recall * 100).toFixed(2) + '%'} />
        <InfoItem label="Ngày tạo" value={new Date(metrics.created_at).toLocaleString()} />
        <InfoItem label="Training Loss" value={
          <div>
            <div>Box: {metrics.train_box_loss.toFixed(4)}</div>
            <div>Obj: {metrics.train_obj_loss.toFixed(4)}</div>
            <div>Cls: {metrics.train_cls_loss.toFixed(4)}</div>
          </div>
        } />
        <InfoItem label="Validation Loss" value={
          <div>
            <div>Box: {metrics.val_box_loss.toFixed(4)}</div>
            <div>Obj: {metrics.val_obj_loss.toFixed(4)}</div>
            <div>Cls: {metrics.val_cls_loss.toFixed(4)}</div>
          </div>
        } />
      </div>
    </Card>
  );
};

export default IdCardZoneMetric; 