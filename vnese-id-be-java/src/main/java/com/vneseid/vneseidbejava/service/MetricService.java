package com.vneseid.vneseidbejava.service;

import com.vneseid.vneseidbejava.dto.IdCardZoneMetricRequest;
import com.vneseid.vneseidbejava.dto.IdCardZoneMetricResponse;
import com.vneseid.vneseidbejava.dto.TextRecognitionMetricRequest;
import com.vneseid.vneseidbejava.dto.TextRecognitionMetricResponse;

public interface MetricService {
    /**
     * Lấy metric của card zone
     */
    IdCardZoneMetricResponse getMetricCardZone();
    
    /**
     * Tạo metric mới cho card zone
     */
    IdCardZoneMetricResponse createMetricCardZone(IdCardZoneMetricRequest metric);
    
    /**
     * Tạo metric mới cho text recognition
     */
    TextRecognitionMetricResponse createTextRecognitionMetric(TextRecognitionMetricRequest metric);
}
