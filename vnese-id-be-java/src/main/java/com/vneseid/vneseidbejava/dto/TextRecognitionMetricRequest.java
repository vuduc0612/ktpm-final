package com.vneseid.vneseidbejava.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@RequiredArgsConstructor
@Getter
@Setter
public class TextRecognitionMetricRequest {
    private Integer epoch;
    
    @JsonProperty("train_loss")
    private Float trainLoss;
    
    @JsonProperty("train_accuracy") 
    private Float trainAccuracy;
    
    @JsonProperty("val_loss")
    private Float valLoss;
    
    @JsonProperty("val_accuracy")
    private Float valAccuracy;
    
    @JsonProperty("character_error_rate")
    private Float characterErrorRate;
    
    @JsonProperty("word_error_rate")
    private Float wordErrorRate;
    
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("user_id")
    private Long userId;
} 