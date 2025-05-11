import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTraining } from '../contexts/TrainingContext';
import TrainingConfig from '../components/training/TrainingConfig';
import TrainingLog from '../components/training/TrainingLog';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import { TrainingConfig as TrainingConfigType } from '../types';
import { startTraining } from '../services/api';
import { 
  uploadWeightsFile, 
  StoredFileInfo,
  uploadYoloDataset,
  YoloDatasetItem,
  deleteYoloDataset
} from '../services/fileUploadService';

const TrainingPage = () => {
  const {
    trainingData,
    isTraining,
    isLoading,
    error,
    stopTraining,
  } = useTraining();

  const yoloDatasetInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [trainingFiles, setTrainingFiles] = useState<StoredFileInfo[]>([]);
  const [fileCount, setFileCount] = useState({ images: 0, annotations: 0 });

  const handleYoloDatasetUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setLocalError(null);
      
      const allFiles = Array.from(files);
      
      // Phân loại file: ảnh và annotation
      const imageFiles = allFiles.filter(file => 
        file.type.startsWith('image/') || 
        ['.jpg', '.jpeg', '.png', '.bmp', '.webp'].some(ext => file.name.toLowerCase().endsWith(ext))
      );
      
      const txtFiles = allFiles.filter(file => 
        file.name.endsWith('.txt') || file.type === 'text/plain'
      );

      // Thông báo nếu không có file phù hợp
      if (imageFiles.length === 0) {
        setLocalError('Không tìm thấy file ảnh hợp lệ trong selection. Vui lòng chọn các file ảnh .jpg, .jpeg, .png');
        setUploading(false);
        if (yoloDatasetInputRef.current) {
          yoloDatasetInputRef.current.value = '';
        }
        return;
      }
      
      // Tạo map từ tên file (không có đuôi) đến file txt tương ứng
      const txtMap = new Map<string, File>();
      for (const txtFile of txtFiles) {
        const baseName = txtFile.name.substring(0, txtFile.name.lastIndexOf('.'));
        txtMap.set(baseName, txtFile);
      }
      
      // Ghép cặp file ảnh và annotation
      const yoloDataset: YoloDatasetItem[] = [];
      const unmatchedImages: string[] = [];
      
      for (const imageFile of imageFiles) {
        // Tìm file txt tương ứng (bỏ đuôi của file ảnh)
        const imageBaseName = imageFile.name.substring(0, imageFile.name.lastIndexOf('.'));
        const annotationFile = txtMap.get(imageBaseName);
        
        yoloDataset.push({
          imageFile,
          annotationFile
        });
        
        // Lưu các ảnh không có file annotation tương ứng
        if (!annotationFile) {
          unmatchedImages.push(imageFile.name);
        }
      }
      
      // Nếu không có cặp nào, báo lỗi
      if (yoloDataset.length === 0) {
        setLocalError('Không tìm thấy file ảnh hoặc cặp file ảnh + annotation hợp lệ');
        setUploading(false);
        if (yoloDatasetInputRef.current) {
          yoloDatasetInputRef.current.value = '';
        }
        return;
      }

      // Hiển thị cảnh báo về số lượng file ảnh không có annotation
      if (unmatchedImages.length > 0) {
        console.warn(`Có ${unmatchedImages.length}/${imageFiles.length} ảnh không có file annotation tương ứng`);
        // Nếu toàn bộ ảnh đều không có annotation, hiển thị cảnh báo chi tiết
        
      }
      
      // Thông báo đang tải lên
      console.log(`Đang tải lên ${yoloDataset.length} file (${imageFiles.length} ảnh, ${txtFiles.length} annotation)`);
      
      // Tải lên dataset
      try {
        const uploadResult = await uploadYoloDataset(yoloDataset);
        
        if (uploadResult.success) {
          // Cập nhật thông tin trực quan trên frontend - không query lại server
          // Cộng dồn với số lượng file hiện tại đã có
          const newImageCount = fileCount.images + imageFiles.length;
          const newAnnotationCount = fileCount.annotations + (imageFiles.length - unmatchedImages.length);
          
          setFileCount({
            images: newImageCount,
            annotations: newAnnotationCount
          });
          
          // Cập nhật danh sách file trực quan (tạo thông tin giả cho frontend)
          const newTrainingFiles = [...trainingFiles];
          
          yoloDataset.forEach(item => {
            newTrainingFiles.push({
              fileName: item.imageFile.name,
              filePath: item.imageFile.name, // Đường dẫn giả
              fileType: item.imageFile.type,
              fileSize: item.imageFile.size,
              uploadedAt: new Date().toISOString(),
              hasAnnotation: !!item.annotationFile,
            });
          });
          
          setTrainingFiles(newTrainingFiles);
        } else {
          setLocalError(uploadResult.message || 'Có lỗi xảy ra khi tải dataset YOLO lên');
        }
      } catch (uploadError) {
        console.error('Lỗi khi tải lên dataset:', uploadError);
        if (typeof uploadError === 'object' && uploadError !== null) {
          // Nếu là đối tượng lỗi từ API
          const errorObj = uploadError as { message?: string, failedFiles?: Array<{fileName: string, error: string}> };
          if (errorObj.message) {
            setLocalError(errorObj.message);
          } else {
            setLocalError('Lỗi không xác định khi tải dataset YOLO');
          }
        } else {
          setLocalError('Lỗi không xác định khi tải dataset YOLO');
        }
      }
    } catch (error) {
      console.error('Lỗi khi xử lý YOLO dataset:', error);
      setLocalError('Có lỗi xảy ra khi tải dataset YOLO. Vui lòng thử lại.');
    } finally {
      setUploading(false);
      if (yoloDatasetInputRef.current) {
        yoloDatasetInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAllFiles = async () => {
    try {
      setLocalError(null);
      setUploading(true);
      
      // Gọi API để xóa toàn bộ dataset
      const result = await deleteYoloDataset();
      
      if (!result.success) {
        // Nếu có lỗi từ API, hiển thị lỗi 
        console.warn('Có lỗi khi xóa dataset trên server:', result.message);
        setLocalError(`Có lỗi khi xóa dataset: ${result.message}`);
      }
      
      // Reset state trên frontend
      setTrainingFiles([]);
      setFileCount({ images: 0, annotations: 0 });
      
    } catch (error) {
      console.error('Lỗi khi xóa tất cả file:', error);
      setLocalError('Có lỗi xảy ra khi xóa dataset. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleStartTraining = async (config: TrainingConfigType, weightsFile?: File) => {
    try {
      setLocalError(null);
      console.log('Training config', config);
      // Kiểm tra xem đã có dataset chưa
      if (trainingFiles.length === 0) {
        setLocalError('Vui lòng tải lên dataset huấn luyện trước khi bắt đầu');
        return;
      }
      
      // Kiểm tra xem có đủ file annotation không
      if (fileCount.annotations === 0) {
        setLocalError('Dataset không có file annotation nào. Vui lòng tải lên dataset có các file annotation đi kèm.');
        return;
      }
      
      // Thông báo nếu chỉ có một phần file có annotation
      if (fileCount.annotations < fileCount.images) {
        // Chỉ là cảnh báo, vẫn cho phép tiếp tục
        console.warn(`Chỉ có ${fileCount.annotations}/${fileCount.images} ảnh có file annotation.`);
      }
      
      // Tải lên file weights nếu có
      if (weightsFile) {
        try {
          const uploadResult = await uploadWeightsFile(weightsFile);
          if (uploadResult.success) {
            // Chỉ lưu tên file weights, không tải lên lại file
            config.pretrainedWeights = uploadResult.filePath;
          } else {
            setLocalError(`Không thể tải lên file weights: ${uploadResult.message || 'Lỗi không xác định'}`);
            return;
          }
        } catch (error) {
          console.error('Lỗi khi tải lên file weights:', error);
          setLocalError('Không thể tải lên file weights. Vui lòng thử lại.');
          return;
        }
      } else {
        // Nếu không có file weights, đặt giá trị là undefined
        config.pretrainedWeights = undefined;
      }

      // Thêm thông báo log
      console.log('Bắt đầu huấn luyện với cấu hình:', config);

      // Gọi API để bắt đầu huấn luyện
      try {
        await startTraining(config);
        // Không cần gọi startTrainingContext nữa
      } catch (error) {
        console.error('Lỗi khi bắt đầu huấn luyện:', error);
        setLocalError(error instanceof Error ? error.message : 'Lỗi không xác định khi bắt đầu huấn luyện');
      }
    } catch (error) {
      console.error('Lỗi khi bắt đầu huấn luyện:', error);
      setLocalError(error instanceof Error ? error.message : 'Lỗi không xác định khi bắt đầu huấn luyện');
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Huấn luyện mô hình nhận dạng</h1>
        </div>

        {(error || localError) && (
          <Alert
            type="error"
            title="Lỗi"
            onClose={() => {
              setLocalError(null);
            }}
            className="mt-4"
          >
            {error || localError}
          </Alert>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Phần dữ liệu huấn luyện */}
          <div>
            <Card title="Dữ liệu huấn luyện">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Dataset YOLO</h3>
                    <p className="text-sm text-gray-500">
                      Tải lên cặp file ảnh và annotation
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="primary"
                      onClick={() => yoloDatasetInputRef.current?.click()}
                      disabled={isLoading || isTraining || uploading}
                    >
                      {uploading ? 'Đang tải...' : 'Tải YOLO dataset'}
                    </Button>
                    {trainingFiles.length > 0 && (
                      <Button
                        variant="danger"
                        onClick={handleDeleteAllFiles}
                        disabled={isLoading || isTraining || uploading}
                      >
                        Xóa tất cả
                      </Button>
                    )}
                    <input
                      ref={yoloDatasetInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.txt"
                      className="hidden"
                      onChange={handleYoloDatasetUpload}
                      disabled={isLoading || isTraining || uploading}
                      multiple
                    />
                  </div>
                </div>
              </div>

              {/* Hiển thị hướng dẫn sử dụng YOLO format */}
              <div className="mb-4 bg-blue-50 p-4 rounded-md border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Hướng dẫn chuẩn bị YOLO dataset</h4>
                <ol className="text-sm text-blue-700 list-decimal pl-5 space-y-2">
                  <li>
                    <div className="font-medium">Chuẩn bị ảnh CCCD</div>
                    <p>Thu thập ảnh CCCD với nhiều góc độ, điều kiện ánh sáng khác nhau để đảm bảo mô hình nhận diện tốt.</p>
                  </li>
                  <li>
                    <div className="font-medium">Sử dụng LabelImg để gán nhãn</div>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Tải và cài đặt <a href="https://github.com/tzutalin/labelImg" target="_blank" rel="noopener noreferrer" className="underline">LabelImg</a></li>
                      <li>Trong LabelImg, chọn "View → Auto Save mode" và "Change Save format → YOLO"</li>
                      <li>Với mỗi ảnh, vẽ bounding box cho 4 góc của CCCD, đánh nhãn tương ứng: top_left (0), top_right (1), bottom_left (2), bottom_right (3)</li>
                    </ul>
                  </li>
                  <li>
                    <div className="font-medium">Định dạng file annotation YOLO</div>
                    <p>Mỗi dòng trong file .txt có định dạng: <code className="px-1 py-0.5 bg-blue-100 rounded">class_id x_center y_center width height</code></p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>class_id: 0-3 tương ứng với 4 góc CCCD</li>
                      <li>x_center, y_center: tọa độ trung tâm của góc, chuẩn hóa từ 0-1</li>
                      <li>width, height: chiều rộng và chiều cao của bounding box, chuẩn hóa từ 0-1</li>
                    </ul>
                  </li>
                  <li>
                    <div className="font-medium">Tổ chức cặp file</div>
                    <p>Mỗi ảnh phải có một file .txt cùng tên (ví dụ: image1.jpg và image1.txt)</p>
                  </li>
                  <li>
                    <div className="font-medium">Tải lên dataset</div>
                    <p>Chọn tất cả file ảnh và file .txt annotation, hệ thống sẽ tự động ghép cặp dựa trên tên file</p>
                  </li>
                </ol>
              </div>

              {/* Hiển thị thông tin dataset */}
              <div className="mt-6">
                {trainingFiles.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-base font-medium text-gray-700 mb-2">Thông tin dataset:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white rounded-md shadow-sm">
                        <div className="text-sm text-gray-500">Số lượng ảnh</div>
                        <div className="text-lg font-semibold text-blue-600">{fileCount.images}</div>
                      </div>
                      <div className="p-3 bg-white rounded-md shadow-sm">
                        <div className="text-sm text-gray-500">Số lượng annotation</div>
                        <div className="text-lg font-semibold text-green-600">{fileCount.annotations}</div>
                      </div>
                    </div>
                    
                    {/* Hiển thị tỷ lệ ảnh có annotation */}
                    {fileCount.images > 0 && (
                      <div className="mt-4">
                        <div className="mb-2 flex justify-between items-center">
                          <span className="text-sm text-gray-600">Tỷ lệ ảnh có annotation</span>
                          <span className="text-sm font-medium">
                            {Math.round((fileCount.annotations / fileCount.images) * 100)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${fileCount.annotations === fileCount.images ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${(fileCount.annotations / fileCount.images) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Thông báo trạng thái dataset */}
                    <div className="mt-4">
                      {fileCount.annotations === 0 ? (
                        <div className="bg-red-50 p-3 rounded-md border border-red-100">
                          <p className="text-sm text-red-700">
                            <span className="font-medium">Cảnh báo:</span> Dataset không có annotation nào. 
                            Vui lòng tải lên các file annotation (.txt) tương ứng với từng ảnh để huấn luyện.
                          </p>
                        </div>
                      ) : fileCount.annotations < fileCount.images ? (
                        <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100">
                          <p className="text-sm text-yellow-700">
                            <span className="font-medium">Lưu ý:</span> Dataset chứa {fileCount.images} ảnh, trong đó chỉ có {fileCount.annotations} ảnh có file annotation đi kèm. 
                            Có {fileCount.images - fileCount.annotations} ảnh không có annotation sẽ không được sử dụng trong quá trình huấn luyện.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-green-50 p-3 rounded-md border border-green-100">
                          <p className="text-sm text-green-700">
                            <span className="font-medium">Tốt:</span> Tất cả ảnh đều có file annotation đi kèm. 
                            Dataset đã sẵn sàng cho quá trình huấn luyện.
                          </p>
                        </div>
                      )}
                    </div>
                    
                   
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
                  <p className="text-gray-500">
                      Chưa có dataset nào được tải lên. Vui lòng tải lên dataset YOLO.
                  </p>
                </div>
              )}
              </div>
            </Card>
          </div>

          {/* Phần cấu hình huấn luyện */}
          <div>
            <Card title="Cấu hình huấn luyện">
              <TrainingConfig
                onSubmit={handleStartTraining}
                isLoading={isLoading || isTraining || uploading}
                onStopTraining={stopTraining}
                isTraining={isTraining}
                disabled={trainingFiles.length === 0}
              />
            </Card>
          </div>
        </div>

        {/* Thêm log huấn luyện ở dưới, sử dụng toàn bộ chiều rộng */}
        <div className="mt-6">
          <TrainingLog
            className="log-container"
          />
        </div>

        {/* Thêm phần kết quả huấn luyện */}
        {trainingData.status === 'completed' && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Kết quả huấn luyện</h2>
              <Link to="/training/results">
                <Button variant="secondary">
                  Xem chi tiết kết quả
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingPage; 