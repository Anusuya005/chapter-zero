package com.chapterzero.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "reading_goals",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_reading_goal_year",
            columnNames = {"year"}
        )
    }
)
public class ReadingGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer targetBooks;

    public ReadingGoal() {
    }

    public ReadingGoal(Integer year, Integer targetBooks) {
        this.year = year;
        this.targetBooks = targetBooks;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getTargetBooks() {
        return targetBooks;
    }

    public void setTargetBooks(Integer targetBooks) {
        this.targetBooks = targetBooks;
    }
}