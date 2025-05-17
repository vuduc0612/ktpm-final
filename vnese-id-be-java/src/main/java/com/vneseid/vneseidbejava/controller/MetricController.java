package com.vneseid.vneseidbejava.controller;

import com.vneseid.vneseidbejava.model.ResponseObject;
import com.vneseid.vneseidbejava.model.IdCardZoneMetric;
import com.vneseid.vneseidbejava.model.TextRecognitionMetric;
import com.vneseid.vneseidbejava.service.MetricService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/metrics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MetricController {
    private final MetricService metricService;

    @GetMapping("/card-zone")
    public ResponseEntity<ResponseObject> getMetricCardZone(
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        IdCardZoneMetric metric = metricService.getMetricCardZone();

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
            @RequestBody IdCardZoneMetric metric,
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        System.out.println(metric);
        IdCardZoneMetric savedMetric = metricService.createMetricCardZone(metric, userId);
        return ResponseEntity.ok(
                ResponseObject.builder()
                        .status(HttpStatus.CREATED)
                        .message("Create metric card zone successfully")
                        .data(savedMetric)
                        .build()
        );
    }
    
    @PostMapping("/text-recognition")
    public ResponseEntity<?> postTextRecognitionMetric(
            @RequestBody TextRecognitionMetric metric,
            @RequestParam(required = false, defaultValue = "1") Long userId) {
        TextRecognitionMetric savedMetric = metricService.createTextRecognitionMetric(metric, userId);
        return ResponseEntity.ok(
                ResponseObject.builder()
                        .status(HttpStatus.CREATED)
                        .message("Create text recognition metric successfully")
                        .data(savedMetric)
                        .build()
        );
    }
    
    @Operation(summary = "Tải xuống file mô hình best.pt")
    @GetMapping("/download")
    public ResponseEntity<Resource> downloadModel() {
        try {
            Resource resource = metricService.downloadModel();
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"best.pt\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
