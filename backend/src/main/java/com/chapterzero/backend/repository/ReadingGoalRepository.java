package com.chapterzero.backend.repository;

import com.chapterzero.backend.entity.ReadingGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReadingGoalRepository
        extends JpaRepository<ReadingGoal, Long> {

    Optional<ReadingGoal> findByYear(Integer year);
}