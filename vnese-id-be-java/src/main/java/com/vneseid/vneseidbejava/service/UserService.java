package com.vneseid.vneseidbejava.service;

import com.vneseid.vneseidbejava.model.User;

import java.util.List;

public interface UserService {
    List<User> getAllUsers();

    User getUserById(Long id);

    User createUser(User user);

    User getUserByUsername(String username);
} 