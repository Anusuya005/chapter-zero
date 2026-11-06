package com.chapterzero.backend.controller;

import com.chapterzero.backend.entity.Quote;
import com.chapterzero.backend.entity.UserBook;
import com.chapterzero.backend.repository.QuoteRepository;
import com.chapterzero.backend.repository.UserBookRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quotes")

public class QuoteController {

    private final QuoteRepository quoteRepository;
    private final UserBookRepository userBookRepository;

    public QuoteController(
            QuoteRepository quoteRepository,
            UserBookRepository userBookRepository
    ) {
        this.quoteRepository = quoteRepository;
        this.userBookRepository = userBookRepository;
    }

    @GetMapping
    public List<Quote> getAllQuotes() {
        return quoteRepository.findAll();
    }

    @GetMapping("/book/{userBookId}")
    public List<Quote> getQuotesForBook(
            @PathVariable Long userBookId
    ) {

        if (!userBookRepository.existsById(userBookId)) {
            throw new RuntimeException(
                    "Library entry not found"
            );
        }

        return quoteRepository
                .findByUserBookIdOrderByCreatedAtDesc(userBookId);
    }

    @PostMapping
    public Quote createQuote(
            @RequestBody QuoteRequest request
    ) {

        if (request.userBookId() == null) {
            throw new IllegalArgumentException(
                    "User book ID is required"
            );
        }

        if (request.quoteText() == null
                || request.quoteText().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Quote cannot be empty"
            );
        }

        UserBook userBook =
                userBookRepository
                        .findById(request.userBookId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Library entry not found"
                                ));

        if (request.pageNumber() != null
                && request.pageNumber() < 1) {

            throw new IllegalArgumentException(
                    "Page number must be greater than zero"
            );
        }

        Quote quote = new Quote();

        quote.setUserBook(userBook);
        quote.setQuoteText(
                request.quoteText().trim()
        );

        quote.setAnnotation(
                request.annotation() == null
                        ? ""
                        : request.annotation().trim()
        );

        quote.setPageNumber(
                request.pageNumber()
        );

        return quoteRepository.save(quote);
    }

    @PutMapping("/{id}")
    public Quote updateQuote(
            @PathVariable Long id,
            @RequestBody QuoteRequest request
    ) {

        Quote quote =
                quoteRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Quote not found"
                                ));

        if (request.quoteText() == null
                || request.quoteText().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Quote cannot be empty"
            );
        }

        if (request.pageNumber() != null
                && request.pageNumber() < 1) {

            throw new IllegalArgumentException(
                    "Page number must be greater than zero"
            );
        }

        quote.setQuoteText(
                request.quoteText().trim()
        );

        quote.setAnnotation(
                request.annotation() == null
                        ? ""
                        : request.annotation().trim()
        );

        quote.setPageNumber(
                request.pageNumber()
        );

        return quoteRepository.save(quote);
    }

    @DeleteMapping("/{id}")
    public void deleteQuote(
            @PathVariable Long id
    ) {

        if (!quoteRepository.existsById(id)) {
            throw new RuntimeException(
                    "Quote not found"
            );
        }

        quoteRepository.deleteById(id);
    }

    public record QuoteRequest(
            Long userBookId,
            String quoteText,
            String annotation,
            Integer pageNumber
    ) {
    }
}