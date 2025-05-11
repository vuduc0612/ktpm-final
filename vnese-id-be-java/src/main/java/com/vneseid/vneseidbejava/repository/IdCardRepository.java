package com.vneseid.vneseidbejava.repository;

import com.vneseid.vneseidbejava.model.IdCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IdCardRepository extends JpaRepository<IdCard, String> {
    Optional<IdCard> findByUserId(Long userId);
} 