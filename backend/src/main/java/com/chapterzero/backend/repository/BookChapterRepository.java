package com.chapterzero.backend.repository;

import com.chapterzero.backend.entity.BookChapter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookChapterRepository
        extends JpaRepository<BookChapter, Long> {

    List<BookChapter> findByBookIdOrderByChapterNumberAsc(Long bookId);

    void deleteByBookId(Long bookId);
}