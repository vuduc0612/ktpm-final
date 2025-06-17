package com.vneseid.vneseidbejava.model;

import java.time.LocalDateTime;

/**
 * Interface đại diện cho các loại metric huấn luyện
 * Tuân theo Factory Method Pattern (Product interface)
 */
public interface MetricTrain {
    Long getId();
    LocalDateTime getCreatedAt();
    Model getModel();
    void setId(Long id);
    void setCreatedAt(LocalDateTime dateTime);
    void setModel(Model model);
}
