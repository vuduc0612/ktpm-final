package com.vneseid.vneseidbejava.controller;

import com.vneseid.vneseidbejava.model.TrainingStatus;
import com.vneseid.vneseidbejava.service.TrainingWebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Controller xử lý WebSocket cho việc theo dõi huấn luyện mô hình
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final TrainingWebSocketService trainingWebSocketService;
    
    /**
     * Bắt đầu kết nối WebSocket để theo dõi quá trình huấn luyện
     */
    @GetMapping("/api/v1/training/ws/connect")
    public @ResponseBody TrainingStatus connect() {
        log.info("Nhận yêu cầu kết nối WebSocket");
        trainingWebSocketService.startWebSocketConnection();
        
        return TrainingStatus.builder()
                .status(trainingWebSocketService.isConnected() ? "connected" : "failed")
                .message(trainingWebSocketService.isConnected() 
                        ? "Bắt đầu kết nối WebSocket thành công" 
                        : "Không thể kết nối WebSocket")
                .build();
    }
    
    /**
     * Dừng kết nối WebSocket theo dõi huấn luyện
     */
    @GetMapping("/api/v1/training/ws/disconnect")
    public @ResponseBody TrainingStatus disconnect() {
        log.info("Nhận yêu cầu ngắt kết nối WebSocket");
        trainingWebSocketService.stopWebSocketConnection();
        
        return TrainingStatus.builder()
                .status("disconnected")
                .message("Đã ngắt kết nối WebSocket")
                .build();
    }
    
    /**
     * Kiểm tra trạng thái kết nối WebSocket
     */
    @GetMapping("/api/v1/training/ws/status")
    public @ResponseBody TrainingStatus status() {
        boolean isConnected = trainingWebSocketService.isConnected();
        log.info("Kiểm tra trạng thái kết nối WebSocket: {}", isConnected);
        
        return TrainingStatus.builder()
                .status(isConnected ? "connected" : "disconnected")
                .message(isConnected 
                        ? "WebSocket đang kết nối" 
                        : "WebSocket chưa kết nối")
                .build();
    }
    
    /**
     * Xử lý tin nhắn từ client
     */
    @MessageMapping("/training/command")
    @SendTo("/topic/training/response")
    public TrainingStatus handleCommand(String command) {
        log.info("Nhận lệnh từ client: {}", command);
        
        // Xử lý lệnh
        if ("connect".equals(command)) {
            trainingWebSocketService.startWebSocketConnection();
            return TrainingStatus.builder()
                    .status("processing")
                    .message("Đang kết nối tới máy chủ huấn luyện")
                    .build();
        } else if ("disconnect".equals(command)) {
            trainingWebSocketService.stopWebSocketConnection();
            return TrainingStatus.builder()
                    .status("processing")
                    .message("Đang ngắt kết nối từ máy chủ huấn luyện")
                    .build();
        }
        
        return TrainingStatus.builder()
                .status("error")
                .message("Lệnh không hợp lệ: " + command)
                .build();
    }
} 