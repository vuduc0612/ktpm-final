package com.vneseid.vneseidbejava.repository;

import com.vneseid.vneseidbejava.model.Model;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
 
@Repository
public interface ModelRepository extends JpaRepository<Model, Long> {
} 