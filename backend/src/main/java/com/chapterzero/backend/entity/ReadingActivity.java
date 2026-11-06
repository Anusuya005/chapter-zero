package com.chapterzero.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(
    name = "reading_activities",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_reading_activity_date",
            columnNames = {"activity_date"}
        )
    }
)
public class ReadingActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    public ReadingActivity() {
    }

    public ReadingActivity(LocalDate activityDate) {
        this.activityDate = activityDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getActivityDate() {
        return activityDate;
    }

    public void setActivityDate(LocalDate activityDate) {
        this.activityDate = activityDate;
    }
}