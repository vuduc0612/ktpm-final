package com.vneseid.vneseidbejava.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vneseid.vneseidbejava.model.MetricsSummary;
import com.vneseid.vneseidbejava.model.TrainingMetrics;
import com.vneseid.vneseidbejava.model.TrainingParam;
import com.vneseid.vneseidbejava.model.TrainingStatus;
import com.vneseid.vneseidbejava.service.TrainingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Triển khai service để tương tác với API huấn luyện mô hình YOLOv5 FastAPI
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TrainingServiceImpl implements TrainingService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${fastapi.base-url}")
    private String fastApiBaseUrl;

    @Override
    public TrainingStatus startTraining(TrainingParam params) {
        try {
            params.setDataPath("D:\\vnese-id-management\\vnese-id-be-python\\dataset\\corners");
            params.setPretrainedWeights(params.getPretrainedWeights());
            String url = fastApiBaseUrl + "/training/start";
            HttpEntity<TrainingParam> request = new HttpEntity<>(params);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            
            return mapToTrainingStatus(response.getBody());
        } catch (Exception e) {
            log.error("Lỗi khi bắt đầu huấn luyện", e);
            return TrainingStatus.builder()
                    .status("failed")
                    .message("Lỗi khi bắt đầu huấn luyện: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public TrainingStatus startTrainingWithDefaultParams() {
        try {
            String url = fastApiBaseUrl + "/training/start";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            return mapToTrainingStatus(response.getBody());
        } catch (Exception e) {
            log.error("Lỗi khi bắt đầu huấn luyện với tham số mặc định", e);
            return TrainingStatus.builder()
                    .status("failed")
                    .message("Lỗi khi bắt đầu huấn luyện: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public TrainingStatus stopTraining() {
        try {
            String url = fastApiBaseUrl + "/training/stop";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            return mapToTrainingStatus(response.getBody());
        } catch (Exception e) {
            log.error("Lỗi khi dừng huấn luyện", e);
            return TrainingStatus.builder()
                    .status("failed")
                    .message("Lỗi khi dừng huấn luyện: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public TrainingStatus getTrainingStatus() {
        try {
            String url = fastApiBaseUrl + "/training/status";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            return mapToTrainingStatus(response.getBody());
        } catch (Exception e) {
            log.error("Lỗi khi lấy trạng thái huấn luyện", e);
            return TrainingStatus.builder()
                    .status("unknown")
                    .message("Lỗi khi lấy trạng thái huấn luyện: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public List<TrainingMetrics> getAllMetrics(Integer limit) {
        try {
            UriComponentsBuilder builder = UriComponentsBuilder
                    .fromHttpUrl(fastApiBaseUrl + "/training/metrics");
            
            if (limit != null) {
                builder.queryParam("limit", limit);
            }
            
            ResponseEntity<List> response = restTemplate.getForEntity(
                    builder.toUriString(), List.class);
            
            List<TrainingMetrics> metricsList = new ArrayList<>();
            
            if (response.getBody() != null) {
                for (Object item : response.getBody()) {
                    if (item instanceof Map) {
                        TrainingMetrics metrics = objectMapper.convertValue(item, TrainingMetrics.class);
                        metricsList.add(metrics);
                    }
                }
            }
            
            return metricsList;
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách metrics", e);
            return new ArrayList<>();
        }
    }

    @Override
    public MetricsSummary getMetricsSummary() {
        try {
            String url = fastApiBaseUrl + "/training/metrics/summary";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            Map<String, Object> body = response.getBody();
            if (body == null) {
                return new MetricsSummary();
            }
            
            return MetricsSummary.builder()
                    .totalEpochs((Integer) body.getOrDefault("total_epochs", 0))
                    .latestMetrics(mapToTrainingMetrics((Map<String, Object>) body.get("latest_metrics")))
                    .maxPrecision(((Number) body.getOrDefault("max_precision", 0.0)).floatValue())
                    .maxRecall(((Number) body.getOrDefault("max_recall", 0.0)).floatValue())
                    .maxMAP50(((Number) body.getOrDefault("max_mAP_50", 0.0)).floatValue())
                    .maxMAP5095(((Number) body.getOrDefault("max_mAP_50_95", 0.0)).floatValue())
                    .avgPrecision(((Number) body.getOrDefault("avg_precision", 0.0)).floatValue())
                    .avgRecall(((Number) body.getOrDefault("avg_recall", 0.0)).floatValue())
                    .build();
        } catch (Exception e) {
            log.error("Lỗi khi lấy tóm tắt metrics", e);
            return new MetricsSummary();
        }
    }

    @Override
    public TrainingMetrics getMetricsForEpoch(int epoch) {
        try {
            String url = fastApiBaseUrl + "/training/metrics/" + epoch;
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            return mapToTrainingMetrics(response.getBody());
        } catch (Exception e) {
            log.error("Lỗi khi lấy metrics cho epoch {}", epoch, e);
            return null;
        }
    }
    
    /**
     * Chuyển đổi Map thành đối tượng TrainingStatus
     */
    private TrainingStatus mapToTrainingStatus(Map<String, Object> statusMap) {
        if (statusMap == null) {
            return new TrainingStatus();
        }
        
        return TrainingStatus.builder()
                .status((String) statusMap.getOrDefault("status", "unknown"))
                .message((String) statusMap.getOrDefault("message", ""))
                .currentEpoch((Integer) statusMap.getOrDefault("current_epoch", null))
                .totalEpochs((Integer) statusMap.getOrDefault("total_epochs", null))
                .build();
    }
    
    /**
     * Chuyển đổi Map thành đối tượng TrainingMetrics
     */
    private TrainingMetrics mapToTrainingMetrics(Map<String, Object> metricsMap) {
        if (metricsMap == null) {
            return null;
        }
        
        return TrainingMetrics.builder()
                .epoch((Integer) metricsMap.getOrDefault("epoch", 0))
                .trainBoxLoss(((Number) metricsMap.getOrDefault("train_box_loss", 0.0)).floatValue())
                .trainObjLoss(((Number) metricsMap.getOrDefault("train_obj_loss", 0.0)).floatValue())
                .trainClsLoss(((Number) metricsMap.getOrDefault("train_cls_loss", 0.0)).floatValue())
                .precision(((Number) metricsMap.getOrDefault("precision", 0.0)).floatValue())
                .recall(((Number) metricsMap.getOrDefault("recall", 0.0)).floatValue())
                .mAP50(((Number) metricsMap.getOrDefault("mAP_50", 0.0)).floatValue())
                .mAP5095(((Number) metricsMap.getOrDefault("mAP_50_95", 0.0)).floatValue())
                .valBoxLoss(((Number) metricsMap.getOrDefault("val_box_loss", 0.0)).floatValue())
                .valObjLoss(((Number) metricsMap.getOrDefault("val_obj_loss", 0.0)).floatValue())
                .valClsLoss(((Number) metricsMap.getOrDefault("val_cls_loss", 0.0)).floatValue())
                .build();
    }
} 