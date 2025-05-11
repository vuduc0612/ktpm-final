package com.vneseid.vneseidbejava.service;

import com.vneseid.vneseidbejava.dto.UserDTO;

import java.util.List;

public interface UserService {
    /**
     * Lấy tất cả users
     */
    List<UserDTO> getAllUsers();
    
    /**
     * Lấy user theo ID
     */
    UserDTO getUserById(Long id);
    
    /**
     * Tạo user mới
     */
    UserDTO createUser(UserDTO userDTO);
    
    /**
     * Cập nhật user
     */
    UserDTO updateUser(Long id, UserDTO userDTO);
    
    /**
     * Xóa user
     */
    void deleteUser(Long id);
    
    /**
     * Tìm user theo username
     */
    UserDTO getUserByUsername(String username);
} 