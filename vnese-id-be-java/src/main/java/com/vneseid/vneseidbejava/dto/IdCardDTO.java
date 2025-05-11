package com.vneseid.vneseidbejava.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class IdCardDTO {
    
    private String id;
    private String name;
    private String dob;
    private String gender;
    private String nationality;
    private String address;
    
    @JsonProperty("place_of_birth")
    private String placeOfBirth;
    
    @JsonProperty("expire_date")
    private String expireDate;
    
    @JsonProperty("image_avt")
    private String imageAvt;
} 