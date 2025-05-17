import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TrainingConfig } from '../types';
import { 
  connectTrainingWebSocket, 
  disconnectTrainingWebSocket, 
  addTrainingMessageListener,
} from '../services/api';

interface TrainingContextData {
  currentEpoch: number;
  totalEpochs: number;
  metrics: {
    box_loss?: number;
    obj_loss?: number;
    cls_loss?: number;
    mAP50?: number;
    mAP5095?: number;
    [key: string]: number | undefined;
  };
  status: 'idle' | 'training' | 'completed' | 'failed';
}

interface TrainingContextType {
  trainingData: TrainingContextData;
  isTraining: boolean;
  isLoading: boolean;
  error: string | null;
  trainingLogs: string[];
  webSocketConnected: boolean;
  // startTraining: (config: TrainingConfig) => Promise<void>;
  // stopTraining: () => Promise<void>;
  reconnectWebSocket: () => Promise<void>;
}

const initialContextData: TrainingContextData = {
  currentEpoch: 0,
  totalEpochs: 0,
  metrics: {},
  status: 'idle',
};

const TrainingContext = createContext<TrainingContextType>({
  trainingData: initialContextData,
  isTraining: false,
  isLoading: false,
  error: null,
  trainingLogs: [],
  webSocketConnected: false,
  // startTraining: async () => {},
  // stopTraining: async () => {},
  reconnectWebSocket: async () => {},
});

export const useTraining = () => useContext(TrainingContext);

interface TrainingProviderProps {
  children: ReactNode;
}

export const TrainingProvider: React.FC<TrainingProviderProps> = ({ children }) => {
  const [trainingData, setTrainingData] = useState<TrainingContextData>(initialContextData);
  const [isTraining, setIsTraining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [webSocketConnected, setWebSocketConnected] = useState(false);

  // Khởi tạo WebSocket khi component được mount
  useEffect(() => {
    const initWebSocket = async () => {
      const connected = await connectTrainingWebSocket();
      setWebSocketConnected(connected);
    };

    initWebSocket();

    return () => {
      disconnectTrainingWebSocket();
    };
  }, []);

  // Thiết lập listener cho WebSocket
  useEffect(() => {
    const removeListener = addTrainingMessageListener((message) => {
      if (message.type === 'status') {
        console.log('Context: Nhận được message.status:', message.status);
        if (message.status === 'connected') {
          setWebSocketConnected(true);
        } else if (message.status === 'disconnected') {
          setWebSocketConnected(false);
        } else if (message.status === 'started') {
          setIsTraining(true);
          setTrainingData(prev => ({
            ...prev,
            status: 'training'
          }));
          console.log('Context: Đã đặt isTraining = true', isTraining);
          setTrainingLogs(['Bắt đầu quá trình huấn luyện...']);
        } else if (message.status === 'completed') {
          setIsTraining(false);
          setTrainingData(prev => ({
            ...prev,
            status: 'completed'
          }));
          const completionMessage = 'Quá trình huấn luyện đã hoàn thành.';
          setTrainingLogs(prev => {
            const importantLogs = prev.filter(log => 
              log.includes('Model summary') || 
              log.includes('Results saved') || 
              log.includes('epochs completed') ||
              (log.includes('all') && log.includes('mAP50'))
            );
            
            return [...importantLogs, completionMessage];
          });
        } else if (message.status === 'stopped') {
          setIsTraining(false);
          setTrainingData(prev => ({
            ...prev,
            status: 'idle'
          }));
          setTrainingLogs(prev => [...prev, 'Quá trình huấn luyện đã bị dừng.']);
        }
      } else if (message.type === 'raw_log' && message.content) {
        const logMessage = message.content.toString();
        setTrainingLogs(prev => [...prev, logMessage]);
      } else if (message.type === 'epoch_progress' && 
                typeof message.current_epoch === 'number' && 
                typeof message.total_epochs === 'number') {
        const currentEpoch = Math.max(0, message.current_epoch);
        const totalEpochs = Math.max(1, message.total_epochs);
        setTrainingData(prev => ({
          ...prev,
          currentEpoch,
          totalEpochs
        }));
      } else if (message.type === 'metrics' && message.metrics) {
        const metrics = {
          box_loss: typeof message.metrics.box_loss === 'number' ? message.metrics.box_loss : undefined,
          obj_loss: typeof message.metrics.obj_loss === 'number' ? message.metrics.obj_loss : undefined,
          cls_loss: typeof message.metrics.cls_loss === 'number' ? message.metrics.cls_loss : undefined
        };
        setTrainingData(prev => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            ...metrics
          }
        }));
        const metricsStr = `Metrics: box_loss=${metrics.box_loss || '-'}, obj_loss=${metrics.obj_loss || '-'}, cls_loss=${metrics.cls_loss || '-'}`;
        setTrainingLogs(prev => [...prev, metricsStr]);
      } else if (message.type === 'validation' && 
                message.class === 'all' && 
                typeof message.mAP50 === 'number' && 
                typeof message['mAP50-95'] === 'number') {
        const validationMetrics = {
          mAP50: message.mAP50,
          mAP5095: message['mAP50-95']
        };
        setTrainingData(prev => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            ...validationMetrics
          }
        }));
        setTrainingLogs(prev => [...prev, `Validation: mAP50=${validationMetrics.mAP50}, mAP50-95=${validationMetrics.mAP5095}`]);
      } else if (message.type === 'error' && message.message) {
        setError(message.message);
        setTrainingLogs(prev => [...prev, `Lỗi: ${message.message}`]);
      }
    });

    return () => {
      removeListener();
    };
  }, []);

  // Bắt đầu huấn luyện
  // const startTraining = async (config: TrainingConfig) => {
  //   try {
  //     setIsLoading(true);
  //     setError(null);
  //     // Xóa toàn bộ log trước khi bắt đầu huấn luyện mới
  //     setTrainingLogs([]);
      
  //     console.log('Context: Trạng thái khi bắt đầu huấn luyện:', {
  //       webSocketConnected,
  //       isTraining,
  //       status: trainingData.status
  //     });
      
  //     // Nếu không có kết nối WebSocket, kết nối lại
  //     if (!webSocketConnected) {
  //       console.log('Context: Không có kết nối WebSocket, đang kết nối lại...');
  //       const connected = await connectTrainingWebSocket();
  //       if (!connected) {
  //         throw new Error('Không thể kết nối đến máy chủ huấn luyện');
  //       }
  //       console.log('Context: Kết nối WebSocket thành công:', connected);
  //     }
      
  //     // Đặt trạng thái huấn luyện trước khi gọi API
  //     setIsTraining(true);
  //     console.log('Context: Đã đặt isTraining = true');
      
  //     // await startTrainingViaWebSocket(config);
  //     console.log('Context: Đã gửi lệnh bắt đầu huấn luyện qua WebSocket');
      
  //     setTrainingData({
  //       currentEpoch: 0,
  //       totalEpochs: config.epochs,
  //       metrics: {},
  //       status: 'training'
  //     });
      
  //     // Đảm bảo isTraining = true
  //     setIsTraining(true);
      
  //     console.log('Context: Trạng thái sau khi bắt đầu huấn luyện:', {
  //       webSocketConnected,
  //       isTraining: true,
  //       status: 'training'
  //     });
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Lỗi không xác định khi bắt đầu huấn luyện');
  //     console.error('Context: Lỗi khi bắt đầu huấn luyện:', err);
  //     // Đặt lại trạng thái nếu có lỗi
  //     setIsTraining(false);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // // Dừng huấn luyện
  // const stopTraining = async () => {
  //   try {
  //     setIsLoading(true);
  //     setError(null);
      
  //     console.log('Context: Trạng thái khi dừng huấn luyện:', {
  //       webSocketConnected,
  //       isTraining,
  //       status: trainingData.status
  //     });
      
  //     console.log('Context: Đang cố gắng dừng quá trình huấn luyện...');
      
  //     // Đặt trạng thái đầu tiên
  //     setIsTraining(false);
  //     setTrainingData(prev => ({
  //       ...prev,
  //       status: 'idle'
  //     }));
  //     console.log('Context: Đã đặt isTraining = false và status = idle');
      
  //     // Dừng huấn luyện qua WebSocket (nếu kết nối)
  //     if (webSocketConnected) {
  //       try {
  //         console.log('Context: Đang dừng huấn luyện qua WebSocket...');
  //         await stopTrainingViaWebSocket();
  //         console.log('Context: Đã gửi lệnh dừng qua WebSocket');
  //       } catch (wsError) {
  //         console.error('Context: Lỗi khi dừng huấn luyện qua WebSocket:', wsError);
  //         // Ghi lại lỗi nhưng tiếp tục để thử qua REST API
  //       }
  //     } else {
  //       console.warn('Context: WebSocket không được kết nối, không thể dừng qua WebSocket');
  //     }
      
  //     // Dừng huấn luyện qua REST API (luôn thử cả hai cách)
  //     try {
  //       // Import động để tránh circular dependency
  //       const { stopTraining: stopTrainingRest } = await import('../services/api');
  //       console.log('Context: Đang dừng huấn luyện qua REST API...');
  //       const result = await stopTrainingRest();
  //       console.log('Context: Kết quả dừng huấn luyện từ REST API:', result);
  //     } catch (restError) {
  //       console.error('Context: Lỗi khi dừng huấn luyện qua REST API:', restError);
        
  //       // Nếu cả hai cách đều thất bại, ném lỗi
  //       if (!webSocketConnected) {
  //         throw new Error('Không thể dừng huấn luyện: cả WebSocket và REST API đều thất bại');
  //       }
  //     }
      
  //     // Cập nhật trạng thái UI dù API có thành công hay không - đảm bảo isTraining = false
  //     setIsTraining(false);
  //     setTrainingData(prev => ({
  //       ...prev,
  //       status: 'idle'
  //     }));
      
  //     // Thêm log thành công
  //     setTrainingLogs(prev => [...prev, 'Đã dừng quá trình huấn luyện']);
      
  //     console.log('Context: Đã hoàn tất dừng huấn luyện. Trạng thái:', {
  //       webSocketConnected,
  //       isTraining: false,
  //       status: 'idle'
  //     });
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Lỗi không xác định khi dừng huấn luyện');
  //     setTrainingLogs(prev => [...prev, `Lỗi: ${err instanceof Error ? err.message : 'Lỗi không xác định khi dừng huấn luyện'}`]);
  //     console.error('Context: Lỗi khi dừng huấn luyện:', err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Kết nối lại WebSocket
  const reconnectWebSocket = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const connected = await connectTrainingWebSocket();
      setWebSocketConnected(connected);
      
      if (!connected) {
        throw new Error('Không thể kết nối lại đến máy chủ huấn luyện');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định khi kết nối lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TrainingContext.Provider
      value={{
        trainingData,
        isTraining,
        isLoading,
        error,
        trainingLogs,
        webSocketConnected,
        reconnectWebSocket,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
};
