package com.vneseid.vneseidbejava.repository;

import com.vneseid.vneseidbejava.model.TextRecognitionMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TextRecognitionMetricRepository extends JpaRepository<TextRecognitionMetric, Long> {
} 