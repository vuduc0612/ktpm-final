package com.vneseid.vneseidbejava.repository;

import com.vneseid.vneseidbejava.model.IdCardZoneMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IdCardZoneMetricRepository extends JpaRepository<IdCardZoneMetric, Long> {
    @Query(value = "SELECT m.* FROM id_card_zone_metric m " +
           "INNER JOIN models model ON m.model_id = model.id " +
           "WHERE model.user_id = :userId " +
           "ORDER BY m.metric_precision DESC LIMIT :limit", nativeQuery = true)
    List<IdCardZoneMetric> findTopByModelUserIdOrderByPrecisionDesc(@Param("userId") Long userId, @Param("limit") int limit);
}
