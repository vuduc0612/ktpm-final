package com.vneseid.vneseidbejava.service.impl;

import com.vneseid.vneseidbejava.factory.IdCardZoneMetricFactory;
import com.vneseid.vneseidbejava.factory.TextRecognitionMetricFactory;
import com.vneseid.vneseidbejava.model.IdCardZoneMetric;
import com.vneseid.vneseidbejava.model.TextRecognitionMetric;
import com.vneseid.vneseidbejava.repository.IdCardZoneMetricRepository;
import com.vneseid.vneseidbejava.repository.TextRecognitionMetricRepository;
import com.vneseid.vneseidbejava.service.MetricService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;

@Service
@RequiredArgsConstructor
public class MetricServiceImpl implements MetricService {
    @Value("${fastapi.base-url}")
    private String fastApiBaseUrl;
    private final RestTemplate restTemplate;
    private final IdCardZoneMetricRepository idCardZoneMetricRepository;
    private final TextRecognitionMetricRepository textRecognitionMetricRepository;
    private final IdCardZoneMetricFactory idCardZoneMetricFactory;
    private final TextRecognitionMetricFactory textRecognitionMetricFactory;

    @Override
    public IdCardZoneMetric getMetricCardZone() {
        String url = fastApiBaseUrl + "/metrics/metrics-zone/latest";
        ResponseEntity<IdCardZoneMetric> responseEntity =
                restTemplate.exchange(url, HttpMethod.GET, null, IdCardZoneMetric.class);
        System.out.println(responseEntity.getBody());
        if (responseEntity.getStatusCode().is2xxSuccessful()) {
            IdCardZoneMetric metric = responseEntity.getBody();
            return metric;
        } else {
            // Handle error case
            throw new RuntimeException("Failed to get metrics: " + responseEntity.getStatusCode());
        }
    }

    @Override
    public IdCardZoneMetric createMetricCardZone(IdCardZoneMetric metric, Long userId) {
        // Sử dụng Factory để chuẩn bị metric
        IdCardZoneMetric preparedMetric = idCardZoneMetricFactory.prepareMetric(metric, userId);
        
        // Lưu vào database
        return idCardZoneMetricRepository.save(preparedMetric);
    }
    
    @Override
    public TextRecognitionMetric createTextRecognitionMetric(TextRecognitionMetric metric, Long userId) {
        // Sử dụng Factory để chuẩn bị metric
        TextRecognitionMetric preparedMetric = textRecognitionMetricFactory.prepareMetric(metric, userId);
        
        // Lưu vào database
        return textRecognitionMetricRepository.save(preparedMetric);
    }
    
    @Override
    public Resource downloadModel() {
        // Đường dẫn đến file mô hình
        String modelPath = "D:\\vnese-id-management\\vnese-id-be-python\\corner_detection\\weights\\best.pt";
        
        // Kiểm tra xem file có tồn tại không
        File modelFile = new File(modelPath);
        if (!modelFile.exists()) {
            throw new RuntimeException("Model file not found at path: " + modelPath);
        }
        
        // Tạo Resource từ file
        return new FileSystemResource(modelFile);
    }
}
