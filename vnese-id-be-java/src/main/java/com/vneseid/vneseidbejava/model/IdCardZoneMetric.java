package com.vneseid.vneseidbejava.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Setter
@Getter
public class IdCardZoneMetric implements MetricTrain {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer epoch;
    @Column(name = "train_box_loss")
    private Float trainBoxLoss;
    @Column(name = "train_obj_loss")
    private Float trainObjLoss;
    @Column(name = "train_cls_loss")
    private Float trainClsLoss;
    @Column(name = "metric_precision")
    private Float metricPrecision;
    @Column(name = "metric_recall")
    private Float metricRecall;
    @Column(name = "val_box_loss")
    private Float valBoxLoss;
    @Column(name = "val_obj_loss")
    private Float valObjLoss;
    @Column(name = "val_cls_loss")
    private Float valClsLoss;
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
