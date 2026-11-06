package com.chapterzero.backend.controller;

import com.chapterzero.backend.entity.ReadingActivity;
import com.chapterzero.backend.entity.ReadingGoal;
import com.chapterzero.backend.entity.ReadingStatus;
import com.chapterzero.backend.entity.UserBook;
import com.chapterzero.backend.repository.ReadingActivityRepository;
import com.chapterzero.backend.repository.ReadingGoalRepository;
import com.chapterzero.backend.repository.UserBookRepository;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reading-stats")

public class ReadingStatsController {

    private final UserBookRepository userBookRepository;
    private final ReadingGoalRepository readingGoalRepository;
    private final ReadingActivityRepository readingActivityRepository;

    public ReadingStatsController(
            UserBookRepository userBookRepository,
            ReadingGoalRepository readingGoalRepository,
            ReadingActivityRepository readingActivityRepository
    ) {
        this.userBookRepository = userBookRepository;
        this.readingGoalRepository = readingGoalRepository;
        this.readingActivityRepository = readingActivityRepository;
    }

    @GetMapping
    public ReadingStats getReadingStats() {

        int currentYear = LocalDate.now().getYear();

        List<UserBook> books = userBookRepository.findAll();

        long booksReadThisYear = books.stream()
                .filter(book ->
                        book.getStatus() == ReadingStatus.READ
                                && book.getFinishedAt() != null
                                && book.getFinishedAt().getYear() == currentYear
                )
                .count();

        long currentlyReading = books.stream()
                .filter(book ->
                        book.getStatus() == ReadingStatus.CURRENTLY_READING
                )
                .count();

        int pagesRead = books.stream()
                .mapToInt(book ->
                        book.getCurrentPage() == null
                                ? 0
                                : book.getCurrentPage()
                )
                .sum();

        ReadingGoal goal = readingGoalRepository
                .findByYear(currentYear)
                .orElseGet(() -> {

                    ReadingGoal defaultGoal =
                            new ReadingGoal(currentYear, 24);

                    return readingGoalRepository.save(defaultGoal);
                });

        int targetBooks = goal.getTargetBooks();

        double goalProgress = targetBooks <= 0
                ? 0
                : Math.min(
                        100,
                        (booksReadThisYear * 100.0) / targetBooks
                );

        int currentStreak = calculateCurrentStreak();

        return new ReadingStats(
                currentYear,
                booksReadThisYear,
                currentlyReading,
                pagesRead,
                currentStreak,
                targetBooks,
                Math.round(goalProgress * 100.0) / 100.0
        );
    }

    @PutMapping("/goal")
    public ReadingGoal updateGoal(
            @RequestParam Integer targetBooks
    ) {

        if (targetBooks == null || targetBooks <= 0) {
            throw new IllegalArgumentException(
                    "Reading goal must be greater than zero"
            );
        }

        int currentYear = LocalDate.now().getYear();

        ReadingGoal goal = readingGoalRepository
                .findByYear(currentYear)
                .orElseGet(() -> new ReadingGoal(currentYear, targetBooks));

        goal.setTargetBooks(targetBooks);

        return readingGoalRepository.save(goal);
    }

    private int calculateCurrentStreak() {

        List<ReadingActivity> activities =
                readingActivityRepository.findAllByOrderByActivityDateDesc();

        if (activities.isEmpty()) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        LocalDate latestActivity = activities.get(0).getActivityDate();

        /*
         * If the most recent reading activity was yesterday,
         * the streak is still alive.
         *
         * If it was before yesterday, the streak is broken.
         */
        if (!latestActivity.equals(today)
                && !latestActivity.equals(today.minusDays(1))) {
            return 0;
        }

        int streak = 0;
        LocalDate expectedDate = latestActivity;

        for (ReadingActivity activity : activities) {

            if (activity.getActivityDate().equals(expectedDate)) {
                streak++;
                expectedDate = expectedDate.minusDays(1);
            } else if (activity.getActivityDate().isBefore(expectedDate)) {
                break;
            }
        }

        return streak;
    }

    public record ReadingStats(
            int year,
            long booksReadThisYear,
            long currentlyReading,
            int pagesRead,
            int currentStreak,
            int yearlyGoal,
            double goalProgress
    ) {
    }
}