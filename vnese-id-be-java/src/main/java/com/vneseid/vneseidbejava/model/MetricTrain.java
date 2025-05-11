package com.vneseid.vneseidbejava.model;

import java.time.LocalDateTime;

/**
 * Interface đại diện cho các loại metric huấn luyện
 * Tuân theo Factory Method Pattern (Product interface)
 */
public interface MetricTrain {
    Long getId();
    Integer getEpoch();
    LocalDateTime getCreatedAt();
    User getUser();
    void setId(Long id);
    void setEpoch(Integer epoch);
    void setCreatedAt(LocalDateTime dateTime);
    void setUser(User user);
}
