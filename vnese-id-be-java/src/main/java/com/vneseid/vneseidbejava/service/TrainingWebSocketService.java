package com.vneseid.vneseidbejava.service;

/**
 * Service interface để xử lý WebSocket theo dõi huấn luyện
 */
public interface TrainingWebSocketService {
    
    /**
     * Bắt đầu kết nối WebSocket để theo dõi quá trình huấn luyện
     */
    void startWebSocketConnection();
    
    /**
     * Dừng kết nối WebSocket theo dõi huấn luyện
     */
    void stopWebSocketConnection();
    
    /**
     * Kiểm tra trạng thái kết nối
     * @return true nếu đang kết nối, false nếu không
     */
    boolean isConnected();
} 