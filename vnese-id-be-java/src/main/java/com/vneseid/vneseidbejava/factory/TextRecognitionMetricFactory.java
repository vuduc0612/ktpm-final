package com.vneseid.vneseidbejava.factory;

import com.vneseid.vneseidbejava.model.TextRecognitionMetric;
import com.vneseid.vneseidbejava.model.User;
import com.vneseid.vneseidbejava.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class TextRecognitionMetricFactory implements MetricFactory<TextRecognitionMetric> {

    private final UserRepository userRepository;

    @Override
    public TextRecognitionMetric prepareMetric(TextRecognitionMetric metric, Long userId) {
        // Đặt thời gian tạo nếu chưa có
        if (metric.getCreatedAt() == null) {
            metric.setCreatedAt(LocalDateTime.now());
        }
        
        // Đặt user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        metric.setUser(user);
        
        return metric;
    }
} 