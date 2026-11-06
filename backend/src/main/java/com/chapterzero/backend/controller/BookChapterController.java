package com.chapterzero.backend.controller;

import com.chapterzero.backend.entity.Book;
import com.chapterzero.backend.entity.BookChapter;
import com.chapterzero.backend.repository.BookChapterRepository;
import com.chapterzero.backend.repository.BookRepository;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/book-chapters")

public class BookChapterController {

    private final BookChapterRepository chapterRepository;
    private final BookRepository bookRepository;

    public BookChapterController(
            BookChapterRepository chapterRepository,
            BookRepository bookRepository
    ) {
        this.chapterRepository = chapterRepository;
        this.bookRepository = bookRepository;
    }

    @GetMapping("/book/{bookId}")
    public List<BookChapter> getChapters(
            @PathVariable Long bookId
    ) {
        if (!bookRepository.existsById(bookId)) {
            throw new RuntimeException("Book not found");
        }

        return chapterRepository
                .findByBookIdOrderByChapterNumberAsc(bookId);
    }

    @GetMapping("/{chapterId}")
    public BookChapter getChapter(
            @PathVariable Long chapterId
    ) {
        return chapterRepository.findById(chapterId)
                .orElseThrow(() ->
                        new RuntimeException("Chapter not found")
                );
    }

    @PostMapping("/book/{bookId}")
    public BookChapter createChapter(
            @PathVariable Long bookId,
            @RequestBody ChapterRequest request
    ) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() ->
                        new RuntimeException("Book not found")
                );

        if (request.chapterNumber() == null ||
                request.chapterNumber() < 1) {
            throw new IllegalArgumentException(
                    "Chapter number must be greater than zero"
            );
        }

        if (request.title() == null ||
                request.title().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Chapter title cannot be empty"
            );
        }

        if (request.content() == null ||
                request.content().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Chapter content cannot be empty"
            );
        }

        BookChapter chapter = new BookChapter();

        chapter.setBook(book);
        chapter.setChapterNumber(request.chapterNumber());
        chapter.setTitle(request.title().trim());
        chapter.setContent(request.content().trim());

        return chapterRepository.save(chapter);
    }

    @PutMapping("/{chapterId}")
    public BookChapter updateChapter(
            @PathVariable Long chapterId,
            @RequestBody ChapterRequest request
    ) {
        BookChapter chapter =
                chapterRepository.findById(chapterId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Chapter not found"
                                )
                        );

        if (request.chapterNumber() != null) {
            chapter.setChapterNumber(request.chapterNumber());
        }

        if (request.title() != null &&
                !request.title().trim().isEmpty()) {
            chapter.setTitle(request.title().trim());
        }

        if (request.content() != null &&
                !request.content().trim().isEmpty()) {
            chapter.setContent(request.content().trim());
        }

        return chapterRepository.save(chapter);
    }

    @DeleteMapping("/{chapterId}")
    public void deleteChapter(
            @PathVariable Long chapterId
    ) {
        if (!chapterRepository.existsById(chapterId)) {
            throw new RuntimeException("Chapter not found");
        }

        chapterRepository.deleteById(chapterId);
    }

    @DeleteMapping("/book/{bookId}")
    @Transactional
    public void deleteAllChapters(
            @PathVariable Long bookId
    ) {
        chapterRepository.deleteByBookId(bookId);
    }

    public record ChapterRequest(
            Integer chapterNumber,
            String title,
            String content
    ) {}
}