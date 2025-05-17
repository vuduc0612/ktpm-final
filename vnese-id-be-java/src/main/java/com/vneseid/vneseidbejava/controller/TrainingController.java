package com.vneseid.vneseidbejava.controller;


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

} 