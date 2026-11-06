import { useEffect, useMemo, useRef, useState } from "react";
import "./Reader.css";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

function Reader({ book, onClose }) {
  const readerRef = useRef(null);
  const saveTimerRef = useRef(null);

  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(0);

  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);

  const [theme, setTheme] = useState("parchment");
  const [showControls, setShowControls] = useState(true);
  const [showContents, setShowContents] = useState(false);

  const [bookmarks, setBookmarks] = useState([]);

  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);

  /*
   * ---------------------------------------------------------
   * BOOK ID / USER BOOK ID
   * ---------------------------------------------------------
   */

  const bookId =
    book?.bookId ??
    book?.book?.id ??
    book?.id;

  const userBookId =
    book?.userBookId ??
    book?.userBook?.id ??
    book?.id;

  /*
   * ---------------------------------------------------------
   * TOTAL PAGES
   * ---------------------------------------------------------
   *
   * If the book already has a page count, use it.
   * Otherwise use 300 as a sensible fallback.
   */

  const totalPages = Math.max(
    1,
    Number(
      book?.totalPages ??
        book?.book?.totalPages ??
        book?.pageCount ??
        300
    )
  );

  /*
   * ---------------------------------------------------------
   * LOCAL STORAGE KEY
   * ---------------------------------------------------------
   */

  const storageKey = `chapterZeroReader_${bookId}`;

  /*
   * ---------------------------------------------------------
   * LOAD CHAPTERS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!bookId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadChapters() {
      try {
        setLoading(true);

        const response = await fetch(
          `${API}/api/book-chapters/book/${bookId}`
        );

        if (!response.ok) {
          throw new Error("Unable to load chapters");
        }

        const data = await response.json();

        if (!cancelled) {
          setChapters(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Reader chapter error:", error);

        if (!cancelled) {
          setChapters([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadChapters();

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  /*
   * ---------------------------------------------------------
   * RESTORE SAVED READING POSITION
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (loading || chapters.length === 0) {
      return;
    }

    const saved = localStorage.getItem(storageKey);

    if (!saved) {
      return;
    }

    try {
      const data = JSON.parse(saved);

      const savedChapter = Number(data.chapter);

      if (
        Number.isInteger(savedChapter) &&
        savedChapter >= 0 &&
        savedChapter < chapters.length
      ) {
        setActiveChapter(savedChapter);
      }

      if (typeof data.progress === "number") {
        setProgress(
          Math.min(
            100,
            Math.max(0, data.progress)
          )
        );
      }

      if (typeof data.currentPage === "number") {
        setCurrentPage(
          Math.min(
            totalPages,
            Math.max(1, Math.round(data.currentPage))
          )
        );
      }

      /*
       * Wait for the chapter to render before restoring
       * the exact scroll position.
       */

      setTimeout(() => {
        const container = readerRef.current;

        if (!container) {
          return;
        }

        if (typeof data.chapterScroll === "number") {
          const maxScroll =
            container.scrollHeight -
            container.clientHeight;

          container.scrollTop =
            maxScroll > 0
              ? maxScroll * data.chapterScroll
              : 0;
        }
      }, 150);
    } catch (error) {
      console.error(
        "Could not restore reading position:",
        error
      );
    }
  }, [
    loading,
    chapters.length,
    storageKey,
    totalPages,
  ]);

  /*
   * ---------------------------------------------------------
   * SAVE POSITION LOCALLY
   * ---------------------------------------------------------
   */

  function saveLocalPosition(
    nextProgress = progress,
    nextPage = currentPage,
    nextChapter = activeChapter
  ) {
    const container = readerRef.current;

    let chapterScroll = 0;

    if (container) {
      const maxScroll =
        container.scrollHeight -
        container.clientHeight;

      if (maxScroll > 0) {
        chapterScroll =
          container.scrollTop / maxScroll;
      }
    }

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        chapter: nextChapter,
        progress: nextProgress,
        currentPage: nextPage,
        chapterScroll,
      })
    );
  }

  /*
   * ---------------------------------------------------------
   * SAVE PROGRESS TO BACKEND
   * ---------------------------------------------------------
   *
   * This is attempted automatically.
   *
   * If the backend is unavailable, localStorage still keeps
   * the reading position.
   */

  async function saveBackendProgress(
    nextPage
  ) {
    if (!userBookId) {
      return;
    }

    try {
      setSavingProgress(true);

      const token =
        localStorage.getItem(
          "chapterZeroToken"
        );

      const headers = {};

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      await fetch(
        `${API}/api/user-books/${userBookId}/progress?currentPage=${Math.round(
          nextPage
        )}&totalPages=${totalPages}`,
        {
          method: "PUT",
          headers,
        }
      );
    } catch (error) {
      console.error(
        "Could not save backend progress:",
        error
      );
    } finally {
      setSavingProgress(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * CALCULATE BOOK PROGRESS FROM SCROLL POSITION
   * ---------------------------------------------------------
   *
   * This is the important part.
   *
   * Instead of manually entering pages:
   *
   * chapter position + scroll position
   *              ↓
   *       overall percentage
   *              ↓
   *       approximate page
   */

  function calculateProgress() {
    if (!readerRef.current || chapters.length === 0) {
      return;
    }

    const container = readerRef.current;

    const maxScroll =
      container.scrollHeight -
      container.clientHeight;

    let chapterScroll = 0;

    if (maxScroll > 0) {
      chapterScroll =
        container.scrollTop / maxScroll;
    }

    chapterScroll = Math.min(
      1,
      Math.max(0, chapterScroll)
    );

    /*
     * Each chapter gets an equal portion of the book.
     */

    const chapterProgress =
      (activeChapter + chapterScroll) /
      chapters.length;

    const nextProgress = Math.min(
      100,
      Math.max(
        0,
        chapterProgress * 100
      )
    );

    /*
     * Convert percentage into approximate page.
     */

    const nextPage = Math.min(
      totalPages,
      Math.max(
        1,
        Math.round(
          (nextProgress / 100) *
            totalPages
        )
      )
    );

    setProgress(nextProgress);
    setCurrentPage(nextPage);

    /*
     * Save locally immediately.
     */

    saveLocalPosition(
      nextProgress,
      nextPage,
      activeChapter
    );

    /*
     * Don't hit the backend on every tiny scroll.
     * Wait until scrolling settles.
     */

    clearTimeout(saveTimerRef.current);

    saveTimerRef.current =
      setTimeout(() => {
        saveBackendProgress(nextPage);
      }, 1000);
  }

  /*
   * ---------------------------------------------------------
   * SCROLL LISTENER
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const container = readerRef.current;

    if (!container) {
      return;
    }

    function handleScroll() {
      calculateProgress();
    }

    container.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      container.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [
    activeChapter,
    chapters.length,
    totalPages,
    userBookId,
  ]);

  /*
   * ---------------------------------------------------------
   * CLEANUP
   * ---------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      clearTimeout(saveTimerRef.current);
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * CHANGE CHAPTER
   * ---------------------------------------------------------
   */

  function openChapter(index) {
    if (
      index < 0 ||
      index >= chapters.length
    ) {
      return;
    }

    /*
     * Save current position before leaving chapter.
     */

    calculateProgress();

    setActiveChapter(index);

    setTimeout(() => {
      if (readerRef.current) {
        readerRef.current.scrollTop = 0;
      }

      /*
       * Recalculate progress after chapter change.
       */

      const nextProgress =
        (index / chapters.length) * 100;

      const nextPage = Math.max(
        1,
        Math.round(
          (nextProgress / 100) *
            totalPages
        )
      );

      setProgress(nextProgress);
      setCurrentPage(nextPage);

      saveLocalPosition(
        nextProgress,
        nextPage,
        index
      );

      saveBackendProgress(nextPage);
    }, 50);
  }

  /*
   * ---------------------------------------------------------
   * NEXT / PREVIOUS
   * ---------------------------------------------------------
   */

  function goNext() {
    if (
      activeChapter <
      chapters.length - 1
    ) {
      openChapter(
        activeChapter + 1
      );
    } else {
      /*
       * Final chapter = 100%.
       */

      setProgress(100);
      setCurrentPage(totalPages);

      saveLocalPosition(
        100,
        totalPages,
        activeChapter
      );

      saveBackendProgress(totalPages);
    }
  }

  function goPrevious() {
    if (activeChapter > 0) {
      openChapter(
        activeChapter - 1
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * BOOKMARKS
   * ---------------------------------------------------------
   */

  function toggleBookmark() {
    const bookmark = {
      chapter: activeChapter,
      title:
        chapters[activeChapter]?.title ||
        `Chapter ${activeChapter + 1}`,
      progress: progress,
    };

    setBookmarks((current) => {
      const exists = current.some(
        (item) =>
          item.chapter ===
          activeChapter
      );

      const updated = exists
        ? current.filter(
            (item) =>
              item.chapter !==
              activeChapter
          )
        : [...current, bookmark];

      localStorage.setItem(
        `${storageKey}_bookmarks`,
        JSON.stringify(updated)
      );

      return updated;
    });
  }

  /*
   * ---------------------------------------------------------
   * LOAD BOOKMARKS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const saved =
      localStorage.getItem(
        `${storageKey}_bookmarks`
      );

    if (!saved) {
      return;
    }

    try {
      const data = JSON.parse(saved);

      if (Array.isArray(data)) {
        setBookmarks(data);
      }
    } catch (error) {
      console.error(
        "Could not load bookmarks:",
        error
      );
    }
  }, [storageKey]);

  /*
   * ---------------------------------------------------------
   * KEYBOARD SHORTCUTS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    function handleKeyDown(event) {
      const tag =
        event.target?.tagName;

      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT"
      ) {
        return;
      }

      if (event.key === "ArrowRight") {
        goNext();
      }

      if (event.key === "ArrowLeft") {
        goPrevious();
      }

      if (event.key === "Escape") {
        onClose();
      }

      if (
        event.key === "b" ||
        event.key === "B"
      ) {
        toggleBookmark();
      }
    }

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
  }, [
    activeChapter,
    progress,
    chapters.length,
  ]);

  /*
   * ---------------------------------------------------------
   * READING STYLES
   * ---------------------------------------------------------
   */

  const readerStyle = useMemo(
    () => ({
      fontSize: `${fontSize}px`,
      lineHeight: lineHeight,
    }),
    [fontSize, lineHeight]
  );

  /*
   * ---------------------------------------------------------
   * CURRENT CHAPTER
   * ---------------------------------------------------------
   */

  const currentChapter =
    chapters[activeChapter];

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="reader-overlay">
        <div className="reader-loading">
          <div className="reader-loading-symbol">
            ✦
          </div>

          <h2>Opening your book…</h2>

          <p>
            Preparing your reading space.
          </p>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * NO CHAPTERS
   * ---------------------------------------------------------
   */

  if (chapters.length === 0) {
    return (
      <div className="reader-overlay">
        <div className="reader-empty">
          <div className="reader-empty-symbol">
            ◌
          </div>

          <h2>
            This book isn't ready to read yet.
          </h2>

          <p>
            Chapters haven't been added to
            this book yet.
          </p>

          <button
            className="reader-close-button"
            onClick={onClose}
          >
            Close Reader
          </button>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div
      className={`reader-overlay reader-theme-${theme}`}
    >
      {/* =====================================================
          TOP BAR
      ====================================================== */}

      {showControls && (
        <header className="reader-topbar">
          <div className="reader-book-info">
            <button
              className="reader-icon-button"
              onClick={onClose}
              title="Close reader"
            >
              ←
            </button>

            <div>
              <h2>
                {book?.title ||
                  book?.book?.title ||
                  "Untitled Book"}
              </h2>

              <span>
                {book?.author ||
                  book?.book?.author ||
                  "Unknown Author"}
              </span>
            </div>
          </div>

          <div className="reader-top-actions">
            <button
              className="reader-icon-button"
              onClick={() =>
                setShowContents(
                  !showContents
                )
              }
              title="Table of contents"
            >
              ☰
            </button>

            <button
              className={`reader-icon-button ${
                bookmarks.some(
                  (item) =>
                    item.chapter ===
                    activeChapter
                )
                  ? "active"
                  : ""
              }`}
              onClick={toggleBookmark}
              title="Bookmark"
            >
              🔖
            </button>

            <button
              className="reader-icon-button"
              onClick={() =>
                setShowControls(false)
              }
              title="Hide controls"
            >
              ×
            </button>
          </div>
        </header>
      )}

      {/* =====================================================
          PROGRESS BAR
      ====================================================== */}

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
      ====================================================== */}

      {showContents && (
        <aside className="reader-contents">
          <div className="reader-contents-header">
            <h3>Contents</h3>

            <button
              onClick={() =>
                setShowContents(false)
              }
            >
              ×
            </button>
          </div>

          <div className="reader-chapter-list">
            {chapters.map(
              (chapter, index) => (
                <button
                  key={
                    chapter.id ??
                    index
                  }
                  className={
                    index === activeChapter
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    openChapter(index);
                    setShowContents(false);
                  }}
                >
                  <span>
                    {index + 1}
                  </span>

                  <strong>
                    {chapter.title ||
                      `Chapter ${
                        index + 1
                      }`}
                  </strong>
                </button>
              )
            )}
          </div>
        </aside>
      )}

      {/* =====================================================
          READER
      ====================================================== */}

      <main
        ref={readerRef}
        className="reader-shell"
      >
        <article
          className="reader-page"
          style={readerStyle}
        >
          <div className="reader-chapter-heading">
            <span>
              Chapter {activeChapter + 1}
            </span>

            <h1>
              {currentChapter?.title ||
                `Chapter ${
                  activeChapter + 1
                }`}
            </h1>
          </div>

          <div className="reader-content">
            {currentChapter?.content
              ?.split("\n")
              .map((paragraph, index) => {
                if (
                  !paragraph.trim()
                ) {
                  return (
                    <div
                      key={index}
                      className="reader-paragraph-space"
                    />
                  );
                }

                return (
                  <p key={index}>
                    {paragraph}
                  </p>
                );
              })}
          </div>

          {/* =================================================
              CHAPTER NAVIGATION
          ================================================== */}

          <div className="reader-chapter-navigation">
            <button
              disabled={
                activeChapter === 0
              }
              onClick={goPrevious}
            >
              ← Previous
            </button>

            <div className="reader-chapter-status">
              <span>
                Chapter{" "}
                {activeChapter + 1} of{" "}
                {chapters.length}
              </span>

              <strong>
                {Math.round(progress)}%
              </strong>
            </div>

            <button
              onClick={goNext}
            >
              {activeChapter ===
              chapters.length - 1
                ? "Finish Book"
                : "Next →"}
            </button>
          </div>
        </article>
      </main>

      {/* =====================================================
          BOTTOM CONTROLS
      ====================================================== */}

      {showControls && (
        <footer className="reader-bottom-bar">
          <div className="reader-reading-progress">
            <strong>
              Page {currentPage}
            </strong>

            <span>
              of {totalPages}
            </span>

            <div className="reader-mini-progress">
              <div
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <span>
              {Math.round(progress)}%
            </span>

            {savingProgress && (
              <small>
                Saving…
              </small>
            )}
          </div>

          <div className="reader-controls">
            <button
              onClick={() =>
                setFontSize(
                  Math.max(
                    14,
                    fontSize - 1
                  )
                )
              }
              title="Decrease font size"
            >
              A−
            </button>

            <button
              onClick={() =>
                setFontSize(
                  Math.min(
                    30,
                    fontSize + 1
                  )
                )
              }
              title="Increase font size"
            >
              A+
            </button>

            <button
              onClick={() =>
                setLineHeight(
                  Math.max(
                    1.4,
                    Number(
                      (
                        lineHeight -
                        0.1
                      ).toFixed(1)
                    )
                  )
                )
              }
              title="Decrease line spacing"
            >
              ↕−
            </button>

            <button
              onClick={() =>
                setLineHeight(
                  Math.min(
                    2.4,
                    Number(
                      (
                        lineHeight +
                        0.1
                      ).toFixed(1)
                    )
                  )
                )
              }
              title="Increase line spacing"
            >
              ↕+
            </button>

            <button
              className={
                theme === "light"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTheme("light")
              }
            >
              ☀
            </button>

            <button
              className={
                theme === "parchment"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTheme("parchment")
              }
            >
              📜
            </button>

            <button
              className={
                theme === "dark"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTheme("dark")
              }
            >
              ◐
            </button>
          </div>
        </footer>
      )}

      {!showControls && (
        <button
          className="reader-show-controls"
          onClick={() =>
            setShowControls(true)
          }
        >
          ⚙
        </button>
      )}
    </div>
  );
}

export default Reader;