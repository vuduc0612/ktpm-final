package com.vneseid.vneseidbejava.controller;

import com.vneseid.vneseidbejava.dto.IdCardZoneMetricRequest;
import com.vneseid.vneseidbejava.dto.IdCardZoneMetricResponse;
import com.vneseid.vneseidbejava.dto.ResponseObject;
import com.vneseid.vneseidbejava.dto.TextRecognitionMetricRequest;
import com.vneseid.vneseidbejava.service.MetricService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/metrics")
@RequiredArgsConstructor
public class MetricController {
    private final MetricService metricService;

    @GetMapping("/card-zone")
    public ResponseEntity<ResponseObject> getMetricCardZone(){
        IdCardZoneMetricResponse metric = metricService.getMetricCardZone();

        return ResponseEntity.ok(
                ResponseObject.builder()
                        .status(HttpStatus.OK)
                        .message("Get metric card zone successfully")
                        .data(metric)
                        .build()
        );
    }

    @PostMapping("/card-zone")
    public ResponseEntity<?> postMetricCardZone(
            @RequestBody IdCardZoneMetricRequest metricRequest){
        System.out.println(metricRequest);
        IdCardZoneMetricResponse metric = metricService.createMetricCardZone(metricRequest);
        return ResponseEntity.ok(
                ResponseObject.builder()
                        .status(HttpStatus.CREATED)
                        .message("Create metric card zone successfully")
                        .data(metric)
                        .build()
        );
    }
    
    @PostMapping("/text-recognition")
    public ResponseEntity<?> postTextRecognitionMetric(
            @RequestBody TextRecognitionMetricRequest metricRequest) {
        return ResponseEntity.ok(metricService.createTextRecognitionMetric(metricRequest));
    }
}
