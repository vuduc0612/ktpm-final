package com.vneseid.vneseidbejava.service.impl;

import com.vneseid.vneseidbejava.dto.ExtractResponse;
import com.vneseid.vneseidbejava.dto.IdCardDTO;
import com.vneseid.vneseidbejava.model.IdCard;
import com.vneseid.vneseidbejava.model.User;
import com.vneseid.vneseidbejava.repository.IdCardRepository;
import com.vneseid.vneseidbejava.repository.UserRepository;
import com.vneseid.vneseidbejava.service.IdCardService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class IdCardServiceImpl implements IdCardService {
    
    private static final String PYTHON_API_URL = "http://127.0.0.1:5000/extract_info";
    
    private final RestTemplate restTemplate;
    private final IdCardRepository idCardRepository;
    private final UserRepository userRepository;
    
    @Override
    public IdCardDTO extractIdCardInfo(MultipartFile file) {
        try {
            // Chuẩn bị headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            // Chuẩn bị form data với file ảnh
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            body.add("file", fileResource);
            
            // Tạo HttpEntity
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            // Gọi API Python
            ResponseEntity<Map> response = restTemplate.exchange(
                    PYTHON_API_URL,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );
            
            // Trích xuất kết quả
            Map<String, Object> responseBody = response.getBody();
            IdCard idCard = new IdCard();
            idCard.setId(responseBody.get("id").toString());
            idCard.setName(responseBody.get("name").toString());
            idCard.setDob(responseBody.get("dob").toString());
            idCard.setGender(responseBody.get("gender").toString());
            idCard.setAddress(responseBody.get("address").toString());
            idCard.setNationality(responseBody.get("nationality").toString());
            idCard.setPlaceOfBirth(responseBody.get("place_of_birth").toString());
            idCard.setExpirationDate(responseBody.get("expiration_date").toString());
        } catch (IOException e) {
            throw new RuntimeException("Failed to process the image file", e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract IdCard information: " + e.getMessage(), e);
        }
    }
    
    @Override
    public IdCard saveIdCardInfo(IdCardDTO idCardDTO, Long userId) {
        // Tìm người dùng
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        
        // Kiểm tra xem đã có IdCard cho người dùng này chưa
        IdCard idCard = new IdCard();
        
        // Cập nhật thông tin từ DTO
        idCard.setId(idCardDTO.getId());
        idCard.setName(idCardDTO.getName());
        idCard.setDob(idCardDTO.getDob());
        idCard.setGender(idCardDTO.getGender());
        idCard.setAddress(idCardDTO.getAddress());
        idCard.setNationality(idCardDTO.getNationality());
        idCard.setPlaceOfBirth(idCardDTO.getPlaceOfBirth());
        idCard.setExpirationDate(idCardDTO.getExpireDate());
        idCard.setImageAvt(idCardDTO.getImageAvt());
        idCard.setUser(user);
        
        // Lưu và trả về kết quả
        return idCardRepository.save(idCard);
    }
    
    @Override
    public IdCardDTO getIdCardByUserId(Long userId) {
        IdCard idCard = idCardRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("ID card not found for user with ID: " + userId));
        
        return mapToDTO(idCard);
    }
    
    // Helper method to map from entity to DTO
    private IdCardDTO mapToDTO(IdCard idCard) {
        IdCardDTO dto = new IdCardDTO();
        dto.setId(idCard.getId());
        dto.setName(idCard.getName());
        dto.setDob(idCard.getDob());
        dto.setGender(idCard.getGender());
        dto.setAddress(idCard.getAddress());
        dto.setNationality(idCard.getNationality());
        dto.setPlaceOfBirth(idCard.getPlaceOfBirth());
        dto.setExpireDate(idCard.getExpirationDate());
        dto.setImageAvt(idCard.getImageAvt());
        return dto;
    }
} 