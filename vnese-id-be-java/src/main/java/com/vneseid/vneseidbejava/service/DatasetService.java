package com.vneseid.vneseidbejava.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DatasetService {
    int uploadDataset(MultipartFile[] files);

    int uploadDataset(List<MultipartFile> files);

    int deleteAllDatasetFiles();

    String uploadWeightFile(MultipartFile file);

    boolean deleteWeightFile();

    String getWeightFileName();

    boolean deleteDatasetFile(String filename);
} 