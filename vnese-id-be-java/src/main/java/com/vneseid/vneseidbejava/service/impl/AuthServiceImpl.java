package com.vneseid.vneseidbejava.service.impl;

import com.vneseid.vneseidbejava.config.JwtConfig;
import com.vneseid.vneseidbejava.model.User;
import com.vneseid.vneseidbejava.repository.UserRepository;
import com.vneseid.vneseidbejava.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtConfig jwtConfig;
    private final AuthenticationManager authenticationManager;

    @Override
    public Map<String, Object> login(String username, String password) {
        Map<String, Object> responseMap = new HashMap<>();
        
        try {
            // Xác thực người dùng qua AuthenticationManager
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );
            
            if (authentication.isAuthenticated()) {
                // Lấy thông tin người dùng từ database
                Optional<User> userOptional = userRepository.findByUsername(username);
                
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    
                    // Tạo JWT token
                    String token = jwtConfig.generateToken(username, user.getId());
                    
                    // Đóng gói kết quả
                    Map<String, Object> userData = new HashMap<>();
                    userData.put("userId", user.getId());
                    userData.put("username", user.getUsername());
                    userData.put("email", user.getEmail());
                    
                    responseMap.put("success", true);
                    responseMap.put("message", "Login successful");
                    responseMap.put("token", token);
                    responseMap.put("user", userData);
                    
                    return responseMap;
                }
            }
            
            responseMap.put("success", false);
            responseMap.put("message", "Authentication failed");
            return responseMap;
            
        } catch (BadCredentialsException e) {
            responseMap.put("success", false);
            responseMap.put("message", "Invalid username or password");
            return responseMap;
        } catch (Exception e) {
            responseMap.put("success", false);
            responseMap.put("message", "Error during login: " + e.getMessage());
            return responseMap;
        }
    }
} 