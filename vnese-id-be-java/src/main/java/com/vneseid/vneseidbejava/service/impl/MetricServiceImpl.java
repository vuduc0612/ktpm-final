package com.vneseid.vneseidbejava.service.impl;

import com.vneseid.vneseidbejava.dto.IdCardZoneMetricRequest;
import com.vneseid.vneseidbejava.dto.IdCardZoneMetricResponse;
import com.vneseid.vneseidbejava.dto.TextRecognitionMetricRequest;
import com.vneseid.vneseidbejava.dto.TextRecognitionMetricResponse;
import com.vneseid.vneseidbejava.factory.IdCardZoneMetricCreator;
import com.vneseid.vneseidbejava.factory.TextRecognitionMetricCreator;
import com.vneseid.vneseidbejava.model.IdCardZoneMetric;
import com.vneseid.vneseidbejava.model.MetricTrain;
import com.vneseid.vneseidbejava.model.TextRecognitionMetric;
import com.vneseid.vneseidbejava.repository.IdCardZoneMetricRepository;
import com.vneseid.vneseidbejava.repository.TextRecognitionMetricRepository;
import com.vneseid.vneseidbejava.service.MetricService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class MetricServiceImpl implements MetricService {
    @Value("${fastapi.base-url}")
    private String fastApiBaseUrl;
    private final RestTemplate restTemplate;
    private final IdCardZoneMetricCreator idCardZoneMetricCreator;
    private final TextRecognitionMetricCreator textRecognitionMetricCreator;
    private final IdCardZoneMetricRepository idCardZoneMetricRepository;
    private final TextRecognitionMetricRepository textRecognitionMetricRepository;

    @Override
    public IdCardZoneMetricResponse getMetricCardZone() {
        String url = fastApiBaseUrl + "/training/metrics-zone/latest";
        ResponseEntity<IdCardZoneMetricResponse> responseEntity =
                restTemplate.exchange(url, HttpMethod.GET, null, IdCardZoneMetricResponse.class);
        if (responseEntity.getStatusCode().is2xxSuccessful()) {
            IdCardZoneMetricResponse response = responseEntity.getBody();
            return response;
        } else {
            // Handle error case
            throw new RuntimeException("Failed to get metrics: " + responseEntity.getStatusCode());
        }
    }

    @Override
    public IdCardZoneMetricResponse createMetricCardZone(IdCardZoneMetricRequest metricRequest) {
        // Sử dụng Factory Method Pattern để tạo metric
        Long userId = metricRequest.getUserId();
        MetricTrain metricTrain = idCardZoneMetricCreator.createMetric(metricRequest, metricRequest.getUserId()); // 1L là userId giả định
        
        // Cast về loại cụ thể để lưu
        IdCardZoneMetric metric = (IdCardZoneMetric) metricTrain;
        IdCardZoneMetric savedMetric = idCardZoneMetricRepository.save(metric);
        
        // Chuyển đổi thành response
        return mapToIdCardZoneMetricResponse(savedMetric);
    }
    
    @Override
    public TextRecognitionMetricResponse createTextRecognitionMetric(TextRecognitionMetricRequest metricRequest) {
        // Sử dụng Factory Method Pattern để tạo metric
        Long userId = metricRequest.getUserId();
        MetricTrain metricTrain = textRecognitionMetricCreator.createMetric(metricRequest, userId);
        
        // Cast về loại cụ thể để lưu
        TextRecognitionMetric metric = (TextRecognitionMetric) metricTrain;
        TextRecognitionMetric savedMetric = textRecognitionMetricRepository.save(metric);
        
        // Chuyển đổi thành response
        return mapToTextRecognitionMetricResponse(savedMetric);
    }
    
    private IdCardZoneMetricResponse mapToIdCardZoneMetricResponse(IdCardZoneMetric metric) {
        IdCardZoneMetricResponse response = new IdCardZoneMetricResponse();
        response.setEpoch(metric.getEpoch());
        response.setMetricPrecision(metric.getMetricPrecision());
        response.setMetricRecall(metric.getMetricRecall());
        response.setTrainBoxLoss(metric.getTrainBoxLoss());
        response.setTrainClsLoss(metric.getTrainClsLoss());
        response.setTrainObjLoss(metric.getTrainObjLoss());
        response.setValBoxLoss(metric.getValBoxLoss());
        response.setValClsLoss(metric.getValClsLoss());
        response.setValObjLoss(metric.getValObjLoss());
        response.setCreatedAt(metric.getCreatedAt());
        return response;
    }
    
    private TextRecognitionMetricResponse mapToTextRecognitionMetricResponse(TextRecognitionMetric metric) {
        TextRecognitionMetricResponse response = new TextRecognitionMetricResponse();
        response.setId(metric.getId());
        response.setEpoch(metric.getEpoch());
        response.setTrainLoss(metric.getTrainLoss());
        response.setTrainAccuracy(metric.getTrainAccuracy());
        response.setValLoss(metric.getValLoss());
        response.setValAccuracy(metric.getValAccuracy());
        response.setCharacterErrorRate(metric.getCharacterErrorRate());
        response.setWordErrorRate(metric.getWordErrorRate());
        response.setCreatedAt(metric.getCreatedAt());
        response.setUserId(metric.getUser().getId());
        return response;
    }
}
