package com.vneseid.vneseidbejava.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Model đại diện cho metrics của mô hình nhận diện góc CMND/CCCD
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingMetrics {
    private int epoch;
    private float trainBoxLoss;
    private float trainObjLoss;
    private float trainClsLoss;
    private float precision;
    private float recall;
    private float mAP50;
    private float mAP5095;
    private float valBoxLoss;
    private float valObjLoss;
    private float valClsLoss;
    private LocalDateTime timestamp;
} 