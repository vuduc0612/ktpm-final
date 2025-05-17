import axios from 'axios';
import { TrainingConfig, TrainingStatus } from '../types';
import { getCookie } from './cookieService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8881';
const WEBSOCKET_URL = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8888/api/training/ws/training';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động thêm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = getCookie('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// WebSocket Connection Management
let trainingSocket: WebSocket | null = null;

interface WebSocketMessage {
  type: 'status' | 'error' | 'log' | 'raw_log' | 'epoch_progress' | 'metrics' | 'validation';
  status?: 'started' | 'completed' | 'stopped' | 'connected' | 'disconnected';
  progress?: number;
  message?: string;
  data?: unknown;
  content?: string;
  current_epoch?: number;
  total_epochs?: number;
  metrics?: {
    box_loss?: number;
    obj_loss?: number;
    cls_loss?: number;
  };
  class?: string;
  mAP50?: number;
  'mAP50-95'?: number;
}

const messageListeners: Array<(message: WebSocketMessage) => void> = [];

export const connectTrainingWebSocket = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // Đóng kết nối hiện tại nếu có
      if (trainingSocket && trainingSocket.readyState === WebSocket.OPEN) {
        trainingSocket.close();
      }

      // Tạo kết nối mới
      trainingSocket = new WebSocket(WEBSOCKET_URL);

      // Xử lý sự kiện kết nối thành công
      trainingSocket.onopen = () => {
        console.log('Kết nối WebSocket đã được thiết lập');
        resolve(true);
      };

      // Xử lý sự kiện lỗi
      trainingSocket.onerror = (error) => {
        console.error('Lỗi WebSocket:', error);
        resolve(false);
      };

      // Xử lý sự kiện nhận tin nhắn
      trainingSocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          // Gửi tin nhắn tới tất cả các listeners
          messageListeners.forEach(listener => listener(message));
        } catch (error) {
          console.error('Lỗi khi xử lý tin nhắn WebSocket:', error);
        }
      };
      
      // Xử lý sự kiện đóng kết nối
      trainingSocket.onclose = (event) => {
        console.log(`WebSocket đã đóng. Mã: ${event.code}, Lý do: ${event.reason}`);
        
        // Thông báo cho tất cả các listeners rằng kết nối đã đóng
        const disconnectMessage: WebSocketMessage = {
          type: 'status',
          status: 'disconnected',
          message: 'Kết nối WebSocket đã đóng'
        };
        
        messageListeners.forEach(listener => listener(disconnectMessage));
        
        // Tự động kết nối lại sau 5 giây nếu không phải đóng kết nối có chủ ý
        if (!event.wasClean) {
          setTimeout(() => {
            connectTrainingWebSocket()
              .then(connected => {
                console.log('Kết nối lại WebSocket:', connected ? 'thành công' : 'thất bại');
                
                // Nếu kết nối lại thành công, thông báo cho tất cả listeners
                if (connected) {
                  const reconnectedMessage: WebSocketMessage = {
                    type: 'status',
                    status: 'connected',
                    message: 'Đã kết nối lại WebSocket'
                  };
                  messageListeners.forEach(listener => listener(reconnectedMessage));
                }
              })
              .catch(error => {
                console.error('Lỗi khi kết nối lại WebSocket:', error);
              });
          }, 5000);
        }
      };

      // Timeout cho kết nối
      setTimeout(() => {
        if (trainingSocket?.readyState !== WebSocket.OPEN) {
          console.log('Timeout khi kết nối WebSocket');
          resolve(false);
        }
      }, 5000);

    } catch (error) {
      console.error('Lỗi khi tạo kết nối WebSocket:', error);
      resolve(false);
    }
  });
};

export const disconnectTrainingWebSocket = (): void => {
  if (trainingSocket) {
    trainingSocket.close();
    trainingSocket = null;
  }
};

export const addTrainingMessageListener = (listener: (message: WebSocketMessage) => void): (() => void) => {
  messageListeners.push(listener);
  
  // Trả về hàm để xóa listener
  return () => {
    const index = messageListeners.indexOf(listener);
    if (index !== -1) {
      messageListeners.splice(index, 1);
    }
  };
};

// Gửi tin nhắn tới server qua WebSocket
const sendWebSocketMessage = (message: Record<string, unknown>): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!trainingSocket || trainingSocket.readyState !== WebSocket.OPEN) {
      reject(new Error('WebSocket không được kết nối'));
      return;
    }

    try {
      trainingSocket.send(JSON.stringify(message));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

// Bắt đầu huấn luyện qua WebSocket
export const startTrainingViaWebSocket = async (config?: TrainingConfig): Promise<void> => {
  const message = {
    action: 'start_training',
    config: config || {}
  };
  
  await sendWebSocketMessage(message);
};

// Dừng huấn luyện qua WebSocket
export const stopTrainingViaWebSocket = async (): Promise<void> => {
  const message = {
    action: 'stop_training'
  };
  
  await sendWebSocketMessage(message);
};

// REST API Training endpoints
export const startTraining = async (config: TrainingConfig): Promise<{ success: boolean; message: string }> => {
  try {
    // Gửi các tham số cấu hình không gồm file
    const response = await api.post('/api/v1/start', config);
    console.log('Response from startTraining:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi bắt đầu huấn luyện:', error);
    throw error;
  }
};

export const stopTraining = async (): Promise<TrainingStatus> => {
  try {
    const response = await api.post('/api/v1/stop');
    return response.data;
  } catch (error) {
    console.error('Error stopping training:', error);
    throw error;
  }
};

// Tải xuống mô hình đã được huấn luyện
export const downloadTrainedModel = async (): Promise<Blob> => {
  try {
    const response = await api.get('/api/v1/metrics/download', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tải xuống mô hình:', error);
    throw error;
  }
};

// Extraction endpoints
export const extractIdCardInfo = async (imageFile: File, modelType: 'yolo' | 'ocr' = 'yolo') => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('modelType', modelType);

    const response = await api.post('/api/v1/idcard/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Kiểm tra và trả về dữ liệu
    if (response.data) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Lỗi trích xuất thông tin CCCD');
    }
  } catch (error) {
    console.error('Lỗi khi trích xuất thông tin CCCD:', error);
    throw error;
  }
};

// Định nghĩa interface cho dữ liệu CCCD từ API
export interface ExtractedData {
  id?: string;
  name?: string;
  dob?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  place_of_birth?: string;
  expire_date?: string;
  image_avt?: string;
}

// Lưu thông tin CCCD
export const saveIdCardInfo = async (idCardData: ExtractedData, userId: number = 1) => {
  try {
    console.log('Gọi API lưu thông tin CCCD:', {
      endpoint: `/api/v1/idcard/save?userId=${userId}`,
      data: idCardData
    });
    
    const response = await api.post(`/api/v1/idcard/save?userId=${userId}`, idCardData);
    
    // Kiểm tra và trả về dữ liệu
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi lưu thông tin CCCD');
    }
  } catch (error) {
    console.error('Lỗi khi lưu thông tin CCCD:', error);
    throw error;
  }
};

// Authentication endpoints
export const login = async (username: string, password: string): Promise<{
  success: boolean;
  message: string;
  user?: {
    userId: number;
    email: string;
    username: string;
  };
  token?: string;
}> => {
  try {
    const response = await api.post('/api/v1/auth/login', {
      username,
      password
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    throw error;
  }
};

export default api; 