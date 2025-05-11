package com.vneseid.vneseidbejava.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Model đại diện cho trạng thái huấn luyện mô hình
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingStatus {
    private String status;  // running, completed, stopped, failed
    private String message;
    private Integer currentEpoch;
    private Integer totalEpochs;
} 