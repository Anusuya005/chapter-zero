package com.chapterzero.backend.controller;

import com.chapterzero.backend.entity.Shelf;
import com.chapterzero.backend.entity.ShelfBook;
import com.chapterzero.backend.entity.UserBook;
import com.chapterzero.backend.repository.ShelfBookRepository;
import com.chapterzero.backend.repository.ShelfRepository;
import com.chapterzero.backend.repository.UserBookRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shelves")

public class ShelfController {

    private final ShelfRepository shelfRepository;
    private final ShelfBookRepository shelfBookRepository;
    private final UserBookRepository userBookRepository;

    public ShelfController(
            ShelfRepository shelfRepository,
            ShelfBookRepository shelfBookRepository,
            UserBookRepository userBookRepository
    ) {
        this.shelfRepository = shelfRepository;
        this.shelfBookRepository = shelfBookRepository;
        this.userBookRepository = userBookRepository;
    }

    // =========================
    // GET ALL SHELVES
    // =========================

    @GetMapping
    public List<ShelfResponse> getAllShelves() {

        return shelfRepository.findAll()
                .stream()
                .map(this::toShelfResponse)
                .toList();
    }

    // =========================
    // CREATE SHELF
    // =========================

    @PostMapping
    public ShelfResponse createShelf(
            @RequestBody Map<String, String> request
    ) {

        String name = request.get("name");
        String description = request.get("description");

        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Shelf name cannot be empty"
            );
        }

        name = name.trim();

        if (shelfRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new IllegalArgumentException(
                    "A shelf with this name already exists"
            );
        }

        Shelf shelf = new Shelf();

        shelf.setName(name);
        shelf.setDescription(
                description == null
                        ? ""
                        : description.trim()
        );

        Shelf savedShelf = shelfRepository.save(shelf);

        return toShelfResponse(savedShelf);
    }

    // =========================
    // DELETE SHELF
    // =========================

    @DeleteMapping("/{shelfId}")
    @Transactional
    public void deleteShelf(
            @PathVariable Long shelfId
    ) {

        Shelf shelf = shelfRepository.findById(shelfId)
                .orElseThrow(() ->
                        new RuntimeException("Shelf not found")
                );

        shelfBookRepository.deleteByShelfId(shelf.getId());

        shelfRepository.delete(shelf);
    }

    // =========================
    // GET BOOKS IN SHELF
    // =========================

    @GetMapping("/{shelfId}/books")
    public List<UserBook> getBooksInShelf(
            @PathVariable Long shelfId
    ) {

        if (!shelfRepository.existsById(shelfId)) {
            throw new RuntimeException("Shelf not found");
        }

        return shelfBookRepository
                .findByShelfId(shelfId)
                .stream()
                .map(ShelfBook::getUserBook)
                .toList();
    }

    // =========================
    // ADD BOOK TO SHELF
    // =========================

    @PutMapping("/{shelfId}/books/{userBookId}")
    @Transactional
    public void addBookToShelf(
            @PathVariable Long shelfId,
            @PathVariable Long userBookId
    ) {

        Shelf shelf = shelfRepository.findById(shelfId)
                .orElseThrow(() ->
                        new RuntimeException("Shelf not found")
                );

        UserBook userBook = userBookRepository
                .findById(userBookId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Library entry not found"
                        )
                );

        if (shelfBookRepository
                .existsByShelfIdAndUserBookId(
                        shelfId,
                        userBookId
                )) {

            return;
        }

        ShelfBook shelfBook = new ShelfBook();

        shelfBook.setShelf(shelf);
        shelfBook.setUserBook(userBook);

        shelfBookRepository.save(shelfBook);
    }

    // =========================
    // REMOVE BOOK FROM SHELF
    // =========================

    @DeleteMapping("/{shelfId}/books/{userBookId}")
    @Transactional
    public void removeBookFromShelf(
            @PathVariable Long shelfId,
            @PathVariable Long userBookId
    ) {

        shelfBookRepository.deleteByShelfIdAndUserBookId(
                shelfId,
                userBookId
        );
    }

    // =========================
    // GET SHELVES FOR A BOOK
    // =========================

    @GetMapping("/book/{userBookId}")
    public List<ShelfResponse> getShelvesForBook(
            @PathVariable Long userBookId
    ) {

        if (!userBookRepository.existsById(userBookId)) {
            throw new RuntimeException(
                    "Library entry not found"
            );
        }

        return shelfBookRepository
                .findByUserBookId(userBookId)
                .stream()
                .map(ShelfBook::getShelf)
                .map(this::toShelfResponse)
                .toList();
    }

    // =========================
    // RESPONSE
    // =========================

    private ShelfResponse toShelfResponse(
            Shelf shelf
    ) {

        long bookCount =
                shelfBookRepository
                        .findByShelfId(shelf.getId())
                        .size();

        return new ShelfResponse(
                shelf.getId(),
                shelf.getName(),
                shelf.getDescription(),
                bookCount
        );
    }

    // =========================
    // DTO
    // =========================

    public record ShelfResponse(
            Long id,
            String name,
            String description,
            long bookCount
    ) {
    }
}