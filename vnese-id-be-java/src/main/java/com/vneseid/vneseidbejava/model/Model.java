package com.vneseid.vneseidbejava.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "models")
@Getter
@Setter
public class Model {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "model_type")
    private String modelType;

    @Column(name = "model_name")
    private String modelName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"models", "idCardRegionList", "password"})
    private User user;

    @OneToMany(mappedBy = "model", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("model")
    private List<IdCardZoneMetric> idCardZoneMetrics = new ArrayList<>();

    @OneToMany(mappedBy = "model", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<TrainingParam> trainingParams = new ArrayList<>();
}