package com.vneseid.vneseidbejava.factory;

import com.vneseid.vneseidbejava.model.MetricTrain;

/**
 * Interface để tạo các đối tượng metric
 * @param <T> Loại metric cần tạo
 */
public interface MetricFactory<T extends MetricTrain> {
    /**
     * Chuẩn bị metric trước khi lưu vào database
     * @param metric Đối tượng metric
     * @param userId Id của người dùng
     * @return Đối tượng metric đã được chuẩn bị
     */
    T prepareMetric(T metric, Long userId);
} 