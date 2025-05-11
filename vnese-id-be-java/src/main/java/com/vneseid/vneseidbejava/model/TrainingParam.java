package com.vneseid.vneseidbejava.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Model đại diện cho tham số huấn luyện mô hình YOLOv5
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingParam {
    private int batchSize;
    private int epochs;
    private float learningRate;
    private String dataPath;
    private String pretrainedWeights;
} 