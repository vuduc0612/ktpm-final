package com.vneseid.vneseidbejava.repository;

import com.vneseid.vneseidbejava.model.IdCardZoneMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IdCardZoneMetricRepository extends JpaRepository<IdCardZoneMetric, Long> {
}
