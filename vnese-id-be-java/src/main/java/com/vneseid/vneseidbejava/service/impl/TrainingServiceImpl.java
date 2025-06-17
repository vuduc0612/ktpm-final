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
import com.vneseid.vneseidbejava.model.Model;
import com.vneseid.vneseidbejava.model.IdCardZoneMetric;
import com.vneseid.vneseidbejava.repository.ModelRepository;
import com.vneseid.vneseidbejava.repository.TrainingParamRepository;
import com.vneseid.vneseidbejava.repository.IdCardZoneMetricRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrainingServiceImpl implements TrainingService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${fastapi.base-url}")
    private String fastApiBaseUrl;

    @Autowired
    private ModelRepository modelRepository;
    @Autowired
    private TrainingParamRepository trainingParamRepository;
    @Autowired
    private IdCardZoneMetricRepository idCardZoneMetricRepository;

    @Override
    public TrainingStatus startTraining(TrainingParam params) {
        try {
            params.setDatasetPath("D:\\vnese-id-management\\vnese-id-be-python\\dataset\\corners");
            params.setPretrainedWeightPath(params.getPretrainedWeightPath());
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

    public void saveModelAndRelatedEntities(Model model, TrainingParam trainingParam, IdCardZoneMetric idCardZoneMetric) {
        // 1. Lưu model trước
        Model savedModel = modelRepository.save(model);
        // 2. Set model cho trainingParam và lưu
        trainingParam.setModel(savedModel);
        trainingParamRepository.save(trainingParam);
        // 3. Set model cho idCardZoneMetric và lưu
        idCardZoneMetric.setModel(savedModel);
        idCardZoneMetricRepository.save(idCardZoneMetric);
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