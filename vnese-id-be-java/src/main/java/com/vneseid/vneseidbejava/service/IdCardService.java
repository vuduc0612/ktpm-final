package com.vneseid.vneseidbejava.service;

import com.vneseid.vneseidbejava.dto.IdCardDTO;
import com.vneseid.vneseidbejava.model.IdCard;
import org.springframework.web.multipart.MultipartFile;

public interface IdCardService {
    
    /**
     * Extract IdCard information from uploaded image by calling Python API
     * @param file Image file containing IdCard
     * @return IdCard information
     */
    IdCardDTO extractIdCardInfo(MultipartFile file);
    
    /**
     * Save IdCard information to database
     * @param idCardDTO IdCard data transfer object
     * @param userId User ID to associate the ID card with
     * @return Saved IdCard entity
     */
    IdCard saveIdCardInfo(IdCardDTO idCardDTO, Long userId);
    
    /**
     * Get IdCard information by user ID
     * @param userId User ID
     * @return IdCard information or null if not found
     */
    IdCardDTO getIdCardByUserId(Long userId);
} 