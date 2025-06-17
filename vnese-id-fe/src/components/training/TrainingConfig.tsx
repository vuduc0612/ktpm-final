import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TrainingConfig as TrainingConfigType } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useRef, useState } from 'react';

interface TrainingConfigProps {
  onSubmit: (config: TrainingConfigType, weightsFile?: File) => Promise<void>;
  isLoading?: boolean;
  onStopTraining?: () => Promise<void>;
  isTraining?: boolean;
  disabled?: boolean;
}

const TrainingConfig = ({ onSubmit, isLoading = false, onStopTraining, isTraining = false, disabled = false }: TrainingConfigProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedWeightsFile, setSelectedWeightsFile] = useState<File | null>(null);

  const validationSchema = Yup.object({
    batchSize: Yup.number()
      .required('Kích thước batch là bắt buộc')
      .min(1, 'Giá trị tối thiểu là 1')
      .max(64, 'Giá trị tối đa là 64'),
    epochs: Yup.number()
      .required('Số epochs là bắt buộc')
      .min(1, 'Giá trị tối thiểu là 1')
      .max(100, 'Giá trị tối đa là 100'),
    learningRate: Yup.number()
      .required('Learning rate là bắt buộc')
      .min(0.0001, 'Giá trị tối thiểu là 0.0001')
      .max(0.1, 'Giá trị tối đa là 0.1'),
    pretrainedWeights: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      batchSize: 16,
      epochs: 3,
      learningRate: 0.01,
      modelName: `model_${new Date().toISOString().split('T')[0].replace(/-/g, '')}`,
      datasetPath: '/dataset/yolo',
      pretrainedWeightPath: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit({
        ...values,
        modelName: `model_${new Date().toISOString().split('T')[0].replace(/-/g, '')}`,
        pretrainedWeightPath: selectedWeightsFile ? selectedWeightsFile.name : undefined
      }, selectedWeightsFile || undefined);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedWeightsFile(file);
      formik.setFieldValue('pretrainedWeightPath', file.name);
    }
  };

  const handleStartTraining = () => {
    formik.handleSubmit();
  };

  const handleStopTraining = async () => {
    if (onStopTraining) {
      await onStopTraining();
    }
  };

  return (
    <div>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Kích thước batch"
            name="batchSize"
            type="number"
            min={1}
            max={64}
            value={formik.values.batchSize}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.batchSize && formik.errors.batchSize ? formik.errors.batchSize as string : undefined}
            helperText="Số lượng mẫu dữ liệu cho mỗi lần cập nhật"
            disabled={isLoading}
            className="bg-white"
          />

          <Input
            label="Số epochs"
            name="epochs"
            type="number"
            min={1}
            max={100}
            value={formik.values.epochs}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.epochs && formik.errors.epochs ? formik.errors.epochs as string : undefined}
            helperText="Số lần lặp lại toàn bộ dữ liệu huấn luyện"
            disabled={isLoading}
            className="bg-white"
          />

          <Input
            label="Learning rate"
            name="learningRate"
            type="number"
            step="0.0001"
            min={0.0001}
            max={0.1}
            value={formik.values.learningRate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.learningRate && formik.errors.learningRate ? formik.errors.learningRate as string : undefined}
            helperText="Tốc độ học của mô hình"
            disabled={isLoading}
            className="bg-white"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File weights đã train trước đó
            </label>
            <div className="flex items-center gap-2">
              <Input
                name="pretrainedWeights"
                value={formik.values.pretrainedWeights}
                readOnly
                placeholder="Chọn file weights (tùy chọn)"
                className="bg-white flex-grow"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="shrink-0"
              >
                Chọn
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".h5,.weights,.pt,.pth,.pkl"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Weights từ mô hình đã train trước đó
            </p>
          </div>
        </div>
      </form>

      {/* Nút bắt đầu và dừng huấn luyện */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          type="button"
          onClick={handleStartTraining}
          disabled={isLoading || disabled || isTraining}
          className="w-full py-4 px-6 bg-blue-400 text-white font-medium rounded-md hover:bg-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTraining ? 'Đang huấn luyện...' : 'Bắt đầu huấn luyện'}
        </button>
        <button
          type="button"
          onClick={handleStopTraining}
          disabled={!isTraining}
          className="w-full py-4 px-6 bg-red-400 text-white font-medium rounded-md hover:bg-red-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Dừng huấn luyện
        </button>
      </div>
    </div>
  );
};

export default TrainingConfig; 