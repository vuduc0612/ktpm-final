package com.vneseid.vneseidbejava.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.Map;

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
    public TrainingStatus stopTraining() {
        try {
            String url = fastApiBaseUrl + "/training/stop";
            HttpEntity<Map> request = new HttpEntity<>(null);
            ResponseEntity<Map> response = restTemplate.exchange(url,HttpMethod.POST,request, Map.class);
            
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
    
   
} 