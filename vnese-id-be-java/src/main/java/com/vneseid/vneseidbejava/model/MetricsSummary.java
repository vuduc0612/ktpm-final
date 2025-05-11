package com.vneseid.vneseidbejava.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Model đại diện cho tóm tắt metrics huấn luyện
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricsSummary {
    private int totalEpochs;
    private TrainingMetrics latestMetrics;
    private float maxPrecision;
    private float maxRecall;
    private float maxMAP50;
    private float maxMAP5095;
    private float avgPrecision;
    private float avgRecall;
} 