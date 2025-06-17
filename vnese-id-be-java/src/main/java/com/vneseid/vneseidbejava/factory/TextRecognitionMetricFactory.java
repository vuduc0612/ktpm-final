package com.vneseid.vneseidbejava.factory;

import com.vneseid.vneseidbejava.model.Model;
import com.vneseid.vneseidbejava.model.TextRecognitionMetric;
import com.vneseid.vneseidbejava.model.User;
import com.vneseid.vneseidbejava.repository.ModelRepository;
import com.vneseid.vneseidbejava.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class TextRecognitionMetricFactory implements MetricFactory<TextRecognitionMetric> {

    private final ModelRepository modelRepository;

    @Override
    public TextRecognitionMetric prepareMetric(TextRecognitionMetric metric, Long modelId) {
        // Đặt thời gian tạo nếu chưa có
        if (metric.getCreatedAt() == null) {
            metric.setCreatedAt(LocalDateTime.now());
        }
        
        // Đặt user
        Model model = modelRepository.findById(modelId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + modelId));
        metric.setModel(model);

        return metric;
    }
} 