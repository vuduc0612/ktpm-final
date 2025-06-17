package com.vneseid.vneseidbejava.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Setter
@Getter
public class TextRecognitionMetric implements MetricTrain {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer epoch;
    
    @JsonProperty("train_loss")
    @Column(name = "train_loss")
    private Float trainLoss;
    
    @JsonProperty("train_accuracy")
    @Column(name = "train_accuracy")
    private Float trainAccuracy;
    
    @JsonProperty("val_loss")
    @Column(name = "val_loss")
    private Float valLoss;
    
    @JsonProperty("val_accuracy")
    @Column(name = "val_accuracy")
    private Float valAccuracy;
    
    @JsonProperty("character_error_rate")
    @Column(name = "character_error_rate")
    private Float characterErrorRate;
    
    @JsonProperty("word_error_rate")
    @Column(name = "word_error_rate")
    private Float wordErrorRate;
    
    @JsonProperty("created_at")
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "model_id", nullable = false)
    @JsonIgnoreProperties({"idCardZoneMetricList", "idCardRegionList", "password"})
    private Model model;
} 