package com.vneseid.vneseidbejava.model;

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
    
    @Column(name = "train_loss")
    private Float trainLoss;
    
    @Column(name = "train_accuracy")
    private Float trainAccuracy;
    
    @Column(name = "val_loss")
    private Float valLoss;
    
    @Column(name = "val_accuracy")
    private Float valAccuracy;
    
    @Column(name = "character_error_rate")
    private Float characterErrorRate;
    
    @Column(name = "word_error_rate")
    private Float wordErrorRate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
} 