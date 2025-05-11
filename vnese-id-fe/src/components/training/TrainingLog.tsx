import { useState, useEffect, useRef } from 'react';
import Button from '../ui/Button';
import { useTraining } from '../../contexts/TrainingContext';

interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'model' | 'training' | 'status';
}

interface TrainingLogProps {
  className?: string;
}

const TrainingLog = ({ className = '' }: TrainingLogProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const processedLogsRef = useRef<Set<string>>(new Set());
  const lastLogLengthRef = useRef<number>(0);
  
  // Sử dụng TrainingContext
  const {
    isTraining,
    webSocketConnected,
    trainingLogs,
    reconnectWebSocket,
    error
  } = useTraining();

  // Scroll log container to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Xóa log khi trainingLogs được reset
  useEffect(() => {
    // Nếu trainingLogs ít hơn lần trước, có nghĩa là đã được reset
    if (trainingLogs.length < lastLogLengthRef.current && trainingLogs.length === 1) {
      console.log('Log đã reset, xóa logs hiện tại');
      setLogs([]);
      processedLogsRef.current.clear();
    }
    
    lastLogLengthRef.current = trainingLogs.length;
  }, [trainingLogs.length]);

  // Theo dõi trainingLogs từ context và cập nhật logs local
  useEffect(() => {
    if (trainingLogs.length > 0) {
      const processLogMessages = () => {
        const newLogs: LogEntry[] = [];
        
        // Chỉ xử lý log mới nhất
        const startIndex = Math.max(0, trainingLogs.length - 5);
        for (let i = startIndex; i < trainingLogs.length; i++) {
          const logMessage = trainingLogs[i];
          
          // Nếu là thông báo bắt đầu huấn luyện, xóa tất cả log cũ
          if (logMessage.includes('Bắt đầu quá trình huấn luyện')) {
            console.log('Phát hiện bắt đầu huấn luyện mới, xóa logs');
            setLogs([]);
            processedLogsRef.current.clear();
            break;
          }
          
          // Tạo ID duy nhất cho mỗi log message
          const logId = logMessage.trim();
          
          // Kiểm tra xem log đã được xử lý chưa
          if (processedLogsRef.current.has(logId)) {
            continue;
          }
          
          // Xác định loại log
          let type: LogEntry['type'] = 'info';
          
          if (logMessage.startsWith('Lỗi:')) {
            // Nếu là thông báo trạng thái huấn luyện
            if (logMessage.includes('Quá trình huấn luyện đang chạy')) {
              type = 'status';
            } else {
              type = 'error';
            }
          } else if (logMessage.includes('WARNING') || logMessage.includes('FutureWarning')) {
            type = 'warning';
          } else if (logMessage.includes('completed') || logMessage.includes('thành công') || logMessage.includes('hoàn thành')) {
            type = 'success';
          } else if (logMessage.includes('models.common.')) {
            type = 'model';
          } else if (logMessage.includes('Epoch') || logMessage.includes('train:')) {
            type = 'training';
          }
          
          // Thêm log mới
          newLogs.push({
            id: logId,
            message: logMessage.replace('Lỗi:', 'Trạng thái:'),
            type
          });
          
          // Đánh dấu log đã được xử lý
          processedLogsRef.current.add(logId);
        }
        
        if (newLogs.length > 0) {
          setLogs(prev => {
            const updatedLogs = [...prev, ...newLogs];
            // Giới hạn số lượng log hiển thị
            if (updatedLogs.length > 1000) {
              return updatedLogs.slice(updatedLogs.length - 1000);
            }
            return updatedLogs;
          });
        }
      };
      
      processLogMessages();
    }
  }, [trainingLogs]);

  // Reset log khi bắt đầu train mới
  useEffect(() => {
    if (isTraining) {
      setLogs([]);
      processedLogsRef.current.clear();
    }
  }, [isTraining]);

  return (
    <div className={`${className} font-mono`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Log Huấn luyện</h2>
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 text-xs rounded-full ${webSocketConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {webSocketConnected ? 'Đã kết nối' : 'Mất kết nối'}
          </div>
          {!webSocketConnected && (
            <Button 
              onClick={reconnectWebSocket}
              size="sm"
              variant="secondary"
            >
              Kết nối lại
            </Button>
          )}
          <Button 
            onClick={() => {
              setLogs([]);
              processedLogsRef.current.clear();
            }}
            size="sm"
            variant="secondary"
          >
            Xóa log
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="flex bg-gray-800 px-3 py-2 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-300">Thông tin huấn luyện</h3>
        </div>
        <div ref={logContainerRef} className="h-[600px] overflow-y-auto text-sm p-4 bg-[#1e1e1e]">
          {logs.length === 0 ? (
            <div className="text-gray-500 italic">Chưa có log nào. Hãy bắt đầu huấn luyện để xem log.</div>
          ) : (
            logs.map((log) => (
              <pre
                key={log.id}
                className={`
                  whitespace-pre font-mono leading-relaxed
                  ${log.type === 'model' ? 'text-cyan-400' : ''}
                  ${log.type === 'training' ? 'text-green-400' : ''}
                  ${log.type === 'info' ? 'text-blue-400' : ''}
                  ${log.type === 'warning' ? 'text-yellow-400' : ''}
                  ${log.type === 'error' ? 'text-red-400' : ''}
                  ${log.type === 'success' ? 'text-green-400' : ''}
                  ${log.type === 'status' ? 'text-blue-300' : ''}
                `}
                style={{ margin: 0, padding: 0 }}
              >
                {log.message}
              </pre>
            ))
          )}
        </div>
      </div>
      
      {error && !isTraining && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
          <p className="font-medium">Lỗi:</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default TrainingLog; 