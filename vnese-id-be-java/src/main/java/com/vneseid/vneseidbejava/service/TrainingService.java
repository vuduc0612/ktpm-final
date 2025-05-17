package com.vneseid.vneseidbejava.service;

import com.vneseid.vneseidbejava.model.TrainingParam;
import com.vneseid.vneseidbejava.model.TrainingStatus;

/**
 * Service interface để tương tác với API huấn luyện mô hình YOLOv5 FastAPI
 */
public interface TrainingService {

    TrainingStatus startTraining(TrainingParam params);

    TrainingStatus stopTraining();

    TrainingStatus getTrainingStatus();

} 