package com.vneseid.vneseidbejava.factory;

import com.vneseid.vneseidbejava.dto.IdCardZoneMetricRequest;
import com.vneseid.vneseidbejava.model.IdCardZoneMetric;
import com.vneseid.vneseidbejava.model.MetricTrain;
import com.vneseid.vneseidbejava.model.User;
import com.vneseid.vneseidbejava.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class IdCardZoneMetricCreator implements MetricCreator<IdCardZoneMetricRequest> {

    private final UserRepository userRepository;

    @Override
    public MetricTrain createMetric(IdCardZoneMetricRequest request, Long userId) {
        // Tạo instance mới
        IdCardZoneMetric metric = new IdCardZoneMetric();
        
        // Điền dữ liệu
        metric.setEpoch(request.getEpoch());
        metric.setTrainBoxLoss(request.getTrainBoxLoss());
        metric.setTrainObjLoss(request.getTrainObjLoss());
        metric.setTrainClsLoss(request.getTrainClsLoss());
        metric.setMetricPrecision(request.getMetricPrecision());
        metric.setMetricRecall(request.getMetricRecall());
        metric.setValBoxLoss(request.getValBoxLoss());
        metric.setValObjLoss(request.getValObjLoss());
        metric.setValClsLoss(request.getValClsLoss());
        
        // Đặt thời gian tạo
        metric.setCreatedAt(LocalDateTime.now());
        
        // Đặt user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        metric.setUser(user);
        
        return metric;
    }
} 