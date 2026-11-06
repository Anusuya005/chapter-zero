package com.chapterzero.backend.repository;

import com.chapterzero.backend.entity.UserBook;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserBookRepository
        extends JpaRepository<UserBook, Long> {

    // =========================================================
    // USER LIBRARY
    // =========================================================

    List<UserBook> findAllByUserId(Long userId);

    // =========================================================
    // FIND A SPECIFIC BOOK FOR A USER
    // =========================================================

    Optional<UserBook> findByUserIdAndBookId(
            Long userId,
            Long bookId
    );

    // =========================================================
    // CHECK WHETHER USER ALREADY HAS BOOK
    // =========================================================

    boolean existsByUserIdAndBookId(
            Long userId,
            Long bookId
    );

    // =========================================================
    // FIND USER'S BOOK BY USERBOOK ID
    // =========================================================

    Optional<UserBook> findByIdAndUserId(
            Long id,
            Long userId
    );
}