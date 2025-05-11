package com.vneseid.vneseidbejava.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DatasetService {
    /**
     * Upload dataset files (images and txt files) for YOLO training
     * @param files List of files to upload
     * @return Number of files uploaded successfully
     */
    int uploadDataset(MultipartFile[] files);
    
    /**
     * Upload dataset files (images and txt files) for YOLO training
     * @param files List of files to upload
     * @return Number of files uploaded successfully
     */
    int uploadDataset(List<MultipartFile> files);
    
    /**
     * Delete all files in the dataset directory
     * @return Number of files deleted
     */
    int deleteAllDatasetFiles();
    
    /**
     * Upload YOLO weight file
     * @param file Weight file to upload
     * @return Name of the uploaded file
     */
    String uploadWeightFile(MultipartFile file);
    
    /**
     * Delete YOLO weight file
     * @return true if file was deleted, false if no file existed
     */
    boolean deleteWeightFile();
    
    /**
     * Get the current weight file name if exists
     * @return Weight file name or null if no file exists
     */
    String getWeightFileName();
} 