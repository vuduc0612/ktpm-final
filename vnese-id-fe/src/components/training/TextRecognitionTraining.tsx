import React, { useState, useRef } from 'react';
import { useTraining } from '../../contexts/TrainingContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const TextRecognitionTraining: React.FC = () => {
  const { 
    startTraining, 
    stopTraining, 
    isTraining, 
    trainingData,
    trainingLogs,
    webSocketConnected,
    reconnectWebSocket,
    isLoading
  } = useTraining();

  // Tính toán progress từ currentEpoch và totalEpochs
  const progress = trainingData.totalEpochs > 0 
    ? (trainingData.currentEpoch / trainingData.totalEpochs) * 100 
    : 0;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const weightsFileInputRef = useRef<HTMLInputElement>(null);
  const [datasetPath] = useState<string>('/data/ocr_dataset');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [pretrainedWeights, setPretrainedWeights] = useState<string>('');
  
  // Cấu hình huấn luyện
  const [batchSize, setBatchSize] = useState<number>(32);
  const [epochs, setEpochs] = useState<number>(30);
  const [learningRate, setLearningRate] = useState<number>(0.001);
  const [imageHeight, setImageHeight] = useState<number>(32);
  const [imageWidth, setImageWidth] = useState<number>(256);
  const [augmentation] = useState<boolean>(true);
  const [language] = useState<string>('vietnamese');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const handleWeightsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPretrainedWeights(file.name);
    }
  };

  const handleStartTraining = async () => {
    if (!datasetPath && uploadedFiles.length === 0) {
      // Hiển thị cảnh báo nếu chưa chọn dataset
      return;
    }

    // Chuyển đổi parameters thành định dạng config cho API
    const config = {
      batchSize: batchSize,
      epochs: epochs,
      learningRate: learningRate,
      modelName: 'ocr_model',
      pretrainedWeights: pretrainedWeights || undefined,
      dataPath: datasetPath
    };

    try {
      await startTraining(config);
    } catch (err) {
      console.error('Lỗi khi bắt đầu huấn luyện:', err);
    }
  };

  const handleStopTraining = async () => {
    try {
      await stopTraining();
    } catch (err) {
      console.error('Lỗi khi dừng huấn luyện:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cột bên trái: Dữ liệu huấn luyện */}
        <div>
          <Card title="Dữ liệu huấn luyện">
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Ảnh huấn luyện OCR</h3>
                    <p className="text-sm text-gray-500">
                      Dữ liệu văn bản đã gán nhãn
                    </p>
                  </div>
                  <div>
                    <Button
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading || isTraining}
                    >
                      Tải lên dữ liệu
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".zip,.txt,.jpg,.jpeg,.png"
                      disabled={isLoading || isTraining}
                    />
                  </div>
                </div>
              </div>
              
              {/* Hiển thị hướng dẫn chuẩn bị dữ liệu OCR */}
              <div className="mb-4 bg-blue-50 p-4 rounded-md border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Hướng dẫn chuẩn bị dữ liệu OCR</h4>
                <ol className="text-sm text-blue-700 list-decimal pl-5 space-y-1">
                  <li>Mỗi ảnh cần một tệp txt tương ứng chứa văn bản</li>
                  <li>Đặt tên tệp txt giống với tên ảnh (vd: id_card_001.jpg và id_card_001.txt)</li>
                  <li>Mỗi dòng trong tệp txt tương ứng với một dòng văn bản trong ảnh</li>
                  <li>Dữ liệu nên được chia thành thư mục train, val, test</li>
                </ol>
              </div>
              
              {/* Hiển thị tệp đã tải lên hoặc thông báo chưa có tệp */}
              {uploadedFiles.length > 0 ? (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Đã tải lên ({uploadedFiles.length} tệp)</h4>
                  <div className="max-h-36 overflow-y-auto text-xs border border-dashed border-gray-300 rounded-md p-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="py-1 px-2 bg-gray-50 rounded mb-1 flex justify-between">
                        <span className="truncate">{file.name}</span>
                        <span className="text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
                  <p className="text-gray-500">
                    Chưa có dữ liệu huấn luyện. Vui lòng tải lên dữ liệu mới.
                  </p>
                </div>
              )}
              
              
            </div>
          </Card>
        </div>
        
        {/* Cột bên phải: Cấu hình huấn luyện */}
        <div>
          <Card title="Cấu hình huấn luyện">
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Batch Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kích thước batch
                  </label>
                  <input
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    min={1}
                    max={128}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                    disabled={isTraining}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Số lượng mẫu trong mỗi batch
                  </p>
                </div>
                
                {/* Epochs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số epochs
                  </label>
                  <input
                    type="number"
                    value={epochs}
                    onChange={(e) => setEpochs(Number(e.target.value))}
                    min={1}
                    max={1000}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                    disabled={isTraining}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Số lần lặp lại toàn bộ dữ liệu huấn luyện
                  </p>
                </div>
                
                {/* Learning Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Learning rate
                  </label>
                  <input
                    type="number"
                    value={learningRate}
                    onChange={(e) => setLearningRate(Number(e.target.value))}
                    min={0.0001}
                    max={0.1}
                    step={0.0001}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                    disabled={isTraining}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Tốc độ học của mô hình
                  </p>
                </div>
                
                {/* Image Height & Width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kích thước ảnh đầu vào
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={imageHeight}
                      onChange={(e) => setImageHeight(Number(e.target.value))}
                      min={16}
                      max={128}
                      placeholder="Height"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                      disabled={isTraining}
                    />
                    <input
                      type="number"
                      value={imageWidth}
                      onChange={(e) => setImageWidth(Number(e.target.value))}
                      min={64}
                      max={512}
                      placeholder="Width"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                      disabled={isTraining}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Chiều cao x Chiều rộng (pixel)
                  </p>
                </div>
                
              </div>
              
              {/* Pretrained Weights */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weights đã train trước đó
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pretrainedWeights}
                    readOnly
                    placeholder="Chọn file weights (tùy chọn)"
                    className="flex-grow block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm bg-white"
                    disabled={isTraining}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => weightsFileInputRef.current?.click()}
                    disabled={isLoading || isTraining}
                    className="shrink-0"
                  >
                    Chọn
                  </Button>
                  <input
                    ref={weightsFileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleWeightsFileChange}
                    accept=".h5,.weights,.pt,.pth,.pkl"
                    disabled={isLoading || isTraining}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Weights từ mô hình đã train trước đó
                </p>
              </div>
              
              {/* Nút điều khiển huấn luyện */}
              <div className="mt-6 flex items-center justify-between">
                {!webSocketConnected ? (
                  <div className="w-full">
                    <Alert type="warning" title="Mất kết nối" onClose={() => {}}>
                      Không thể kết nối tới máy chủ huấn luyện
                    </Alert>
                    <Button
                      variant="primary"
                      onClick={reconnectWebSocket}
                      disabled={isLoading}
                      className="mt-4 w-full"
                    >
                      Kết nối lại với máy chủ
                    </Button>
                  </div>
                ) : (
                  <div className="w-full flex flex-col space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className={`h-3 w-3 rounded-full ${webSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm">{webSocketConnected ? 'Đã kết nối tới máy chủ' : 'Mất kết nối'}</span>
                    </div>
                    <div className="flex space-x-4">
                      <Button
                        variant="primary"
                        onClick={handleStartTraining}
                        disabled={isLoading || isTraining}
                        className="flex-1"
                      >
                        Bắt đầu huấn luyện
                      </Button>
                      <Button
                        variant="danger"
                        onClick={handleStopTraining}
                        disabled={isLoading || !isTraining}
                        className="flex-1"
                      >
                        Dừng huấn luyện
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Training Logs */}
      <Card title="Logs huấn luyện">
        <div className="p-4">
          <div className="bg-black rounded-lg p-4 h-60 overflow-y-auto">
            <pre className="text-green-400 text-xs font-mono">
              {trainingLogs.length > 0 
                ? trainingLogs.join('\n') 
                : 'Chưa có logs huấn luyện. Bắt đầu huấn luyện để xem logs.'}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TextRecognitionTraining; 