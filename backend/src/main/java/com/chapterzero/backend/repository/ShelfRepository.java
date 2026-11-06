package com.chapterzero.backend.repository;

import com.chapterzero.backend.entity.Shelf;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShelfRepository extends JpaRepository<Shelf, Long> {

    Optional<Shelf> findByNameIgnoreCase(String name);
}