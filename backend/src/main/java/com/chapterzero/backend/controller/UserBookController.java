package com.chapterzero.backend.controller;

import com.chapterzero.backend.entity.Book;
import com.chapterzero.backend.entity.ReadingStatus;
import com.chapterzero.backend.entity.User;
import com.chapterzero.backend.entity.UserBook;
import com.chapterzero.backend.repository.BookRepository;
import com.chapterzero.backend.repository.UserBookRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/user-books")
public class UserBookController {

    private final UserBookRepository userBookRepository;
    private final BookRepository bookRepository;

    public UserBookController(
            UserBookRepository userBookRepository,
            BookRepository bookRepository
    ) {
        this.userBookRepository = userBookRepository;
        this.bookRepository = bookRepository;
    }

    // =========================================================
    // GET MY LIBRARY
    // =========================================================

    @GetMapping
    public List<UserBook> getMyLibrary(
            @AuthenticationPrincipal User user
    ) {
        return userBookRepository.findAllByUserId(
                user.getId()
        );
    }

    // =========================================================
    // ADD BOOK
    // =========================================================

    @PostMapping("/{bookId}")
    @ResponseStatus(HttpStatus.CREATED)
    public UserBook addBook(
            @PathVariable Long bookId,
            @AuthenticationPrincipal User user
    ) {

        if (
            userBookRepository.existsByUserIdAndBookId(
                user.getId(),
                bookId
            )
        ) {
            return userBookRepository
                    .findByUserIdAndBookId(
                        user.getId(),
                        bookId
                    )
                    .orElseThrow();
        }

        Book book =
                bookRepository
                    .findById(bookId)
                    .orElseThrow(() ->
                        new IllegalArgumentException(
                            "Book not found"
                        )
                    );

        UserBook userBook =
                new UserBook();

        userBook.setUser(user);

        userBook.setBook(book);

        userBook.setStatus(
            ReadingStatus.WANT_TO_READ
        );

        userBook.setCurrentPage(0);

        return userBookRepository.save(
                userBook
        );
    }

    // =========================================================
    // UPDATE READING STATUS
    // =========================================================

    @PutMapping("/{id}/status")
    public UserBook updateStatus(
            @PathVariable Long id,
            @RequestParam ReadingStatus status,
            @AuthenticationPrincipal User user
    ) {

        UserBook userBook =
                userBookRepository
                    .findByIdAndUserId(
                        id,
                        user.getId()
                    )
                    .orElseThrow(() ->
                        new IllegalArgumentException(
                            "Book not found in your library"
                        )
                    );

        userBook.setStatus(status);

        if (
            status == ReadingStatus.CURRENTLY_READING &&
            userBook.getStartedAt() == null
        ) {
            userBook.setStartedAt(
                LocalDate.now()
            );
        }

        if (
            status == ReadingStatus.READ
        ) {
            userBook.setFinishedAt(
                LocalDate.now()
            );

            if (
                userBook.getTotalPages() != null
            ) {
                userBook.setCurrentPage(
                    userBook.getTotalPages()
                );
            }
        }

        return userBookRepository.save(
                userBook
        );
    }

    // =========================================================
    // UPDATE READING PROGRESS
    // =========================================================

    @PutMapping("/{id}/progress")
    public UserBook updateProgress(
            @PathVariable Long id,
            @RequestParam Integer currentPage,
            @RequestParam(required = false)
            Integer totalPages,
            @AuthenticationPrincipal User user
    ) {

        UserBook userBook =
                userBookRepository
                    .findByIdAndUserId(
                        id,
                        user.getId()
                    )
                    .orElseThrow(() ->
                        new IllegalArgumentException(
                            "Book not found in your library"
                        )
                    );

        if (currentPage < 0) {
            throw new IllegalArgumentException(
                "Current page cannot be negative"
            );
        }

        userBook.setCurrentPage(
            currentPage
        );

        if (
            totalPages != null &&
            totalPages > 0
        ) {
            userBook.setTotalPages(
                totalPages
            );
        }

        if (
            userBook.getTotalPages() != null &&
            currentPage >=
                userBook.getTotalPages()
        ) {

            userBook.setCurrentPage(
                userBook.getTotalPages()
            );

            userBook.setStatus(
                ReadingStatus.READ
            );

            userBook.setFinishedAt(
                LocalDate.now()
            );
        }

        return userBookRepository.save(
                userBook
        );
    }

    // =========================================================
    // REMOVE BOOK
    // =========================================================

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeBook(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {

        UserBook userBook =
                userBookRepository
                    .findByIdAndUserId(
                        id,
                        user.getId()
                    )
                    .orElseThrow(() ->
                        new IllegalArgumentException(
                            "Book not found in your library"
                        )
                    );

        userBookRepository.delete(
            userBook
        );
    }
}