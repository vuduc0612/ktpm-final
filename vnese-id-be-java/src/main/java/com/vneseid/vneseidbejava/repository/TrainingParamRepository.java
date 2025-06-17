package com.vneseid.vneseidbejava.repository;

import com.vneseid.vneseidbejava.model.TrainingParam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
 
@Repository
public interface TrainingParamRepository extends JpaRepository<TrainingParam, Long> {
} 