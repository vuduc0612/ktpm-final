package com.vneseid.vneseidbejava.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "id_cards")
@ToString
public class IdCard {
    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String dob;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    @JsonProperty("place_of_birth")
    private String placeOfBirth;

    @Column(nullable = false)
    private String nationality;

    @Column(nullable = false)
    @JsonProperty("expiration_date")
    private String expirationDate;

    @Column
    @JsonProperty("image_avt")
    private String imageAvt;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"idCardZoneMetricList", "idCardRegionList", "password"})
    private User user;
}
