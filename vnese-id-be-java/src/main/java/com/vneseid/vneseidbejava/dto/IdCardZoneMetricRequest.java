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
public class IdCardZoneMetricRequest {
    private Integer epoch;
    @JsonProperty("train_box_loss")
    private Float trainBoxLoss;

    @JsonProperty("train_obj_loss")
    private Float trainObjLoss;

    @JsonProperty("train_cls_loss")
    private Float trainClsLoss;

    @JsonProperty("precision")
    private Float metricPrecision;

    @JsonProperty("recall")
    private Float metricRecall;

    @JsonProperty("val_box_loss")
    private Float valBoxLoss;

    @JsonProperty("val_obj_loss")
    private Float valObjLoss;

    @JsonProperty("val_cls_loss")
    private Float valClsLoss;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("user_id")
    private Long userId;
}
