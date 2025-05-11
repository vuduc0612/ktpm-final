package com.vneseid.vneseidbejava.factory;

import com.vneseid.vneseidbejava.dto.TextRecognitionMetricRequest;
import com.vneseid.vneseidbejava.model.MetricTrain;
import com.vneseid.vneseidbejava.model.TextRecognitionMetric;
import com.vneseid.vneseidbejava.model.User;
import com.vneseid.vneseidbejava.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class TextRecognitionMetricCreator implements MetricCreator<TextRecognitionMetricRequest> {

    private final UserRepository userRepository;

    @Override
    public MetricTrain createMetric(TextRecognitionMetricRequest request, Long userId) {
        // Tạo instance mới
        TextRecognitionMetric metric = new TextRecognitionMetric();
        
        // Điền dữ liệu
        metric.setEpoch(request.getEpoch());
        metric.setTrainLoss(request.getTrainLoss());
        metric.setTrainAccuracy(request.getTrainAccuracy());
        metric.setValLoss(request.getValLoss());
        metric.setValAccuracy(request.getValAccuracy());
        metric.setCharacterErrorRate(request.getCharacterErrorRate());
        metric.setWordErrorRate(request.getWordErrorRate());
        
        // Đặt thời gian tạo
        metric.setCreatedAt(LocalDateTime.now());
        
        // Đặt user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        metric.setUser(user);
        
        return metric;
    }
} 