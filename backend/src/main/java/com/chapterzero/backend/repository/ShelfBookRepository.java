package com.chapterzero.backend.repository;

import com.chapterzero.backend.entity.ShelfBook;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShelfBookRepository
        extends JpaRepository<ShelfBook, Long> {

    List<ShelfBook> findByShelfId(Long shelfId);

    List<ShelfBook> findByUserBookId(Long userBookId);

    Optional<ShelfBook> findByShelfIdAndUserBookId(
            Long shelfId,
            Long userBookId
    );

    boolean existsByShelfIdAndUserBookId(
            Long shelfId,
            Long userBookId
    );

    void deleteByShelfIdAndUserBookId(
            Long shelfId,
            Long userBookId
    );

    void deleteByShelfId(Long shelfId);
}