package com.vneseid.vneseidbejava.service;

import java.util.Map;

public interface AuthService {
    /**
     * Xác thực người dùng dựa trên thông tin đăng nhập
     * @param username Tên đăng nhập
     * @param password Mật khẩu
     * @return Kết quả đăng nhập kèm token và thông tin người dùng
     */
    Map<String, Object> login(String username, String password);
} 