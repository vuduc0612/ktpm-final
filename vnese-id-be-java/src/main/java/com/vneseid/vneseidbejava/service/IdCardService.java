package com.vneseid.vneseidbejava.service;

import com.vneseid.vneseidbejava.model.IdCard;
import org.springframework.web.multipart.MultipartFile;

public interface IdCardService {

    IdCard extractIdCardInfo(MultipartFile file);

    IdCard extractIdCardInfo(MultipartFile file, String modelType);

    IdCard saveIdCardInfo(IdCard idCardDTO, Long userId);

    IdCard getIdCardByUserId(Long userId);
} 