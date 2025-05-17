package com.vneseid.vneseidbejava.factory;

import com.vneseid.vneseidbejava.model.IdCardZoneMetric;
import com.vneseid.vneseidbejava.model.User;
import com.vneseid.vneseidbejava.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class IdCardZoneMetricFactory implements MetricFactory<IdCardZoneMetric> {

    private final UserRepository userRepository;

    @Override
    public IdCardZoneMetric prepareMetric(IdCardZoneMetric metric, Long userId) {
        // Đặt thời gian tạo nếu chưa có
        if (metric.getCreatedAt() == null) {
            System.out.println("Set time for metric created");
            metric.setCreatedAt(LocalDateTime.now());
        }
        
        // Đặt user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        metric.setUser(user);
        
        return metric;
    }
} 