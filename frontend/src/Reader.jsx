import { useEffect, useMemo, useRef, useState } from "react";
import "./Reader.css";
import { apiFetch } from "./api";

function Reader({ book, onClose }) {
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fontSize, setFontSize] = useState(19);
  const [lineHeight, setLineHeight] = useState(1.85);
  const [theme, setTheme] = useState("dark");
  const [showControls, setShowControls] = useState(true);

  const [bookmarks, setBookmarks] = useState([]);
  const [showContents, setShowContents] = useState(false);

  const [chapterProgress, setChapterProgress] = useState(0);
  const [savingProgress, setSavingProgress] = useState(false);

  const saveTimer = useRef(null);

  const bookId = book?.book?.id;
  const userBookId = book?.id;

  const storageKey = useMemo(
    () => `chapterZeroReader_${bookId}`,
    [bookId]
  );

  // =========================================================
  // RESTORE READER STATE
  // =========================================================

  useEffect(() => {
    if (!bookId) return;

    const saved = localStorage.getItem(storageKey);

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      if (typeof parsed.chapter === "number") {
        setActiveChapter(parsed.chapter);
      }

      if (typeof parsed.fontSize === "number") {
        setFontSize(parsed.fontSize);
      }

      if (typeof parsed.lineHeight === "number") {
        setLineHeight(parsed.lineHeight);
      }

      if (parsed.theme) {
        setTheme(parsed.theme);
      }

      if (Array.isArray(parsed.bookmarks)) {
        setBookmarks(parsed.bookmarks);
      }
    } catch {
      console.warn("Could not restore reader settings.");
    }
  }, [bookId, storageKey]);

  // =========================================================
  // SAVE READER STATE
  // =========================================================

  useEffect(() => {
    if (!bookId) return;

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        chapter: activeChapter,
        fontSize,
        lineHeight,
        theme,
        bookmarks,
      })
    );
  }, [
    bookId,
    storageKey,
    activeChapter,
    fontSize,
    lineHeight,
    theme,
    bookmarks,
  ]);

  // =========================================================
  // LOAD CHAPTERS
  // =========================================================

  useEffect(() => {
    if (!bookId) return;

    const loadChapters = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiFetch(
          `/api/book-chapters/book/${bookId}`
        );

        if (!response.ok) {
          throw new Error("Failed to load chapters");
        }

        const data = await response.json();

        setChapters(data);

        if (data.length === 0) {
          setError(
            "This book does not have readable content yet."
          );
        }
      } catch (err) {
        console.error(err);

        setError(
          "Unable to open this book right now."
        );
      } finally {
        setLoading(false);
      }
    };

    loadChapters();
  }, [bookId]);

  // =========================================================
  // CURRENT CHAPTER
  // =========================================================

  const currentChapter =
    chapters[activeChapter];

  // =========================================================
  // BOOK PROGRESS
  // =========================================================

  const progress =
    chapters.length === 0
      ? 0
      : (
          (
            activeChapter +
            chapterProgress
          ) /
          chapters.length
        ) * 100;

  // =========================================================
  // SAVE READING PROGRESS
  // =========================================================

  const saveReadingProgress = (
    calculatedProgress
  ) => {
    if (!userBookId || chapters.length === 0) {
      return;
    }

    const totalPages =
      chapters.length;

    let currentPage = Math.ceil(
      calculatedProgress * totalPages
    );

    currentPage = Math.max(
      1,
      Math.min(
        currentPage,
        totalPages
      )
    );

    setSavingProgress(true);

    clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(
      async () => {
        try {
          const response = await apiFetch(
            `/api/user-books/${userBookId}/progress?currentPage=${currentPage}&totalPages=${totalPages}`,
            {
              method: "PUT",
            }
          );

          if (!response.ok) {
            throw new Error(
              "Could not save reading progress"
            );
          }
        } catch (error) {
          console.error(
            "Progress save failed:",
            error
          );
        } finally {
          setSavingProgress(false);
        }
      },
      700
    );
  };

  // =========================================================
  // TRACK SCROLL POSITION
  // =========================================================

  useEffect(() => {
    if (!currentChapter) return;

    const readerShell =
      document.querySelector(
        ".reader-shell"
      );

    if (!readerShell) return;

    const handleScroll = () => {
      const scrollTop =
        readerShell.scrollTop;

      const viewportHeight =
        readerShell.clientHeight;

      const documentHeight =
        readerShell.scrollHeight;

      const scrollableHeight =
        documentHeight -
        viewportHeight;

      if (scrollableHeight <= 0) {
        setChapterProgress(1);
        return;
      }

      const percentage =
        Math.min(
          1,
          Math.max(
            0,
            scrollTop /
              scrollableHeight
          )
        );

      setChapterProgress(
        percentage
      );

      const overallProgress =
        (
          activeChapter +
          percentage
        ) /
        Math.max(
          chapters.length,
          1
        );

      saveReadingProgress(
        overallProgress
      );
    };

    readerShell.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    handleScroll();

    return () => {
      readerShell.removeEventListener(
        "scroll",
        handleScroll
      );

      clearTimeout(
        saveTimer.current
      );
    };
  }, [
    activeChapter,
    currentChapter,
    chapters.length,
    userBookId,
  ]);

  // =========================================================
  // SCROLL READER TO TOP
  // =========================================================

  const scrollReaderToTop = () => {
    const readerShell =
      document.querySelector(
        ".reader-shell"
      );

    if (!readerShell) return;

    readerShell.scrollTo({
      top: 0,
      behavior: "instant",
    });
  };

  // =========================================================
  // KEYBOARD CONTROLS
  // =========================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (
        event.key === "f" ||
        event.key === "F"
      ) {
        setShowControls(
          (previous) => !previous
        );
        return;
      }

      if (event.key === "ArrowLeft") {
        goPrevious();
        return;
      }

      if (event.key === "ArrowRight") {
        goNext();
        return;
      }

      if (
        event.key === "+" ||
        event.key === "="
      ) {
        setFontSize(
          (previous) =>
            Math.min(
              previous + 1,
              30
            )
        );
        return;
      }

      if (event.key === "-") {
        setFontSize(
          (previous) =>
            Math.max(
              previous - 1,
              13
            )
        );
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  });

  // =========================================================
  // GO PREVIOUS
  // =========================================================

  const goPrevious = () => {
    if (activeChapter === 0) {
      return;
    }

    setActiveChapter(
      (previous) =>
        Math.max(
          previous - 1,
          0
        )
    );

    setChapterProgress(0);

    setTimeout(() => {
      scrollReaderToTop();
    }, 0);
  };

  // =========================================================
  // GO NEXT
  // =========================================================

  const goNext = () => {
    if (
      activeChapter >=
      chapters.length - 1
    ) {
      return;
    }

    setActiveChapter(
      (previous) =>
        Math.min(
          previous + 1,
          Math.max(
            chapters.length - 1,
            0
          )
        )
    );

    setChapterProgress(0);

    setTimeout(() => {
      scrollReaderToTop();
    }, 0);
  };

  // =========================================================
  // SELECT CHAPTER
  // =========================================================

  const selectChapter = (
    index
  ) => {
    setActiveChapter(index);
    setChapterProgress(0);
    setShowContents(false);

    setTimeout(() => {
      scrollReaderToTop();
    }, 0);
  };

  // =========================================================
  // BOOKMARK
  // =========================================================

  const toggleBookmark = () => {
    if (!currentChapter) return;

    const chapterNumber =
      currentChapter.chapterNumber;

    setBookmarks(
      (previous) => {
        if (
          previous.includes(
            chapterNumber
          )
        ) {
          return previous.filter(
            (number) =>
              number !==
              chapterNumber
          );
        }

        return [
          ...previous,
          chapterNumber,
        ];
      }
    );
  };

  const isBookmarked =
    currentChapter &&
    bookmarks.includes(
      currentChapter.chapterNumber
    );

  // =========================================================
  // READER THEME
  // =========================================================

  const readerClass =
    theme === "light"
      ? "reader-shell reader-light"
      : theme === "sepia"
        ? "reader-shell reader-sepia"
        : "reader-shell reader-dark";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className={readerClass}>

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      {showControls && (
        <header className="reader-topbar">

          <button
            className="reader-back-button"
            onClick={onClose}
          >
            ← Library
          </button>

          <div className="reader-title-area">

            <span className="reader-chapter-label">
              CHAPTER ZERO · READING ROOM
            </span>

            <h1>
              {book?.book?.title ||
                "Untitled Book"}
            </h1>

            <p>
              {book?.book?.author ||
                "Unknown Author"}
            </p>

          </div>

          <div className="reader-top-actions">

            <button
              className="reader-icon-button"
              title="Table of contents"
              onClick={() =>
                setShowContents(
                  (previous) =>
                    !previous
                )
              }
            >
              ☰
            </button>

            <button
              className="reader-icon-button"
              title="Decrease font size"
              onClick={() =>
                setFontSize(
                  (previous) =>
                    Math.max(
                      previous - 1,
                      13
                    )
                )
              }
            >
              A−
            </button>

            <span className="reader-font-size">
              {fontSize}px
            </span>

            <button
              className="reader-icon-button"
              title="Increase font size"
              onClick={() =>
                setFontSize(
                  (previous) =>
                    Math.min(
                      previous + 1,
                      30
                    )
                )
              }
            >
              A+
            </button>

            <button
              className="reader-icon-button"
              title="Change theme"
              onClick={() => {
                setTheme(
                  (previous) => {
                    if (
                      previous ===
                      "dark"
                    ) {
                      return "sepia";
                    }

                    if (
                      previous ===
                      "sepia"
                    ) {
                      return "light";
                    }

                    return "dark";
                  }
                );
              }}
            >
              ◐
            </button>

            <button
              className="reader-icon-button"
              title="Line spacing"
              onClick={() =>
                setLineHeight(
                  (previous) =>
                    previous >= 2.2
                      ? 1.6
                      : Number(
                          (
                            previous +
                            0.2
                          ).toFixed(1)
                        )
                )
              }
            >
              ↕
            </button>

            <button
              className="reader-icon-button"
              title="Bookmark chapter"
              onClick={
                toggleBookmark
              }
            >
              {isBookmarked
                ? "★"
                : "☆"}
            </button>

          </div>

        </header>
      )}

      {/* =====================================================
          PROGRESS BAR
      ===================================================== */}

      <div className="reader-progress-track">

        <div
          className="reader-progress-fill"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      {/* =====================================================
          TABLE OF CONTENTS
      ===================================================== */}

      {showContents &&
        showControls &&
        chapters.length > 0 && (

          <aside className="reader-contents-panel">

            <div className="reader-contents-header">

              <span>
                TABLE OF CONTENTS
              </span>

              <button
                onClick={() =>
                  setShowContents(false)
                }
              >
                ×
              </button>

            </div>

            <div className="reader-contents-list">

              {chapters.map(
                (
                  chapter,
                  index
                ) => (

                  <button
                    key={chapter.id}
                    className={
                      index ===
                      activeChapter
                        ? "reader-content-item active"
                        : "reader-content-item"
                    }
                    onClick={() =>
                      selectChapter(
                        index
                      )
                    }
                  >

                    <span>
                      {String(
                        chapter.chapterNumber
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <strong>
                      {chapter.title}
                    </strong>

                    {bookmarks.includes(
                      chapter.chapterNumber
                    ) && (
                      <em>
                        ★
                      </em>
                    )}

                  </button>

                )
              )}

            </div>

          </aside>

        )}

      {/* =====================================================
          MAIN READING AREA
      ===================================================== */}

      <main className="reader-main">

        {loading ? (

          <section className="reader-welcome">

            <div className="reader-moon">
              ☾
            </div>

            <span className="reader-eyebrow">
              OPENING YOUR BOOK
            </span>

            <h2>
              Turning the page...
            </h2>

            <p>
              Chapter Zero is preparing
              your reading room.
            </p>

          </section>

        ) : error ? (

          <section className="reader-welcome">

            <div className="reader-moon">
              ✦
            </div>

            <span className="reader-eyebrow">
              READING ROOM
            </span>

            <h2>
              Nothing to read yet.
            </h2>

            <p>
              Add chapters to this book
              and they will appear here.
            </p>

            <button
              className="reader-open-button"
              onClick={onClose}
            >
              Return to Library
            </button>

          </section>

        ) : (

          <article className="reader-page">

            {/* CHAPTER HEADER */}

            <div className="reader-page-header">

              <span>
                CHAPTER{" "}
                {
                  currentChapter?.chapterNumber
                }
              </span>

              <span>
                {activeChapter + 1}
                {" / "}
                {chapters.length}
              </span>

            </div>

            {/* CHAPTER TITLE */}

            <h2 className="reader-chapter-title">
              {currentChapter?.title}
            </h2>

            {/* BOOK TEXT */}

            <div
              className="reader-book-text"
              style={{
                fontSize:
                  `${fontSize}px`,
                lineHeight,
              }}
            >

              {currentChapter?.content
                ?.split(/\n\s*\n/)
                .map(
                  (
                    paragraph,
                    index
                  ) => (

                    <p key={index}>
                      {paragraph.trim()}
                    </p>

                  )
                )}

            </div>

            {/* CHAPTER END */}

            <div className="reader-chapter-end">

              <span>
                ✦
              </span>

            </div>

            {/* NAVIGATION */}

            <div className="reader-page-navigation">

              <button
                className="reader-navigation-button"
                disabled={
                  activeChapter ===
                  0
                }
                onClick={
                  goPrevious
                }
              >
                ← Previous
              </button>

              <div className="reader-page-progress">

                <span>
                  {Math.round(
                    progress
                  )}
                  %
                </span>

                <small>
                  BOOK PROGRESS
                </small>

              </div>

              <button
                className="reader-navigation-button"
                disabled={
                  activeChapter ===
                  chapters.length - 1
                }
                onClick={
                  goNext
                }
              >
                Next →
              </button>

            </div>

          </article>

        )}

      </main>

      {/* =====================================================
          BOTTOM BAR
      ===================================================== */}

      {showControls &&
        chapters.length > 0 && (

          <footer className="reader-bottombar">

            <div className="reader-book-info">

              <span className="reader-small-label">
                READING
              </span>

              <span className="reader-file-name">
                {currentChapter?.title}
              </span>

            </div>

            <div className="reader-session">

              <span>
                Chapter{" "}
                {activeChapter + 1}
              </span>

              <span>
                •
              </span>

              <span>
                {Math.round(
                  progress
                )}
                %
              </span>

              {savingProgress && (
                <span
                  style={{
                    opacity: 0.45,
                  }}
                >
                  Saving...
                </span>
              )}

            </div>

            <div className="reader-hint">

              <kbd>←</kbd>
              <kbd>→</kbd>
              {" "}
              chapters
              &nbsp;·&nbsp;
              <kbd>F</kbd>
              {" "}
              controls

            </div>

          </footer>

        )}

      {/* =====================================================
          SHOW CONTROLS
      ===================================================== */}

      {!showControls && (

        <button
          className="reader-show-controls"
          onClick={() =>
            setShowControls(true)
          }
          title="Show controls"
        >
          ☰
        </button>

      )}

    </div>
  );
}

export default Reader;