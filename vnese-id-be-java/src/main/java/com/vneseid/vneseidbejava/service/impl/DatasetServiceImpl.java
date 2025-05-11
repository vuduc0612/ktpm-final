package com.vneseid.vneseidbejava.service.impl;

import com.vneseid.vneseidbejava.service.DatasetService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Stream;

@Service
public class DatasetServiceImpl implements DatasetService {

    private static final String DATASET_PATH = "D:\\vnese-id-management\\dataset";
    private static final String WEIGHT_PATH = "D:\\vnese-id-management\\weights";

    @Override
    public int uploadDataset(MultipartFile[] files) {
        try {
            // Delete existing directory if it exists
            Path datasetDir = Paths.get(DATASET_PATH);
            System.out.println( "Dataset path: " + datasetDir.toAbsolutePath().toString());
            if (Files.exists(datasetDir)) {
                deleteDirectory(datasetDir.toFile());
            }

            // Create new directory
            Files.createDirectories(datasetDir);

            int successCount = 0;
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    // Get original filename
                    String filename = file.getOriginalFilename();
                    if (filename != null) {
                        // Create file path
                        Path filePath = datasetDir.resolve(filename);
                        
                        // Save file
                        Files.copy(file.getInputStream(), filePath);
                        successCount++;
                    }
                }
            }
            return successCount;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload dataset files", e);
        }
    }
    
    @Override
    public int uploadDataset(List<MultipartFile> files) {
        return uploadDataset(files.toArray(new MultipartFile[0]));
    }
    
    @Override
    public int deleteAllDatasetFiles() {
        try {
            Path datasetDir = Paths.get(DATASET_PATH);
            if (!Files.exists(datasetDir)) {
                // Nếu thư mục không tồn tại, tạo mới
                Files.createDirectories(datasetDir);
                return 0;
            }
            
            // Đếm tổng số file trước khi xóa
            int totalFiles = 0;
            try (Stream<Path> files = Files.list(datasetDir)) {
                totalFiles = (int) files.count();
            }
            
            // Xóa tất cả các file
            deleteDirectory(datasetDir.toFile());
            
            // Tạo lại thư mục trống
            Files.createDirectories(datasetDir);
            
            return totalFiles;
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete dataset files", e);
        }
    }
    
    @Override
    public String uploadWeightFile(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("Weight file is empty");
            }
            
            // Tạo thư mục weights nếu chưa tồn tại
            Path weightsDir = Paths.get(WEIGHT_PATH);
            if (!Files.exists(weightsDir)) {
                Files.createDirectories(weightsDir);
            } else {
                // Xóa file weight cũ nếu có
                deleteWeightFile();
            }
            
            // Lấy tên file gốc
            String filename = file.getOriginalFilename();
            if (filename == null) {
                throw new IllegalArgumentException("Weight file name is null");
            }
            
            // Đảm bảo file có đuôi .pt hoặc .weights
            if (!filename.endsWith(".pt") && !filename.endsWith(".weights")) {
                throw new IllegalArgumentException("Weight file must be .pt or .weights format");
            }
            
            // Lưu file
            Path filePath = weightsDir.resolve(filename);
            Files.copy(file.getInputStream(), filePath);
            
            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload weight file", e);
        }
    }
    
    @Override
    public boolean deleteWeightFile() {
        try {
            Path weightsDir = Paths.get(WEIGHT_PATH);
            if (!Files.exists(weightsDir)) {
                // Nếu thư mục không tồn tại, tạo mới
                Files.createDirectories(weightsDir);
                return false;
            }
            
            boolean deleted = false;
            try (Stream<Path> files = Files.list(weightsDir)) {
                for (Path file : files.toList()) {
                    Files.delete(file);
                    deleted = true;
                }
            }
            
            return deleted;
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete weight file", e);
        }
    }
    
    @Override
    public String getWeightFileName() {
        try {
            Path weightsDir = Paths.get(WEIGHT_PATH);
            if (!Files.exists(weightsDir)) {
                return null;
            }
            
            try (Stream<Path> files = Files.list(weightsDir)) {
                return files.findFirst()
                        .map(path -> path.getFileName().toString())
                        .orElse(null);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to get weight file name", e);
        }
    }

    private void deleteDirectory(File directory) {
        File[] files = directory.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    deleteDirectory(file);
                } else {
                    if (!file.delete()) {
                        throw new RuntimeException("Failed to delete file: " + file.getAbsolutePath());
                    }
                }
            }
        }
        if (!directory.delete()) {
            throw new RuntimeException("Failed to delete directory: " + directory.getAbsolutePath());
        }
    }
} 