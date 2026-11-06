package com.chapterzero.backend.repository;

import com.chapterzero.backend.entity.Quote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuoteRepository extends JpaRepository<Quote, Long> {

    List<Quote> findByUserBookIdOrderByCreatedAtDesc(Long userBookId);
}