package com.vneseid.vneseidbejava.controller;

import com.vneseid.vneseidbejava.dto.IdCardDTO;
import com.vneseid.vneseidbejava.model.IdCard;
import com.vneseid.vneseidbejava.service.IdCardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/idcard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IdCardController {

    private final IdCardService idCardService;
    
    @Operation(summary = "Extract information from ID card image")
    @PostMapping(value = "/extract", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> extractIdCardInfo(
            @Parameter(
                description = "ID card image file to extract information from",
                required = true,
                schema = @Schema(type = "string", format = "binary")
            )
            @RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "No file was uploaded");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Kiểm tra loại file
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Only image files are accepted");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Gọi service để trích xuất thông tin
            IdCardDTO idCardInfo = idCardService.extractIdCardInfo(file);
            
            // Trả về kết quả thành công
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "ID card information extracted successfully");
            response.put("data", idCardInfo);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Trả về lỗi
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error extracting ID card information: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @Operation(summary = "Save ID card information")
    @PostMapping("/save")
    public ResponseEntity<?> saveIdCardInfo(
            @RequestBody IdCardDTO idCardDTO,
            @RequestParam Long userId) {
        try {
            // Validate required fields
            if (idCardDTO.getId() == null || idCardDTO.getId().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "ID card number is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Save ID card information
            System.out.println("Saving ID card information for user ID: " + userId);
            System.out.println("ID card information: " + idCardDTO);
            IdCard savedIdCard = idCardService.saveIdCardInfo(idCardDTO, userId);

            
            // Return successful response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "ID card information saved successfully");
            response.put("id", savedIdCard.getId());
            
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error saving ID card information: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @Operation(summary = "Get ID card information by user ID")
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getIdCardByUserId(@PathVariable Long userId) {
        try {
            IdCardDTO idCardDTO = idCardService.getIdCardByUserId(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", idCardDTO);
            
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error retrieving ID card information: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
} 