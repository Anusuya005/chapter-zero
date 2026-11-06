import { useEffect, useState } from "react";
import "./ReadingJourney.css";

const API = "http://localhost:8080";

function ReadingJourney() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);

  const loadStats = async () => {
    try {
      const response = await fetch(`${API}/api/reading-stats`);

      if (!response.ok) {
        throw new Error("Unable to load reading statistics");
      }

      const data = await response.json();

      setStats(data);
      setGoalInput(String(data.yearlyGoal));
    } catch (error) {
      console.error("Reading stats error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const saveGoal = async () => {
    const target = Number(goalInput);

    if (!target || target <= 0) {
      alert("Please enter a valid yearly goal.");
      return;
    }

    try {
      setSavingGoal(true);

      const response = await fetch(
        `${API}/api/reading-stats/goal?targetBooks=${target}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to save goal");
      }

      setEditingGoal(false);

      await loadStats();
    } catch (error) {
      console.error("Goal save error:", error);
      alert("Could not save your reading goal.");
    } finally {
      setSavingGoal(false);
    }
  };

  if (loading) {
    return (
      <section className="reading-journey">
        <div className="journey-loading">
          <span>✦</span>
          <p>Opening your reading journey...</p>
        </div>
      </section>
    );
  }

  if (!stats) {
    return null;
  }

  const booksRead = stats.booksReadThisYear;
  const yearlyGoal = stats.yearlyGoal;
  const progress = stats.goalProgress;

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    circumference - (progress / 100) * circumference;

  return (
    <section className="reading-journey">

      <div className="journey-heading">
        <div>
          <span className="journey-eyebrow">
            YOUR READING JOURNEY
          </span>

          <h2>
            A year written in pages.
          </h2>

          <p>
            Every chapter counts. Every book leaves a little
            mark on your year.
          </p>
        </div>

        <div className="journey-year">
          {stats.year}
        </div>
      </div>

      <div className="journey-content">

        {/* GOAL CIRCLE */}

        <div className="goal-card">

          <div className="goal-circle">

            <svg
              viewBox="0 0 140 140"
              className="goal-ring"
            >
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="goal-ring-background"
              />

              <circle
                cx="70"
                cy="70"
                r={radius}
                className="goal-ring-progress"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>

            <div className="goal-circle-content">
              <strong>
                {booksRead}
              </strong>

              <span>
                / {yearlyGoal}
              </span>

              <small>
                books
              </small>
            </div>

          </div>

          <div className="goal-info">

            <span className="goal-label">
              🎯 YEARLY GOAL
            </span>

            {!editingGoal ? (
              <>
                <h3>
                  My {stats.year} goal
                </h3>

                <p>
                  {booksRead} / {yearlyGoal} books
                </p>

                <button
                  className="goal-edit-button"
                  onClick={() => {
                    setGoalInput(String(yearlyGoal));
                    setEditingGoal(true);
                  }}
                >
                  Change goal
                </button>
              </>
            ) : (
              <div className="goal-editor">

                <h3>
                  My {stats.year} goal
                </h3>

                <div className="goal-input-row">

                  <input
                    type="number"
                    min="1"
                    value={goalInput}
                    onChange={(event) =>
                      setGoalInput(event.target.value)
                    }
                    autoFocus
                  />

                  <span>
                    books
                  </span>

                </div>

                <div className="goal-actions">

                  <button
                    className="goal-save-button"
                    onClick={saveGoal}
                    disabled={savingGoal}
                  >
                    {savingGoal
                      ? "Saving..."
                      : "Save goal"}
                  </button>

                  <button
                    className="goal-cancel-button"
                    onClick={() =>
                      setEditingGoal(false)
                    }
                  >
                    Cancel
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>

        {/* STAT CARDS */}

        <div className="journey-stats">

          <div className="journey-stat">
            <span className="journey-stat-icon">
              📚
            </span>

            <div>
              <strong>
                {booksRead}
              </strong>

              <span>
                Books read this year
              </span>
            </div>
          </div>

          <div className="journey-stat">
            <span className="journey-stat-icon">
              🔥
            </span>

            <div>
              <strong>
                {stats.currentStreak}
              </strong>

              <span>
                Day reading streak
              </span>
            </div>
          </div>

          <div className="journey-stat">
            <span className="journey-stat-icon">
              📖
            </span>

            <div>
              <strong>
                {stats.pagesRead.toLocaleString()}
              </strong>

              <span>
                Pages read
              </span>
            </div>
          </div>

          <div className="journey-stat">
            <span className="journey-stat-icon">
              🎯
            </span>

            <div>
              <strong>
                {Math.round(progress)}%
              </strong>

              <span>
                Goal progress
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* GOAL BAR */}

      <div className="journey-progress">

        <div className="journey-progress-header">

          <span>
            Progress toward your {stats.year} goal
          </span>

          <strong>
            {booksRead} / {yearlyGoal} books
          </strong>

        </div>

        <div className="journey-progress-track">

          <div
            className="journey-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

    </section>
  );
}

export default ReadingJourney;