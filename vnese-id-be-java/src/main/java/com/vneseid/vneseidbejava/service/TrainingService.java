package com.vneseid.vneseidbejava.service;

import com.vneseid.vneseidbejava.model.MetricsSummary;
import com.vneseid.vneseidbejava.model.TrainingMetrics;
import com.vneseid.vneseidbejava.model.TrainingParam;
import com.vneseid.vneseidbejava.model.TrainingStatus;

import java.util.List;

/**
 * Service interface để tương tác với API huấn luyện mô hình YOLOv5 FastAPI
 */
public interface TrainingService {
    
    /**
     * Bắt đầu quá trình huấn luyện với các tham số tùy chỉnh
     * @param params Tham số huấn luyện
     * @return Trạng thái huấn luyện
     */
    TrainingStatus startTraining(TrainingParam params);
    
    /**
     * Bắt đầu quá trình huấn luyện với tham số mặc định
     * @return Trạng thái huấn luyện
     */
    TrainingStatus startTrainingWithDefaultParams();
    
    /**
     * Dừng quá trình huấn luyện đang chạy
     * @return Trạng thái huấn luyện
     */
    TrainingStatus stopTraining();
    
    /**
     * Lấy trạng thái hiện tại của quá trình huấn luyện
     * @return Trạng thái huấn luyện
     */
    TrainingStatus getTrainingStatus();
    
    /**
     * Lấy danh sách tất cả metrics của quá trình huấn luyện
     * @param limit Giới hạn số lượng metrics trả về
     * @return Danh sách metrics
     */
    List<TrainingMetrics> getAllMetrics(Integer limit);
    
    /**
     * Lấy tóm tắt kết quả metrics của quá trình huấn luyện
     * @return Tóm tắt metrics
     */
    MetricsSummary getMetricsSummary();
    
    /**
     * Lấy metrics của một epoch cụ thể
     * @param epoch Epoch cần lấy metrics
     * @return Metrics của epoch đó
     */
    TrainingMetrics getMetricsForEpoch(int epoch);
} 