package com.vneseid.vneseidbejava.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vneseid.vneseidbejava.model.TrainingMetrics;
import com.vneseid.vneseidbejava.model.TrainingStatus;
import com.vneseid.vneseidbejava.service.TrainingWebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.WebSocketClient;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Triển khai service để xử lý WebSocket theo dõi huấn luyện
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TrainingWebSocketServiceImpl implements TrainingWebSocketService, WebSocketHandler {

    private final WebSocketClient webSocketClient;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;
    
    private WebSocketSession session;
    private final AtomicBoolean connected = new AtomicBoolean(false);
    
    @Value("${fastapi.websocket-url:ws://localhost:8000/training/ws}")
    private String fastApiWebSocketUrl;
    
    @Override
    public void startWebSocketConnection() {
        if (connected.get()) {
            log.info("WebSocket đã được kết nối");
            return;
        }
        
        try {
            log.info("Bắt đầu kết nối WebSocket tới {}", fastApiWebSocketUrl);
            webSocketClient.doHandshake(this, fastApiWebSocketUrl);
        } catch (Exception e) {
            log.error("Lỗi khi kết nối WebSocket", e);
        }
    }
    
    @Override
    public void stopWebSocketConnection() {
        if (session != null && session.isOpen()) {
            try {
                log.info("Đóng kết nối WebSocket");
                session.close(CloseStatus.NORMAL);
            } catch (IOException e) {
                log.error("Lỗi khi đóng kết nối WebSocket", e);
            }
        }
        connected.set(false);
    }
    
    @Override
    public boolean isConnected() {
        return connected.get();
    }
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("Kết nối WebSocket đã được thiết lập");
        this.session = session;
        connected.set(true);
        
        // Gửi thông báo kết nối thành công tới client
        messagingTemplate.convertAndSend("/topic/training/status", 
            TrainingStatus.builder().status("connected").message("Kết nối tới máy chủ huấn luyện thành công").build());
    }
    
    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) {
        try {
            String payload = ((TextMessage) message).getPayload();
            log.debug("Nhận tin nhắn WebSocket: {}", payload);
            
            // Phân tích dữ liệu JSON
            Map<String, Object> data = objectMapper.readValue(payload, Map.class);
            String type = (String) data.get("type");
            
            // Xử lý dữ liệu dựa trên loại
            switch (type) {
                case "raw_log":
                    // Gửi log gốc tới client
                    messagingTemplate.convertAndSend("/topic/training/logs", data);
                    break;
                    
                case "epoch_progress":
                    // Gửi tiến trình epoch tới client
                    messagingTemplate.convertAndSend("/topic/training/progress", data);
                    break;
                    
                case "status":
                    // Gửi trạng thái tới client
                    String status = (String) data.get("status");
                    String statusMessage = (String) data.get("message");
                    
                    messagingTemplate.convertAndSend("/topic/training/status", 
                        TrainingStatus.builder().status(status).message(statusMessage).build());
                    break;
                    
                case "metrics":
                    // Gửi metrics tới client
                    messagingTemplate.convertAndSend("/topic/training/metrics", data.get("metrics"));
                    break;
                    
                case "validation":
                    // Gửi kết quả validation tới client
                    messagingTemplate.convertAndSend("/topic/training/validation", data);
                    break;
                    
                default:
                    // Gửi dữ liệu khác
                    messagingTemplate.convertAndSend("/topic/training/data", data);
                    break;
            }
            
        } catch (Exception e) {
            log.error("Lỗi khi xử lý tin nhắn WebSocket", e);
        }
    }
    
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("Lỗi WebSocket", exception);
        connected.set(false);
        
        // Gửi thông báo lỗi tới client
        messagingTemplate.convertAndSend("/topic/training/status", 
            TrainingStatus.builder().status("error").message("Lỗi kết nối: " + exception.getMessage()).build());
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) {
        log.info("Kết nối WebSocket đã đóng: {}", closeStatus);
        connected.set(false);
        
        // Gửi thông báo đóng kết nối tới client
        messagingTemplate.convertAndSend("/topic/training/status", 
            TrainingStatus.builder().status("disconnected").message("Đã ngắt kết nối từ máy chủ huấn luyện").build());
    }
    
    @Override
    public boolean supportsPartialMessages() {
        return false;
    }
} 