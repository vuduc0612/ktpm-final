import axios from 'axios';

const API_BASE_URL = 'http://localhost:8881';

// Interface cho kết quả tải lên file
export interface UploadResult {
  success: boolean;
  filePath: string;
  fileName: string;
  message?: string;
}

// Interface cho kết quả tải lên nhiều file
export interface MultiUploadResult {
  success: boolean;
  files: {
    filePath: string;
    fileName: string;
  }[];
  failedFiles: {
    fileName: string;
    error: string;
  }[];
  message?: string;
}

// Interface cho thông tin file lưu trữ
export interface StoredFileInfo {
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  dataUrl?: string; // Base64 data URL để hiển thị hình ảnh
  hasAnnotation?: boolean; // Có file annotation đi kèm không
  annotationPath?: string; // Đường dẫn tới file annotation
}

// Interface cho YOLO dataset item
export interface YoloDatasetItem {
  imageFile: File;
  annotationFile?: File;
}

/**
 * Tải lên cặp file (ảnh và annotation) cho YOLO
 * @param datasetItems Mảng các cặp file ảnh và annotation
 * @returns Kết quả việc tải lên
 */
export const uploadYoloDataset = async (datasetItems: YoloDatasetItem[]): Promise<MultiUploadResult> => {
  try {
    // Tạo FormData để gửi lên API
    const formData = new FormData();
    
    // Thu thập tất cả các file (cả ảnh và annotation) vào một mảng duy nhất
    const allFiles: File[] = [];
    
    datasetItems.forEach(item => {
      // Thêm file ảnh
      allFiles.push(item.imageFile);
      
      // Thêm file annotation nếu có
      if (item.annotationFile) {
        allFiles.push(item.annotationFile);
      }
    });
    
    // Thêm tất cả các file vào tham số "files"
    allFiles.forEach(file => {
      formData.append(`files`, file);
    });

    // Gọi API để tải lên dataset
    const response = await axios.post(`${API_BASE_URL}/api/v1/upload/dataset-yolo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Chuyển đổi kết quả từ API sang định dạng MultiUploadResult
    const data = response.data;
    const result: MultiUploadResult = {
      success: data.success === true,
      files: [], // API không trả về thông tin chi tiết về từng file
      failedFiles: [],
      message: data.message || 'Tải lên thành công'
    };
    
    // Thêm thông tin tóm tắt
    if (data.filesUploaded !== undefined && data.totalFiles !== undefined) {
      result.message = `Đã tải lên ${data.filesUploaded}/${data.totalFiles} file thành công`;
    }
    
    return result;
  } catch (error) {
    console.error('Lỗi khi tải lên dataset YOLO:', error);
    // Tạo đối tượng lỗi để trả về
    const errorResult: MultiUploadResult = {
      success: false,
      files: [],
      failedFiles: datasetItems.map(item => ({
        fileName: item.imageFile.name,
        error: error instanceof Error ? error.message : 'Lỗi không xác định khi tải dataset'
      })),
      message: error instanceof Error ? error.message : 'Lỗi không xác định khi tải dataset'
    };
    throw errorResult;
  }
};

/**
 * Tải lên file weights cho mô hình
 * @param file File weights cần tải lên
 * @returns Kết quả việc tải lên
 */
export const uploadWeightsFile = async (file: File): Promise<UploadResult> => {
  try {
    // Tạo FormData để gửi lên API
    const formData = new FormData();
    formData.append('file', file);

    // Gọi API để tải lên file weights
    const response = await axios.post(`${API_BASE_URL}/api/v1/upload/weight-yolo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Chuyển đổi kết quả
    const data = response.data;
    return {
      success: data.success === true,
      filePath: data.filePath || '',
      fileName: file.name,
      message: data.message || 'Tải lên thành công'
    };
  } catch (error) {
    console.error('Lỗi khi tải lên file weights:', error);
    // Tạo đối tượng lỗi để trả về
    const errorResult: UploadResult = {
      success: false,
      filePath: '',
      fileName: file.name,
      message: error instanceof Error ? error.message : 'Lỗi không xác định khi tải file weights'
    };
    throw errorResult;
  }
};

/**
 * Xóa toàn bộ YOLO dataset đã tải lên
 * @returns Kết quả việc xóa
 */
export const deleteYoloDataset = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // Gọi API để xóa toàn bộ dataset
    const response = await axios.delete(`${API_BASE_URL}/api/v1/upload/dataset-yolo`);
    
    return {
      success: response.data.success === true,
      message: response.data.message || 'Xóa dataset thành công'
    };
  } catch (error) {
    console.error('Lỗi khi xóa YOLO dataset:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi không xác định khi xóa dataset'
    };
  }
}; 