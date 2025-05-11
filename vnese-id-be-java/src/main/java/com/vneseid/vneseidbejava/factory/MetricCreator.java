package com.vneseid.vneseidbejava.factory;

import com.vneseid.vneseidbejava.model.MetricTrain;

/**
 * Interface triển khai Factory Method Pattern cho việc tạo các metric
 * @param <R> Kiểu request DTO
 */
public interface MetricCreator<R> {
    
    /**
     * Factory method để tạo đối tượng metric
     * @param request Request DTO chứa dữ liệu
     * @param userId ID của người dùng 
     * @return Đối tượng metric được tạo
     */
    MetricTrain createMetric(R request, Long userId);
} 