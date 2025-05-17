package com.vneseid.vneseidbejava.service;

import com.vneseid.vneseidbejava.model.IdCardZoneMetric;
import com.vneseid.vneseidbejava.model.TextRecognitionMetric;
import org.springframework.core.io.Resource;

public interface MetricService {
    IdCardZoneMetric getMetricCardZone();

    IdCardZoneMetric createMetricCardZone(IdCardZoneMetric metric, Long userId);

    TextRecognitionMetric createTextRecognitionMetric(TextRecognitionMetric metric, Long userId);

    Resource downloadModel();
}
