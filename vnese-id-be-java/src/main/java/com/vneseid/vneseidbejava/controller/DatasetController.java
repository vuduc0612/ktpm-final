package com.vneseid.vneseidbejava.controller;

import com.vneseid.vneseidbejava.service.DatasetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DatasetController {

    private final DatasetService datasetService;

    @Operation(summary = "Upload YOLO dataset files (images and annotations)")
    @PostMapping(value = "/dataset-yolo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadDataset(
            @Parameter(
                description = "Files to upload (multiple images and txt files)",
                required = true,
                schema = @Schema(type = "array", format = "binary")
            )
            @RequestParam("files") List<MultipartFile> files) {
        try {
            if (files == null || files.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "No files were uploaded");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            int uploadedFiles = datasetService.uploadDataset(files);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Dataset uploaded successfully");
            response.put("filesUploaded", uploadedFiles);
            response.put("totalFiles", files.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error uploading files: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @Operation(summary = "Delete all files in the YOLO dataset directory")
    @DeleteMapping("/dataset-yolo")
    public ResponseEntity<Map<String, Object>> deleteAllDatasetFiles() {
        try {
            int deletedFiles = datasetService.deleteAllDatasetFiles();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "All dataset files deleted successfully");
            response.put("filesDeleted", deletedFiles);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error deleting files: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @Operation(summary = "Upload YOLO weight file (.pt or .weights)")
    @PostMapping(value = "/weight-yolo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadWeightFile(
            @Parameter(
                description = "Weight file to upload (.pt or .weights)",
                required = true,
                schema = @Schema(type = "string", format = "binary")
            )
            @RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "No weight file was uploaded");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            String filename = datasetService.uploadWeightFile(file);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Weight file uploaded successfully");
            response.put("filename", filename);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error uploading weight file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @Operation(summary = "Delete the YOLO weight file")
    @DeleteMapping("/weight-yolo")
    public ResponseEntity<Map<String, Object>> deleteWeightFile() {
        try {
            boolean deleted = datasetService.deleteWeightFile();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            if (deleted) {
                response.put("message", "Weight file deleted successfully");
            } else {
                response.put("message", "No weight file found to delete");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error deleting weight file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @Operation(summary = "Get information about current weight file")
    @GetMapping("/weight-yolo")
    public ResponseEntity<Map<String, Object>> getWeightFileInfo() {
        try {
            String filename = datasetService.getWeightFileName();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            
            if (filename != null) {
                response.put("hasWeightFile", true);
                response.put("filename", filename);
            } else {
                response.put("hasWeightFile", false);
                response.put("message", "No weight file found");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error getting weight file info: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
} 