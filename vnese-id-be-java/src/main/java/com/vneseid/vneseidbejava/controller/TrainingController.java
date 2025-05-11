package com.vneseid.vneseidbejava.controller;

import com.vneseid.vneseidbejava.model.MetricsSummary;
import com.vneseid.vneseidbejava.model.TrainingMetrics;
import com.vneseid.vneseidbejava.model.TrainingParam;
import com.vneseid.vneseidbejava.model.TrainingStatus;
import com.vneseid.vneseidbejava.service.TrainingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cung cấp API cho việc quản lý huấn luyện mô hình
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class TrainingController {

    private final TrainingService trainingService;

    /**
     * Bắt đầu quá trình huấn luyện với các tham số tùy chỉnh
     * @param params Tham số huấn luyện
     * @return Trạng thái huấn luyện
     */
    @PostMapping("/start")
    public ResponseEntity<TrainingStatus> startTraining(@RequestBody(required = false) TrainingParam params) {
        log.info("Nhận yêu cầu bắt đầu huấn luyện với tham số: {}", params);
        TrainingStatus status = trainingService.startTraining(params);
        return ResponseEntity.status(status.getStatus().equals("failed") ? HttpStatus.BAD_REQUEST : HttpStatus.OK)
                .body(status);
    }


    /**
     * Dừng quá trình huấn luyện đang chạy
     * @return Trạng thái huấn luyện
     */
    @PostMapping("/stop")
    public ResponseEntity<TrainingStatus> stopTraining() {
        log.info("Nhận yêu cầu dừng huấn luyện");
        TrainingStatus status = trainingService.stopTraining();
        return ResponseEntity.status(status.getStatus().equals("failed") ? HttpStatus.BAD_REQUEST : HttpStatus.OK)
                .body(status);
    }

    /**
     * Lấy trạng thái hiện tại của quá trình huấn luyện
     * @return Trạng thái huấn luyện
     */
    @GetMapping("/status")
    public ResponseEntity<TrainingStatus> getTrainingStatus() {
        log.info("Nhận yêu cầu lấy trạng thái huấn luyện");
        TrainingStatus status = trainingService.getTrainingStatus();
        return ResponseEntity.ok(status);
    }

    /**
     * Lấy danh sách tất cả metrics của quá trình huấn luyện
     * @param limit Giới hạn số lượng metrics trả về
     * @return Danh sách metrics
     */
    @GetMapping("/metrics")
    public ResponseEntity<List<TrainingMetrics>> getAllMetrics(
            @RequestParam(required = false) Integer limit) {
        log.info("Nhận yêu cầu lấy danh sách metrics với limit={}", limit);
        List<TrainingMetrics> metrics = trainingService.getAllMetrics(limit);
        return ResponseEntity.ok(metrics);
    }

    /**
     * Lấy tóm tắt kết quả metrics của quá trình huấn luyện
     * @return Tóm tắt metrics
     */
    @GetMapping("/metrics/summary")
    public ResponseEntity<MetricsSummary> getMetricsSummary() {
        log.info("Nhận yêu cầu lấy tóm tắt metrics");
        MetricsSummary summary = trainingService.getMetricsSummary();
        return ResponseEntity.ok(summary);
    }

    /**
     * Lấy metrics của một epoch cụ thể
     * @param epoch Epoch cần lấy metrics
     * @return Metrics của epoch đó
     */
    @GetMapping("/metrics/{epoch}")
    public ResponseEntity<TrainingMetrics> getMetricsForEpoch(
            @PathVariable int epoch) {
        log.info("Nhận yêu cầu lấy metrics cho epoch {}", epoch);
        TrainingMetrics metrics = trainingService.getMetricsForEpoch(epoch);
        
        if (metrics == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(metrics);
    }
} 