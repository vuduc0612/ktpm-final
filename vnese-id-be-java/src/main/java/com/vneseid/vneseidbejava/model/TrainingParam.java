package com.vneseid.vneseidbejava.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Model đại diện cho tham số huấn luyện mô hình YOLOv5
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "training_param")
public class TrainingParam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int batchSize;
    private int epochs;
    private float learningRate;
    private String datasetPath;
    private String pretrainedWeightPath;
    @ManyToOne
    @JoinColumn(name = "model_id")
    @JsonIgnoreProperties("trainingParams")
    private Model model;
} 