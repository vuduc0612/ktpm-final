package com.vneseid.vneseidbejava.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Setter
@Getter
@Data
@ToString
public class IdCardZoneMetric implements MetricTrain {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer epoch;
    @JsonProperty("train_box_loss")
    @Column(name = "train_box_loss")
    private Float trainBoxLoss;
    @JsonProperty("train_obj_loss")
    @Column(name = "train_obj_loss")
    private Float trainObjLoss;
    @JsonProperty("train_cls_loss")
    @Column(name = "train_cls_loss")
    private Float trainClsLoss;
    @JsonProperty("precision")
    @Column(name = "metric_precision")
    private Float metricPrecision;
    @JsonProperty("recall")
    @Column(name = "metric_recall")
    private Float metricRecall;
    @JsonProperty("val_box_loss")
    @Column(name = "val_box_loss")
    private Float valBoxLoss;
    @JsonProperty("val_obj_loss")
    @Column(name = "val_obj_loss")
    private Float valObjLoss;
    @JsonProperty("val_cls_loss")
    @Column(name = "val_cls_loss")
    private Float valClsLoss;
    @JsonProperty("created_at")
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @JsonProperty("results_path")
    private String imageResult;
    @JsonProperty("confusion_matrix_path")
    private String imageMatrix;

    @ManyToOne
    @JoinColumn(name = "model_id")
    @JsonIgnoreProperties({"idCardZoneMetrics", "trainingParams", "user"})
    private Model model;
}
