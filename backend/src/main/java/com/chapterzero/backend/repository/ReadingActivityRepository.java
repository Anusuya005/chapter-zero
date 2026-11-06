package com.chapterzero.backend.repository;

import com.chapterzero.backend.entity.ReadingActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ReadingActivityRepository
        extends JpaRepository<ReadingActivity, Long> {

    boolean existsByActivityDate(LocalDate activityDate);

    List<ReadingActivity> findAllByOrderByActivityDateDesc();
}