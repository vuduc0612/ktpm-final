package com.vneseid.vneseidbejava.service.impl;

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
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class IdCardServiceImpl implements IdCardService {
    
    private static final String PYTHON_API_URL = "http://127.0.0.1:8888/api/extraction";
    
    private final RestTemplate restTemplate;
    private final IdCardRepository idCardRepository;
    private final UserRepository userRepository;
    
    @Override
    public IdCard extractIdCardInfo(MultipartFile file) {
        // Gọi phương thức mới với tham số modelType mặc định là "yolo"
        return extractIdCardInfo(file, "yolo");
    }
    
    @Override
    public IdCard extractIdCardInfo(MultipartFile file, String modelType) {
        try {
            // Chuẩn bị headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            // Chuẩn bị form data với file ảnh và tham số modelType
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            body.add("file", fileResource);
            body.add("model_type", modelType);  // Thêm tham số model_type vào request
            
            // Tạo HttpEntity
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            // Check modelType
            if ("ocr".equalsIgnoreCase(modelType)) {
                // Trả về dữ liệu mẫu cho OCR
                return getDummyOcrResult();
            }
            
            // Gọi API Python
            ResponseEntity<Map> response = restTemplate.exchange(
                    PYTHON_API_URL,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );
            
            // Trích xuất kết quả
            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null) {
                throw new RuntimeException("Received null response from API");
            }

            // Log thông tin response để debug
            System.out.println("API Response: " + responseBody);
            
            // Lấy data từ response
            Map<String, Object> dataMap = (Map<String, Object>) responseBody.get("data");
            if (dataMap == null) {
                throw new RuntimeException("Response does not contain 'data' field");
            }
            
            IdCard idCard = new IdCard();
            
            // Kiểm tra và xử lý các trường có thể null từ dataMap
            idCard.setId(getStringValue(dataMap, "id", ""));
            idCard.setName(getStringValue(dataMap, "name", ""));
            idCard.setDob(getStringValue(dataMap, "dob", ""));
            idCard.setGender(getStringValue(dataMap, "gender", ""));
            idCard.setAddress(getStringValue(dataMap, "address", ""));
            idCard.setNationality(getStringValue(dataMap, "nationality", ""));
            idCard.setPlaceOfBirth(getStringValue(dataMap, "place_of_birth", ""));
            idCard.setExpirationDate(getStringValue(dataMap, "expire_date", ""));
            idCard.setImageAvt(getStringValue(dataMap, "image_avt", ""));
            
            System.out.println("ID Card: " + idCard);
            return idCard;
        } catch (IOException e) {
            throw new RuntimeException("Failed to process the image file", e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract IdCard information: " + e.getMessage(), e);
        }
    }
    
    // Phương thức tạo dữ liệu mẫu khi sử dụng OCR
    private IdCard getDummyOcrResult() {
        IdCard dummyCard = new IdCard();
        dummyCard.setId("079283012345");
        dummyCard.setName("VŨ HỮU ĐỨC");
        dummyCard.setDob("12/06/2003");
        dummyCard.setGender("Nam");
        dummyCard.setAddress("Thôn Nội, Minh Hòa, Kinh Môn, Hải Dương");
        dummyCard.setNationality("Việt Nam");
        dummyCard.setPlaceOfBirth("Hải Dương");
        dummyCard.setExpirationDate("12/06/2028");
        dummyCard.setImageAvt("http://localhost:8888/api/extraction/avatar/030203007050_avt.jpg");
        return dummyCard;
    }
    
    // Helper method để lấy giá trị String an toàn từ Map
    private String getStringValue(Map<String, Object> map, String key, String defaultValue) {
        Object value = map.get(key);
        return value != null ? value.toString() : defaultValue;
    }
    
    @Override
    public IdCard saveIdCardInfo(IdCard idCard, Long userId) {
        // Tìm người dùng
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        // Cập nhật thông tin từ DTO
        idCard.setId(idCard.getId());
        idCard.setName(idCard.getName());
        idCard.setDob(idCard.getDob());
        idCard.setGender(idCard.getGender());
        idCard.setAddress(idCard.getAddress());
        idCard.setNationality(idCard.getNationality());
        idCard.setPlaceOfBirth(idCard.getPlaceOfBirth());
        idCard.setExpirationDate(idCard.getExpirationDate());
        idCard.setImageAvt(idCard.getImageAvt());
        idCard.setUser(user);
        
        // Lưu và trả về kết quả
        return idCardRepository.save(idCard);
    }
    
    @Override
    public IdCard getIdCardByUserId(Long userId) {
        IdCard idCard = idCardRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("ID card not found for user with ID: " + userId));
        
        return idCard;
    }
} 