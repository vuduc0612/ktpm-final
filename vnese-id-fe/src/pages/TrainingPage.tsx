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
import { stopTraining } from '../services/api';
import { 
  uploadWeightsFile, 
  StoredFileInfo,
  uploadYoloDataset,
  YoloDatasetItem,
  deleteYoloDataset,
} from '../services/fileUploadService';

const TrainingPage = () => {
  const {
    trainingData,
    isTraining,
    isLoading,
    error,
  } = useTraining();

  const yoloDatasetInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [trainingFiles, setTrainingFiles] = useState<StoredFileInfo[]>([]);
  const [fileCount, setFileCount] = useState({ images: 0, annotations: 0 });
  const [previewImages, setPreviewImages] = useState<{ [key: string]: string }>({});
  const [annotationContents, setAnnotationContents] = useState<{ [key: string]: string }>({});
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [pendingUploadFiles, setPendingUploadFiles] = useState<YoloDatasetItem[]>([]);

  const handleYoloDatasetUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
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

      // Đọc nội dung các file annotation
      const newAnnotationContents: { [key: string]: string } = {};
      for (const txtFile of txtFiles) {
        const content = await txtFile.text();
        const baseName = txtFile.name.substring(0, txtFile.name.lastIndexOf('.'));
        newAnnotationContents[baseName] = content;
      }
      setAnnotationContents(prev => ({ ...prev, ...newAnnotationContents }));

      // Thông báo nếu không có file phù hợp
      if (imageFiles.length === 0) {
        setLocalError('Không tìm thấy file ảnh hợp lệ trong selection. Vui lòng chọn các file ảnh .jpg, .jpeg, .png');
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
        if (yoloDatasetInputRef.current) {
          yoloDatasetInputRef.current.value = '';
        }
        return;
      }

      // Hiển thị cảnh báo về số lượng file ảnh không có annotation
      if (unmatchedImages.length > 0) {
        console.warn(`Có ${unmatchedImages.length}/${imageFiles.length} ảnh không có file annotation tương ứng`);
      }
      
      // Thông báo đang tải lên
      console.log(`Đang tải lên ${yoloDataset.length} file (${imageFiles.length} ảnh, ${txtFiles.length} annotation)`);
      
      // Tạo preview URL cho các ảnh
      const newPreviewImages: { [key: string]: string } = {};
      imageFiles.forEach(file => {
        newPreviewImages[file.name] = URL.createObjectURL(file);
      });
      setPreviewImages(prev => ({ ...prev, ...newPreviewImages }));
      
      // Lưu các file vào pending upload
      setPendingUploadFiles(prev => [...prev, ...yoloDataset]);
      
      // Cập nhật thông tin trực quan trên frontend
      const newImageCount = fileCount.images + imageFiles.length;
      const newAnnotationCount = fileCount.annotations + (imageFiles.length - unmatchedImages.length);
      
      setFileCount({
        images: newImageCount,
        annotations: newAnnotationCount
      });
      
      // Cập nhật danh sách file trực quan
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

    } catch (error) {
      console.error('Lỗi khi xử lý YOLO dataset:', error);
      setLocalError('Có lỗi xảy ra khi tải dataset YOLO. Vui lòng thử lại.');
    } finally {
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
      // Xóa tất cả preview URL
      Object.values(previewImages).forEach(url => URL.revokeObjectURL(url));
      setPreviewImages({});
      
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

      setUploading(true);
      
      // Lọc các file đang chờ upload theo danh sách đã chọn
      const selectedPendingFiles = pendingUploadFiles.filter(item => 
        selectedImages.has(item.imageFile.name)
      );

      // Upload các file đã chọn
      if (selectedPendingFiles.length > 0) {
        try {
          const uploadResult = await uploadYoloDataset(selectedPendingFiles);
          if (!uploadResult.success) {
            setLocalError(uploadResult.message || 'Có lỗi xảy ra khi tải dataset YOLO lên');
            return;
          }
          // Reset pending files sau khi upload thành công
          setPendingUploadFiles([]);
        } catch (error) {
          console.error('Lỗi khi tải lên dataset:', error);
          setLocalError('Không thể tải lên dataset. Vui lòng thử lại.');
          return;
        }
      } else if (selectedImages.size === 0) {
        setLocalError('Vui lòng chọn ít nhất một ảnh để huấn luyện');
        return;
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

      console.log('Bắt đầu huấn luyện với cấu hình:', config);

      try {
        await startTraining(config);
      } catch (error) {
        console.error('Lỗi khi bắt đầu huấn luyện:', error);
        setLocalError(error instanceof Error ? error.message : 'Lỗi không xác định khi bắt đầu huấn luyện');
      }
    } catch (error) {
      console.error('Lỗi khi bắt đầu huấn luyện:', error);
      setLocalError(error instanceof Error ? error.message : 'Lỗi không xác định khi bắt đầu huấn luyện');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedImages(new Set(trainingFiles.map(file => file.fileName)));
    } else {
      setSelectedImages(new Set());
    }
  };

  const handleSelectImage = (fileName: string, checked: boolean) => {
    const newSelected = new Set(selectedImages);
    if (checked) {
      newSelected.add(fileName);
    } else {
      newSelected.delete(fileName);
    }
    setSelectedImages(newSelected);
  };

  const handleDeleteSelected = async () => {
    setSelectedImages(new Set());
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

             

              {/* Hiển thị thông tin dataset */}
              <div className="mt-6">
                {trainingFiles.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-base font-medium text-gray-700">Thông tin dataset:</h4>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedImages.size === trainingFiles.length}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">Chọn tất cả</span>
                        </label>
                        {selectedImages.size > 0 && (
                          <Button
                            variant="danger"
                            onClick={handleDeleteSelected}
                            disabled={isLoading || isTraining || uploading}
                          >
                            Bỏ chọn ({selectedImages.size})
                          </Button>
                        )}
                      </div>
                    </div>
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
                    
                    {/* Hiển thị grid ảnh */}
                    <div className="mt-4">
                      <h4 className="text-base font-medium text-gray-700 mb-2">Ảnh đã tải lên:</h4>
                      <div className="grid grid-cols-1 gap-6">
                        {trainingFiles.map((file) => {
                          const baseName = file.fileName.substring(0, file.fileName.lastIndexOf('.'));
                          const annotationContent = annotationContents[baseName];
                          
                          return (
                            <div key={file.fileName} className="bg-white rounded-lg shadow-sm p-4">
                              <div className="flex gap-4">
                                {/* Checkbox chọn ảnh */}
                                <div className="flex items-start pt-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedImages.has(file.fileName)}
                                    onChange={(e) => handleSelectImage(file.fileName, e.target.checked)}
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                  />
                                </div>
                                {/* Phần ảnh */}
                                <div className="w-1/3">
                                  {previewImages[file.fileName] && (
                                    <div className="relative">
                                      <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-100">
                                        <img
                                          src={previewImages[file.fileName]}
                                          alt={file.fileName}
                                          className="w-full h-full object-cover"
                                        />

                                      </div>
                                      <div className="mt-2">
                                        <p className="text-sm text-gray-500 truncate">{file.fileName}</p>
                                        {file.hasAnnotation ? (
                                          <span className="inline-block mt-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                                            Có annotation
                                          </span>
                                        ) : (
                                          <span className="inline-block mt-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                                            Chưa có annotation
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Phần nội dung annotation */}
                                <div className="w-2/3">
                                  {file.hasAnnotation && annotationContent ? (
                                    <div className="h-full">
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">Nội dung annotation:</h5>
                                      <div className="bg-gray-50 rounded-lg p-3 h-full overflow-y-auto">
                                        <pre className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                                          {annotationContent}
                                        </pre>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-full flex items-center justify-center">
                                      <p className="text-gray-500 text-sm">
                                        {file.hasAnnotation ? 'Không có nội dung annotation' : 'Chưa có file annotation'}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
                onStopTraining={async () => {
                  await stopTraining();
                }}
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