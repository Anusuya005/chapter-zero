import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Auth from "./Auth";
import ReadingJourney from "./ReadingJourney";
import Reader from "./Reader";
import { apiFetch } from "./api";

function App() {
  // =========================================================
  // AUTHENTICATION
  // =========================================================

  const [authenticated, setAuthenticated] = useState(() => {
    return Boolean(
      localStorage.getItem("chapterZeroToken")
    );
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("chapterZeroUser")
      );
    } catch {
      return null;
    }
  });

  const handleLogin = (userData) => {
    setAuthenticated(true);

    setCurrentUser({
      userId: userData.userId,
      name: userData.name,
      email: userData.email,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("chapterZeroToken");
    localStorage.removeItem("chapterZeroUser");

    setAuthenticated(false);
    setCurrentUser(null);

    setLibrary([]);
    setSelectedBook(null);
    setShowReader(false);
  };

  // =========================================================
  // LIBRARY
  // =========================================================

  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // NAVIGATION
  // =========================================================

  const [activeView, setActiveView] = useState("library");

  // =========================================================
  // QUOTES
  // =========================================================

  const [quotes, setQuotes] = useState([]);
  const [allQuotes, setAllQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [quoteAnnotation, setQuoteAnnotation] = useState("");
  const [quotePage, setQuotePage] = useState("");
  const [editingQuote, setEditingQuote] = useState(null);
  const [savingQuote, setSavingQuote] = useState(false);

  // =========================================================
  // CHARACTERS
  // =========================================================

  const [characters, setCharacters] = useState([]);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);

  const [characterForm, setCharacterForm] = useState({
    name: "",
    book: "",
    role: "",
    description: "",
    relationships: "",
  });

  // =========================================================
  // RECOMMENDATIONS
  // =========================================================

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] =
    useState(false);

  // =========================================================
  // READING
  // =========================================================

  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [savingProgress, setSavingProgress] = useState(null);
  const [progressValues, setProgressValues] = useState({});

  const [activeShelf, setActiveShelf] = useState("ALL");

  // =========================================================
  // BOOK DETAILS
  // =========================================================

  const [selectedBook, setSelectedBook] = useState(null);

  // =========================================================
  // READING ROOM
  // =========================================================

  const [showReader, setShowReader] = useState(false);

  // =========================================================
  // CUSTOM SHELVES
  // =========================================================

  const [shelves, setShelves] = useState([]);
  const [activeCustomShelf, setActiveCustomShelf] = useState(null);
  const [customShelfBooks, setCustomShelfBooks] = useState([]);

  const [showShelves, setShowShelves] = useState(false);
  const [showCreateShelf, setShowCreateShelf] = useState(false);

  const [newShelf, setNewShelf] = useState({
    name: "",
    description: "",
  });

  const [creatingShelf, setCreatingShelf] = useState(false);
  const [bookShelves, setBookShelves] = useState([]);
  const [updatingShelfBook, setUpdatingShelfBook] = useState(null);

  // =========================================================
  // DISCOVER
  // =========================================================

  const [showDiscover, setShowDiscover] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchingBooks, setSearchingBooks] = useState(false);
  const [addingDiscoveredBook, setAddingDiscoveredBook] = useState(null);

  // =========================================================
  // MANUAL ADD BOOK
  // =========================================================

  const [showAddBook, setShowAddBook] = useState(false);
  const [addingBook, setAddingBook] = useState(false);

  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    publishedYear: "",
    isbn: "",
    description: "",
    coverUrl: "",
  });

  // =========================================================
  // LOAD LIBRARY
  // =========================================================

  const loadLibrary = async () => {
    try {
      setLoading(true);

      const response = await apiFetch(
        "/api/user-books"
      );

      if (!response.ok) {
        throw new Error("Failed to load library");
      }

      const data = await response.json();

      setLibrary(data);

      const initialProgress = {};

      data.forEach((item) => {
        initialProgress[item.id] =
          item.currentPage ?? 0;
      });

      setProgressValues(initialProgress);
    } catch (error) {
      console.error(
        "Error loading library:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD SHELVES
  // =========================================================

  const loadShelves = async () => {
    try {
      const response = await apiFetch(
        "/api/shelves"
      );

      if (!response.ok) {
        throw new Error("Failed to load shelves");
      }

      setShelves(await response.json());
    } catch (error) {
      console.error(
        "Error loading shelves:",
        error
      );
    }
  };

  // =========================================================
  // LOAD QUOTES FOR ONE BOOK
  // =========================================================

  const loadQuotes = async (userBookId) => {
    if (!userBookId) {
      setQuotes([]);
      return;
    }

    try {
      setLoadingQuotes(true);

      const response = await apiFetch(
        `/api/quotes/book/${userBookId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load quotes");
      }

      setQuotes(await response.json());
    } catch (error) {
      console.error(
        "Error loading quotes:",
        error
      );

      setQuotes([]);
    } finally {
      setLoadingQuotes(false);
    }
  };

  // =========================================================
  // LOAD ALL QUOTES
  // =========================================================

  const loadAllQuotes = async () => {
    if (library.length === 0) {
      setAllQuotes([]);
      return;
    }

    try {
      setLoadingQuotes(true);

      const results = await Promise.all(
        library.map(async (item) => {
          try {
            const response = await apiFetch(
              `/api/quotes/book/${item.id}`
            );

            if (!response.ok) {
              return [];
            }

            const data = await response.json();

            return data.map((quote) => ({
              ...quote,
              libraryBook: item,
            }));
          } catch {
            return [];
          }
        })
      );

      setAllQuotes(results.flat());
    } catch (error) {
      console.error(
        "Error loading all quotes:",
        error
      );

      setAllQuotes([]);
    } finally {
      setLoadingQuotes(false);
    }
  };

  // =========================================================
  // LOAD CHARACTERS
  // =========================================================

  const loadCharacters = () => {
    try {
      const saved = localStorage.getItem(
        "chapter-zero-characters"
      );

      if (saved) {
        setCharacters(JSON.parse(saved));
      }
    } catch (error) {
      console.error(
        "Could not load characters:",
        error
      );
    }
  };

  const saveCharacters = (nextCharacters) => {
    setCharacters(nextCharacters);

    localStorage.setItem(
      "chapter-zero-characters",
      JSON.stringify(nextCharacters)
    );
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    loadLibrary();
    loadShelves();
    loadCharacters();
  }, [authenticated]);

  // =========================================================
  // VIEW-BASED LOADS
  // =========================================================

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    if (activeView === "quotes") {
      loadAllQuotes();
    }

    if (activeView === "recommendations") {
      generateRecommendations();
    }
  }, [activeView, library, authenticated]);

  // =========================================================
  // FILTER LIBRARY
  // =========================================================

  const filteredLibrary = useMemo(() => {
    if (activeCustomShelf) {
      return customShelfBooks;
    }

    if (activeShelf === "ALL") {
      return library;
    }

    return library.filter(
      (item) => item.status === activeShelf
    );
  }, [
    library,
    activeShelf,
    activeCustomShelf,
    customShelfBooks,
  ]);

  // =========================================================
  // SHELF INFORMATION
  // =========================================================

  const shelfTitle = {
    ALL: "My Library",
    CURRENTLY_READING: "Currently Reading",
    WANT_TO_READ: "Want to Read",
    READ: "Read",
  };

  const shelfDescription = {
    ALL: "Your personal reading universe.",
    CURRENTLY_READING:
      "Books you're reading right now.",
    WANT_TO_READ:
      "Books waiting for their chapter to begin.",
    READ: "Books you've completed.",
  };

  // =========================================================
  // BOOK DETAILS
  // =========================================================

  const openBookDetails = async (item) => {
    setActiveView("library");
    setSelectedBook(item);

    await Promise.all([
      loadBookShelves(item.id),
      loadQuotes(item.id),
    ]);
  };

  const closeBookDetails = () => {
    if (showQuoteModal || showReader) {
      return;
    }

    setSelectedBook(null);
    setBookShelves([]);
    setQuotes([]);
  };

  // =========================================================
  // READING ROOM
  // =========================================================

  const openReader = () => {
    if (!selectedBook) {
      return;
    }

    setShowReader(true);
  };

  const closeReader = () => {
    setShowReader(false);
  };

  // =========================================================
  // QUOTE MODAL
  // =========================================================

  const openQuoteModal = (quote = null) => {
    if (quote) {
      setEditingQuote(quote);

      setQuoteText(
        quote.quoteText || ""
      );

      setQuoteAnnotation(
        quote.annotation || ""
      );

      setQuotePage(
        quote.pageNumber
          ? String(quote.pageNumber)
          : ""
      );
    } else {
      setEditingQuote(null);
      setQuoteText("");
      setQuoteAnnotation("");
      setQuotePage("");
    }

    setShowQuoteModal(true);
  };

  const closeQuoteModal = () => {
    if (savingQuote) {
      return;
    }

    setShowQuoteModal(false);
    setEditingQuote(null);
    setQuoteText("");
    setQuoteAnnotation("");
    setQuotePage("");
  };

  // =========================================================
  // SAVE QUOTE
  // =========================================================

  const saveQuote = async () => {
    if (!selectedBook) {
      return;
    }

    if (!quoteText.trim()) {
      alert("Please enter the quote.");
      return;
    }

    const pageNumber =
      quotePage.trim() === ""
        ? null
        : Number(quotePage);

    if (
      pageNumber !== null &&
      (!Number.isInteger(pageNumber) ||
        pageNumber < 1)
    ) {
      alert("Please enter a valid page number.");
      return;
    }

    try {
      setSavingQuote(true);

      const isEditing =
        Boolean(editingQuote);

      const response = await apiFetch(
        isEditing
          ? `/api/quotes/${editingQuote.id}`
          : "/api/quotes",
        {
          method: isEditing
            ? "PUT"
            : "POST",

          body: JSON.stringify(
            isEditing
              ? {
                  quoteText:
                    quoteText.trim(),
                  annotation:
                    quoteAnnotation.trim(),
                  pageNumber,
                }
              : {
                  userBookId:
                    selectedBook.id,
                  quoteText:
                    quoteText.trim(),
                  annotation:
                    quoteAnnotation.trim(),
                  pageNumber,
                }
          ),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to save quote"
        );
      }

      await loadQuotes(
        selectedBook.id
      );

      await loadAllQuotes();

      closeQuoteModal();
    } catch (error) {
      console.error(
        "Error saving quote:",
        error
      );

      alert(
        "Could not save the quote."
      );
    } finally {
      setSavingQuote(false);
    }
  };

  // =========================================================
  // DELETE QUOTE
  // =========================================================

  const deleteQuote = async (quoteId) => {
    const confirmed =
      window.confirm(
        "Delete this quote?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await apiFetch(
        `/api/quotes/${quoteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete quote"
        );
      }

      if (selectedBook) {
        await loadQuotes(
          selectedBook.id
        );
      }

      await loadAllQuotes();
    } catch (error) {
      console.error(
        "Error deleting quote:",
        error
      );

      alert(
        "Could not delete the quote."
      );
    }
  };

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updateStatus = async (
    userBookId,
    status
  ) => {
    try {
      setUpdatingStatus(userBookId);

      const response = await apiFetch(
        `/api/user-books/${userBookId}/status?status=${status}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update status"
        );
      }

      const updatedBook =
        await response.json();

      setLibrary((previous) =>
        previous.map((item) =>
          item.id === updatedBook.id
            ? updatedBook
            : item
        )
      );

      setCustomShelfBooks(
        (previous) =>
          previous.map((item) =>
            item.id === updatedBook.id
              ? updatedBook
              : item
          )
      );

      setSelectedBook(
        (previous) =>
          previous?.id ===
          updatedBook.id
            ? updatedBook
            : previous
      );
    } catch (error) {
      console.error(
        "Error updating status:",
        error
      );

      alert(
        "Could not update reading status."
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // =========================================================
  // UPDATE PROGRESS
  // =========================================================

  const updateProgress = async (
    userBook
  ) => {
    try {
      setSavingProgress(
        userBook.id
      );

      const currentPage =
        Number(
          progressValues[
            userBook.id
          ]
        ) || 0;

      const totalPages =
        userBook.totalPages
          ? Number(
              userBook.totalPages
            )
          : null;

      if (currentPage < 0) {
        alert(
          "Current page cannot be negative."
        );

        return;
      }

      if (
        totalPages !== null &&
        currentPage > totalPages
      ) {
        alert(
          "Current page cannot be greater than total pages."
        );

        return;
      }

      let url =
        `/api/user-books/${userBook.id}/progress` +
        `?currentPage=${currentPage}`;

      if (totalPages !== null) {
        url += `&totalPages=${totalPages}`;
      }

      const response =
        await apiFetch(url, {
          method: "PUT",
        });

      if (!response.ok) {
        throw new Error(
          "Failed to update progress"
        );
      }

      const updatedBook =
        await response.json();

      setLibrary((previous) =>
        previous.map((item) =>
          item.id === updatedBook.id
            ? updatedBook
            : item
        )
      );

      setCustomShelfBooks(
        (previous) =>
          previous.map((item) =>
            item.id === updatedBook.id
              ? updatedBook
              : item
          )
      );

      setSelectedBook(
        (previous) =>
          previous?.id ===
          updatedBook.id
            ? updatedBook
            : previous
      );
    } catch (error) {
      console.error(
        "Error updating progress:",
        error
      );

      alert(
        "Could not save progress."
      );
    } finally {
      setSavingProgress(null);
    }
  };

  // =========================================================
  // DISCOVER
  // =========================================================

  const searchBooks = async (
    event
  ) => {
    event.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    try {
      setSearchingBooks(true);
      setSearchResults([]);

      const response =
        await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(
            searchQuery
          )}&limit=12`
        );

      if (!response.ok) {
        throw new Error(
          "Book search failed"
        );
      }

      const data =
        await response.json();

      setSearchResults(
        data.docs || []
      );
    } catch (error) {
      console.error(
        "Error searching books:",
        error
      );

      alert(
        "Could not search for books."
      );
    } finally {
      setSearchingBooks(false);
    }
  };

  // =========================================================
  // ADD DISCOVERED BOOK
  // =========================================================

  const addDiscoveredBook =
    async (book) => {
      const title =
        book.title ||
        "Untitled";

      const author =
        book.author_name?.[0] ||
        "Unknown Author";

      const isbn =
        book.isbn?.[0] || "";

      const publishedYear =
        book.first_publish_year ||
        null;

      const coverUrl =
        book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
          : "";

      const alreadyExists =
        library.some((item) => {
          const existingTitle =
            item.book?.title
              ?.trim()
              .toLowerCase();

          const existingAuthor =
            item.book?.author
              ?.trim()
              .toLowerCase();

          const newTitle =
            title
              .trim()
              .toLowerCase();

          const newAuthor =
            author
              .trim()
              .toLowerCase();

          if (
            isbn &&
            item.book?.isbn &&
            item.book.isbn === isbn
          ) {
            return true;
          }

          return (
            existingTitle ===
              newTitle &&
            existingAuthor ===
              newAuthor
          );
        });

      if (alreadyExists) {
        alert(
          "This book is already in your library."
        );

        return;
      }

      try {
        setAddingDiscoveredBook(
          book.key
        );

        // -----------------------------------------
        // CREATE BOOK
        // JWT IS NOW ATTACHED
        // -----------------------------------------

        const bookResponse =
          await apiFetch(
            "/api/books",
            {
              method: "POST",

              body: JSON.stringify({
                title,
                author,
                publishedYear,
                isbn,
                description:
                  book
                    .first_sentence?.[0] ||
                  "",
                coverUrl,
              }),
            }
          );

        if (!bookResponse.ok) {
          const errorText =
            await bookResponse.text();

          throw new Error(
            errorText ||
              "Failed to create book"
          );
        }

        const createdBook =
          await bookResponse.json();

        // -----------------------------------------
        // ADD BOOK TO CURRENT USER'S LIBRARY
        // JWT IS NOW ATTACHED
        // -----------------------------------------

        const libraryResponse =
          await apiFetch(
            `/api/user-books/${createdBook.id}`,
            {
              method: "POST",
            }
          );

        if (!libraryResponse.ok) {
          const errorText =
            await libraryResponse.text();

          throw new Error(
            errorText ||
              "Failed to add book to library"
          );
        }

        await loadLibrary();
        await loadShelves();

        alert(
          `"${title}" was added to your library.`
        );
      } catch (error) {
        console.error(
          "Error adding discovered book:",
          error
        );

        alert(
          error.message ||
            "Could not add this book."
        );
      } finally {
        setAddingDiscoveredBook(
          null
        );
      }
    };

  // =========================================================
  // MANUAL ADD
  // =========================================================

  const addBook = async (
    event
  ) => {
    event.preventDefault();

    if (!newBook.title.trim()) {
      alert(
        "Please enter a book title."
      );

      return;
    }

    const alreadyExists =
      library.some((item) => {
        const existingTitle =
          item.book?.title
            ?.trim()
            .toLowerCase();

        const existingAuthor =
          item.book?.author
            ?.trim()
            .toLowerCase();

        const newTitle =
          newBook.title
            .trim()
            .toLowerCase();

        const newAuthor =
          newBook.author
            .trim()
            .toLowerCase();

        if (
          newBook.isbn.trim() &&
          item.book?.isbn &&
          item.book.isbn ===
            newBook.isbn.trim()
        ) {
          return true;
        }

        return (
          existingTitle ===
            newTitle &&
          existingAuthor ===
            newAuthor
        );
      });

    if (alreadyExists) {
      alert(
        "This book is already in your library."
      );

      return;
    }

    try {
      setAddingBook(true);

      // -----------------------------------------
      // CREATE BOOK
      // JWT IS NOW ATTACHED
      // -----------------------------------------

      const bookResponse =
        await apiFetch(
          "/api/books",
          {
            method: "POST",

            body: JSON.stringify({
              title:
                newBook.title.trim(),

              author:
                newBook.author.trim() ||
                "Unknown Author",

              publishedYear:
                newBook.publishedYear
                  ? Number(
                      newBook.publishedYear
                    )
                  : null,

              isbn:
                newBook.isbn.trim() ||
                null,

              description:
                newBook.description
                  .trim() || null,

              coverUrl:
                newBook.coverUrl
                  .trim() || null,
            }),
          }
        );

      if (!bookResponse.ok) {
        const errorText =
          await bookResponse.text();

        throw new Error(
          errorText ||
            "Failed to create book"
        );
      }

      const createdBook =
        await bookResponse.json();

      // -----------------------------------------
      // ADD BOOK TO CURRENT USER'S LIBRARY
      // JWT IS NOW ATTACHED
      // -----------------------------------------

      const libraryResponse =
        await apiFetch(
          `/api/user-books/${createdBook.id}`,
          {
            method: "POST",
          }
        );

      if (!libraryResponse.ok) {
        const errorText =
          await libraryResponse.text();

        throw new Error(
          errorText ||
            "Failed to add book to library"
        );
      }

      await loadLibrary();
      await loadShelves();

      setNewBook({
        title: "",
        author: "",
        publishedYear: "",
        isbn: "",
        description: "",
        coverUrl: "",
      });

      setShowAddBook(false);
    } catch (error) {
      console.error(
        "Error adding book:",
        error
      );

      alert(
        error.message ||
          "Could not add the book."
      );
    } finally {
      setAddingBook(false);
    }
  };

  // =========================================================
  // DELETE BOOK
  // =========================================================

  const removeBook = async (
    userBookId
  ) => {
    const confirmed =
      window.confirm(
        "Remove this book from your library?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await apiFetch(
          `/api/user-books/${userBookId}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Failed to remove book"
        );
      }

      setLibrary((previous) =>
        previous.filter(
          (item) =>
            item.id !== userBookId
        )
      );

      setCustomShelfBooks(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== userBookId
          )
      );

      if (
        selectedBook?.id ===
        userBookId
      ) {
        setShowReader(false);
        setSelectedBook(null);
        setBookShelves([]);
        setQuotes([]);
      }

      await loadShelves();
    } catch (error) {
      console.error(
        "Error removing book:",
        error
      );

      alert(
        "Could not remove the book."
      );
    }
  };

  // =========================================================
  // PROGRESS
  // =========================================================

  const getProgress = (item) => {
    if (
      !item.totalPages ||
      item.totalPages <= 0
    ) {
      return 0;
    }

    const currentPage =
      item.currentPage || 0;

    return Math.min(
      100,
      Math.round(
        (currentPage /
          item.totalPages) *
          100
      )
    );
  };

  // =========================================================
  // SHELVES
  // =========================================================

  const createShelf = async (
    event
  ) => {
    event.preventDefault();

    if (!newShelf.name.trim()) {
      alert(
        "Please enter a shelf name."
      );

      return;
    }

    try {
      setCreatingShelf(true);

      const response =
        await apiFetch(
          "/api/shelves",
          {
            method: "POST",

            body: JSON.stringify({
              name:
                newShelf.name.trim(),

              description:
                newShelf.description.trim(),
            }),
          }
        );

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Failed to create shelf"
        );
      }

      const createdShelf =
        await response.json();

      setShelves((previous) => [
        ...previous,
        createdShelf,
      ]);

      setNewShelf({
        name: "",
        description: "",
      });

      setShowCreateShelf(false);
    } catch (error) {
      console.error(
        "Error creating shelf:",
        error
      );

      alert(
        error.message ||
          "Could not create shelf."
      );
    } finally {
      setCreatingShelf(false);
    }
  };

  const openCustomShelf = async (
    shelf
  ) => {
    try {
      const response =
        await apiFetch(
          `/api/shelves/${shelf.id}/books`
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load shelf books"
        );
      }

      const data =
        await response.json();

      setCustomShelfBooks(data);
      setActiveCustomShelf(shelf);
      setActiveShelf("CUSTOM");
      setActiveView("library");
      setShowShelves(false);
    } catch (error) {
      console.error(
        "Error loading shelf books:",
        error
      );

      alert(
        "Could not open this shelf."
      );
    }
  };

  const leaveCustomShelf = () => {
    setActiveCustomShelf(null);
    setActiveShelf("ALL");
    setCustomShelfBooks([]);
  };

  const deleteShelf = async (
    shelfId
  ) => {
    const shelf =
      shelves.find(
        (item) =>
          item.id === shelfId
      );

    if (!shelf) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${shelf.name}"? The books will stay in your library.`
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await apiFetch(
          `/api/shelves/${shelfId}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Failed to delete shelf"
        );
      }

      setShelves((previous) =>
        previous.filter(
          (item) =>
            item.id !== shelfId
        )
      );

      if (
        activeCustomShelf?.id ===
        shelfId
      ) {
        leaveCustomShelf();
      }

      setBookShelves(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== shelfId
          )
      );
    } catch (error) {
      console.error(
        "Error deleting shelf:",
        error
      );

      alert(
        "Could not delete this shelf."
      );
    }
  };

  const loadBookShelves =
    async (userBookId) => {
      try {
        const response =
          await apiFetch(
            `/api/shelves/book/${userBookId}`
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load book shelves"
          );
        }

        setBookShelves(
          await response.json()
        );
      } catch (error) {
        console.error(
          "Error loading book shelves:",
          error
        );

        setBookShelves([]);
      }
    };

  const addBookToShelf =
    async (shelfId) => {
      if (!selectedBook) {
        return;
      }

      try {
        setUpdatingShelfBook(
          shelfId
        );

        const response =
          await apiFetch(
            `/api/shelves/${shelfId}/books/${selectedBook.id}`,
            {
              method: "PUT",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed to add book to shelf"
          );
        }

        await loadBookShelves(
          selectedBook.id
        );

        await loadShelves();
      } catch (error) {
        console.error(
          "Error adding book to shelf:",
          error
        );

        alert(
          "Could not add book to shelf."
        );
      } finally {
        setUpdatingShelfBook(
          null
        );
      }
    };

  const removeBookFromShelf =
    async (shelfId) => {
      if (!selectedBook) {
        return;
      }

      try {
        setUpdatingShelfBook(
          shelfId
        );

        const response =
          await apiFetch(
            `/api/shelves/${shelfId}/books/${selectedBook.id}`,
            {
              method: "DELETE",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed to remove book from shelf"
          );
        }

        await loadBookShelves(
          selectedBook.id
        );

        await loadShelves();
      } catch (error) {
        console.error(
          "Error removing book from shelf:",
          error
        );

        alert(
          "Could not remove book from shelf."
        );
      } finally {
        setUpdatingShelfBook(
          null
        );
      }
    };

  // =========================================================
  // RECOMMENDATIONS
  // =========================================================

  const generateRecommendations =
    async () => {
      if (library.length === 0) {
        setRecommendations([]);
        return;
      }

      try {
        setLoadingRecommendations(
          true
        );

        const authors = [
          ...new Set(
            library
              .map(
                (item) =>
                  item.book?.author
              )
              .filter(Boolean)
          ),
        ];

        const titles =
          library
            .map(
              (item) =>
                item.book?.title
            )
            .filter(Boolean);

        const queries = [
          ...authors.slice(0, 2),
          ...titles.slice(0, 2),
        ];

        const results =
          await Promise.all(
            queries.map(
              async (query) => {
                try {
                  const response =
                    await fetch(
                      `https://openlibrary.org/search.json?q=${encodeURIComponent(
                        query
                      )}&limit=8`
                    );

                  if (!response.ok) {
                    return [];
                  }

                  const data =
                    await response.json();

                  return data.docs || [];
                } catch {
                  return [];
                }
              }
            )
          );

        const existingKeys =
          new Set(
            library.map((item) =>
              `${item.book?.title || ""}`
                .trim()
                .toLowerCase()
            )
          );

        const seen =
          new Set();

        const cleaned =
          results
            .flat()
            .filter((book) => {
              const title =
                book.title
                  ?.trim()
                  .toLowerCase();

              if (!title) {
                return false;
              }

              if (
                existingKeys.has(
                  title
                ) ||
                seen.has(title)
              ) {
                return false;
              }

              seen.add(title);

              return true;
            })
            .slice(0, 12);

        setRecommendations(
          cleaned
        );
      } catch (error) {
        console.error(
          "Error generating recommendations:",
          error
        );

        setRecommendations([]);
      } finally {
        setLoadingRecommendations(
          false
        );
      }
    };

  // =========================================================
  // CHARACTERS
  // =========================================================

  const openCharacterModal = (
    character = null
  ) => {
    if (character) {
      setEditingCharacter(
        character
      );

      setCharacterForm({
        name:
          character.name || "",
        book:
          character.book || "",
        role:
          character.role || "",
        description:
          character.description ||
          "",
        relationships:
          character.relationships ||
          "",
      });
    } else {
      setEditingCharacter(null);

      setCharacterForm({
        name: "",
        book: "",
        role: "",
        description: "",
        relationships: "",
      });
    }

    setShowCharacterModal(true);
  };

  const closeCharacterModal = () => {
    setShowCharacterModal(false);
    setEditingCharacter(null);

    setCharacterForm({
      name: "",
      book: "",
      role: "",
      description: "",
      relationships: "",
    });
  };

  const saveCharacter = (
    event
  ) => {
    event.preventDefault();

    if (!characterForm.name.trim()) {
      alert(
        "Please enter a character name."
      );

      return;
    }

    if (editingCharacter) {
      const updated =
        characters.map(
          (character) =>
            character.id ===
            editingCharacter.id
              ? {
                  ...character,
                  ...characterForm,
                }
              : character
        );

      saveCharacters(updated);
    } else {
      saveCharacters([
        ...characters,
        {
          id: Date.now(),
          ...characterForm,
        },
      ]);
    }

    closeCharacterModal();
  };

  const deleteCharacter = (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Remove this character from your notebook?"
      );

    if (!confirmed) {
      return;
    }

    saveCharacters(
      characters.filter(
        (character) =>
          character.id !== id
      )
    );
  };

  // =========================================================
  // STATS
  // =========================================================

  const totalBooks =
    library.length;

  const currentlyReadingCount =
    library.filter(
      (item) =>
        item.status ===
        "CURRENTLY_READING"
    ).length;

  const wantToReadCount =
    library.filter(
      (item) =>
        item.status ===
        "WANT_TO_READ"
    ).length;

  const readCount =
    library.filter(
      (item) =>
        item.status ===
        "READ"
    ).length;

  const statsBooksWithPages =
    library.filter(
      (item) =>
        Number(item.totalPages) > 0
    );

  const pagesRead =
    library.reduce((total, item) => {
      const totalPages =
        Number(item.totalPages) || 0;

      const currentPage =
        Number(item.currentPage) || 0;

      if (item.status === "READ") {
        return total +
          (totalPages || currentPage);
      }

      return total +
        Math.min(currentPage, totalPages || currentPage);
    }, 0);

  const pagesAvailable =
    statsBooksWithPages.reduce(
      (total, item) =>
        total + (Number(item.totalPages) || 0),
      0
    );

  const overallProgress =
    pagesAvailable > 0
      ? Math.min(
          100,
          Math.round(
            (pagesRead / pagesAvailable) * 100
          )
        )
      : 0;

  const averagePagesPerBook =
    statsBooksWithPages.length > 0
      ? Math.round(
          pagesAvailable /
            statsBooksWithPages.length
        )
      : 0;

  const currentlyReadingProgress =
    currentlyReadingCount > 0
      ? Math.round(
          library
            .filter(
              (item) =>
                item.status ===
                "CURRENTLY_READING"
            )
            .reduce(
              (sum, item) =>
                sum + getProgress(item),
              0
            ) /
            currentlyReadingCount
        )
      : 0;

  const completionRate =
    totalBooks > 0
      ? Math.round(
          (readCount / totalBooks) * 100
        )
      : 0;

  const longestBook =
    statsBooksWithPages.length > 0
      ? statsBooksWithPages.reduce(
          (longest, item) =>
            Number(item.totalPages) >
            Number(longest.totalPages || 0)
              ? item
              : longest
        )
      : null;

  const readingGoal = 12;

  const readingGoalProgress =
    Math.min(
      100,
      Math.round(
        (readCount / readingGoal) * 100
      )
    );

  const nextBookMilestone =
    readCount < 5
      ? 5
      : readCount < 10
      ? 10
      : readCount < 25
      ? 25
      : Math.ceil(
          (readCount + 1) / 25
        ) * 25;

  const nextPageMilestone =
    pagesRead < 1000
      ? 1000
      : pagesRead < 2500
      ? 2500
      : pagesRead < 5000
      ? 5000
      : Math.ceil(
          (pagesRead + 1) / 5000
        ) * 5000;

  const readerArchetype =
    totalBooks === 0
      ? {
          title: "The First Page",
          text: "Your reading universe is waiting for its first story."
        }
      : readCount >= currentlyReadingCount + wantToReadCount
      ? {
          title: "The Finisher",
          text: "You like seeing stories through to their final page."
        }
      : wantToReadCount >= readCount + currentlyReadingCount
      ? {
          title: "The Curator",
          text: "Your shelves are full of stories waiting for the right moment."
        }
      : currentlyReadingCount > 0
      ? {
          title: "The Wanderer",
          text: "You are always somewhere inside a story."
        }
      : {
          title: "The Story Keeper",
          text: "You are building a reading universe one book at a time."
        };

  // =========================================================
  // NAVIGATION HELPERS
  // =========================================================

  const openLibrary = () => {
    setActiveView("library");
    setShowDiscover(false);
  };

  const openReadingStats = () => {
    setActiveView("stats");
    setActiveCustomShelf(null);
    setCustomShelfBooks([]);
  };

  const openQuotes = () => {
    setActiveView("quotes");
    setSelectedBook(null);
    setShowDiscover(false);
  };

  const openRecommendations = () => {
    setActiveView(
      "recommendations"
    );

    setSelectedBook(null);
    setShowDiscover(false);
  };

  const openCharacters = () => {
    setActiveView("characters");
    setSelectedBook(null);
    setShowDiscover(false);
  };

  // =========================================================
  // AUTH GATE
  // =========================================================

  if (!authenticated) {
    return (
      <Auth
        onLogin={handleLogin}
      />
    );
  }

  // =========================================================
  // SIDEBAR
  // =========================================================

  const sidebar = (
    <aside className="sidebar">

      <div className="logo">
        <div className="logo-mark">
          ✦
        </div>

        <div>
          <h1>
            Chapter Zero
          </h1>

          <span>
            YOUR READING UNIVERSE
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">

        <div className="nav-section-title">
          LIBRARY
        </div>

        <button
          className={`nav-item nav-button ${
            activeView === "library" &&
            activeShelf === "ALL" &&
            !activeCustomShelf
              ? "active"
              : ""
          }`}
          onClick={() => {
            openLibrary();
            setActiveShelf("ALL");
            setActiveCustomShelf(null);
            setCustomShelfBooks([]);
          }}
        >
          <span>▣</span>
          My Library
        </button>

        <button
          className={`nav-item nav-button ${
            activeView === "library" &&
            activeShelf ===
              "CURRENTLY_READING"
              ? "active"
              : ""
          }`}
          onClick={() => {
            openLibrary();

            setActiveShelf(
              "CURRENTLY_READING"
            );

            setActiveCustomShelf(null);
            setCustomShelfBooks([]);
          }}
        >
          <span>◐</span>
          Currently Reading
        </button>

        <button
          className={`nav-item nav-button ${
            activeView === "library" &&
            activeShelf ===
              "WANT_TO_READ"
              ? "active"
              : ""
          }`}
          onClick={() => {
            openLibrary();

            setActiveShelf(
              "WANT_TO_READ"
            );

            setActiveCustomShelf(null);
            setCustomShelfBooks([]);
          }}
        >
          <span>○</span>
          Want to Read
        </button>

        <button
          className={`nav-item nav-button ${
            activeView === "library" &&
            activeShelf === "READ"
              ? "active"
              : ""
          }`}
          onClick={() => {
            openLibrary();

            setActiveShelf(
              "READ"
            );

            setActiveCustomShelf(null);
            setCustomShelfBooks([]);
          }}
        >
          <span>✓</span>
          Read
        </button>

        <div className="nav-section-title">
          EXPLORE
        </div>

        <button
          className="nav-item nav-button"
          onClick={() => {
            setActiveView("library");
            setShowDiscover(true);
            setSearchResults([]);
          }}
        >
          <span>⌕</span>
          Discover Books
        </button>

        <button
          className={`nav-item nav-button ${
            activeView ===
            "recommendations"
              ? "active"
              : ""
          }`}
          onClick={
            openRecommendations
          }
        >
          <span>✦</span>
          Recommendations
        </button>

        <div className="nav-section-title">
          YOUR UNIVERSE
        </div>

        <button
          className="nav-item nav-button"
          onClick={() => {
            setActiveView("library");
            setShowShelves(true);
            setShowDiscover(false);
          }}
        >
          <span>☷</span>
          Shelves
        </button>

        <button
          className={`nav-item nav-button ${
            activeView === "quotes"
              ? "active"
              : ""
          }`}
          onClick={openQuotes}
        >
          <span>❝</span>
          Quotes
        </button>

        <button
          className={`nav-item nav-button ${
            activeView === "characters"
              ? "active"
              : ""
          }`}
          onClick={openCharacters}
        >
          <span>♧</span>
          Characters
        </button>

        <button
          className={`nav-item nav-button ${
            activeView === "stats"
              ? "active"
              : ""
          }`}
          onClick={
            openReadingStats
          }
        >
          <span>◒</span>
          Reading Stats
        </button>

      </nav>

      <div className="sidebar-footer">

        <div className="footer-line"></div>

        {currentUser && (
          <div
            style={{
              marginBottom: "0.8rem",
              padding: "0.75rem",
              borderRadius: "12px",
              background:
                "rgba(255,255,255,0.035)",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "0.72rem",
                opacity: 0.5,
                letterSpacing:
                  "0.12em",
                textTransform:
                  "uppercase",
                marginBottom:
                  "0.25rem",
              }}
            >
              READING AS
            </span>

            <strong
              style={{
                display: "block",
                fontSize: "0.9rem",
                marginBottom:
                  "0.15rem",
              }}
            >
              {currentUser.name}
            </strong>

            <small
              style={{
                display: "block",
                opacity: 0.55,
                overflow:
                  "hidden",
                textOverflow:
                  "ellipsis",
                whiteSpace:
                  "nowrap",
              }}
            >
              {currentUser.email}
            </small>

            <button
              type="button"
              onClick={
                handleLogout
              }
              style={{
                marginTop: "0.7rem",
                width: "100%",
                padding:
                  "0.5rem 0.7rem",
                borderRadius:
                  "8px",
                border:
                  "1px solid rgba(255,255,255,0.12)",
                background:
                  "transparent",
                color:
                  "inherit",
                cursor:
                  "pointer",
                fontSize:
                  "0.78rem",
              }}
            >
              Sign out
            </button>
          </div>
        )}

        <span>
          Chapter Zero
        </span>

        <small>
          Every story begins somewhere.
        </small>
      </div>

    </aside>
  );

  // =========================================================
  // RECOMMENDATION PAGE
  // =========================================================

  const recommendationsPage = (
    <section className="universe-page">

      <div className="universe-page-header">

        <div>

          <span className="eyebrow">
            ✦ CURATED FOR YOU
          </span>

          <h2>
            Recommendations
          </h2>

          <p>
            Stories gathered from the worlds
            already living on your shelves.
          </p>

        </div>

        <button
          className="secondary-button"
          onClick={
            generateRecommendations
          }
        >
          ↻ Refresh
        </button>

      </div>

      {loadingRecommendations ? (
        <div className="empty-library">

          <div className="empty-library-icon">
            ✦
          </div>

          <h3>
            Searching the literary universe...
          </h3>

          <p>
            Finding stories that belong
            beside yours.
          </p>

        </div>
      ) : recommendations.length === 0 ? (
        <div className="empty-library">

          <div className="empty-library-icon">
            ✦
          </div>

          <h3>
            Your recommendation shelf
            is waiting.
          </h3>

          <p>
            Add a few books to your library
            and Chapter Zero will start
            finding related stories.
          </p>

          <button
            className="primary-button"
            onClick={() => {
              setActiveView(
                "library"
              );

              setShowDiscover(
                true
              );
            }}
          >
            Discover Books
          </button>

        </div>
      ) : (
        <div className="library-grid">

          {recommendations.map(
            (book, index) => {

              const coverUrl =
                book.cover_i
                  ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
                  : "";

              return (
                <article
                  className="library-card"
                  key={
                    book.key ||
                    `${book.title}-${index}`
                  }
                >

                  <div className="book-cover">

                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={
                          book.title
                        }
                      />
                    ) : (
                      <div className="book-cover-placeholder">

                        <span>
                          ✦
                        </span>

                        <strong>
                          {book.title
                            ?.charAt(
                              0
                            )
                            ?.toUpperCase() ||
                            "?"}
                        </strong>

                      </div>
                    )}

                  </div>

                  <div className="book-info">

                    <h4>
                      {book.title ||
                        "Untitled"}
                    </h4>

                    <p className="book-author">
                      {book.author_name?.[0] ||
                        "Unknown Author"}
                    </p>

                    {book.first_publish_year && (
                      <span className="book-year">
                        {
                          book.first_publish_year
                        }
                      </span>
                    )}

                    <button
                      className="discover-add-button"
                      onClick={() =>
                        addDiscoveredBook(
                          book
                        )
                      }
                    >
                      + Add to Library
                    </button>

                  </div>

                </article>
              );
            }
          )}

        </div>
      )}

    </section>
  );

  // =========================================================
  // GLOBAL QUOTES PAGE
  // =========================================================

  const quotesPage = (
    <section className="universe-page">

      <div className="universe-page-header">

        <div>

          <span className="eyebrow">
            ❝ WORDS WORTH KEEPING
          </span>

          <h2>
            Quotes
          </h2>

          <p>
            A collection of the words that
            stayed with you.
          </p>

        </div>

        <span className="section-subtitle">
          {allQuotes.length} saved
        </span>

      </div>

      {loadingQuotes ? (
        <div className="empty-library">

          <div className="empty-library-icon">
            ❝
          </div>

          <h3>
            Opening your quote archive...
          </h3>

          <p>
            Gathering words from every book.
          </p>

        </div>
      ) : allQuotes.length === 0 ? (
        <div className="empty-library">

          <div className="empty-library-icon">
            ❝
          </div>

          <h3>
            No quotes yet.
          </h3>

          <p>
            Open a book and save the words
            you want to carry with you.
          </p>

          <button
            className="primary-button"
            onClick={
              openLibrary
            }
          >
            Open My Library
          </button>

        </div>
      ) : (
        <div className="quotes-list">

          {allQuotes.map(
            (quote) => (
              <article
                className="quote-card"
                key={quote.id}
                onClick={() =>
                  openBookDetails(
                    quote.libraryBook
                  )
                }
                style={{
                  cursor:
                    "pointer",
                }}
              >

                <div className="quote-mark">
                  “
                </div>

                <blockquote>
                  {
                    quote.quoteText
                  }
                </blockquote>

                <div className="quote-meta">

                  <span>
                    {
                      quote
                        .libraryBook
                        ?.book
                        ?.title ||
                      "Unknown book"
                    }
                  </span>

                  {quote.pageNumber && (
                    <span>
                      Page{" "}
                      {
                        quote.pageNumber
                      }
                    </span>
                  )}

                </div>

                {quote.annotation && (
                  <div className="quote-annotation">

                    <span>
                      Your note
                    </span>

                    <p>
                      {
                        quote.annotation
                      }
                    </p>

                  </div>
                )}

              </article>
            )
          )}

        </div>
      )}

    </section>
  );

// =========================================================
  // CHARACTERS PAGE
  // =========================================================

  const charactersPage = (
    <section className="universe-page">

      <div className="universe-page-header">

        <div>

          <span className="eyebrow">
            ♧ CHARACTERS & CONNECTIONS
          </span>

          <h2>
            Character Notebook
          </h2>

          <p>
            Keep track of the people who
            make your stories unforgettable.
          </p>

        </div>

        <button
          className="primary-button"
          onClick={() =>
            openCharacterModal()
          }
        >
          + Add Character
        </button>

      </div>

      {characters.length === 0 ? (
        <div className="empty-library">

          <div className="empty-library-icon">
            ♧
          </div>

          <h3>
            Your character notebook
            is empty.
          </h3>

          <p>
            Start collecting the people,
            heroes, villains and companions
            you meet between the pages.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              openCharacterModal()
            }
          >
            Add your first character
          </button>

        </div>
      ) : (
        <div className="library-grid">

          {characters.map(
            (character) => (
              <article
                className="library-card character-card"
                key={character.id}
              >

                <div className="book-cover">

                  <div className="book-cover-placeholder">

                    <span>
                      ♧
                    </span>

                    <strong>
                      {character.name
                        ?.charAt(
                          0
                        )
                        ?.toUpperCase()}
                    </strong>

                  </div>

                </div>

                <div className="book-info">

                  <h4>
                    {
                      character.name
                    }
                  </h4>

                  {character.book && (
                    <p className="book-author">
                      {
                        character.book
                      }
                    </p>
                  )}

                  {character.role && (
                    <span className="book-year">
                      {
                        character.role
                      }
                    </span>
                  )}

                  {character.description && (
                    <p>
                      {
                        character.description
                      }
                    </p>
                  )}

                  {character.relationships && (
                    <div className="quote-annotation">

                      <span>
                        Connections
                      </span>

                      <p>
                        {
                          character.relationships
                        }
                      </p>

                    </div>
                  )}

                  <div className="quote-actions">

                    <button
                      type="button"
                      onClick={() =>
                        openCharacterModal(
                          character
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteCharacter(
                          character.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </article>
            )
          )}

        </div>
      )}

    </section>
  );

  // =========================================================
  // READING STATS PAGE
  // =========================================================

  const statsPage = (
    <section className="universe-page reading-stats-page">

      <div className="universe-page-header reading-stats-header">

        <div>
          <span className="eyebrow">
            ◒ YOUR READING LIFE
          </span>

          <h2>
            Reading Stats
          </h2>

          <p>
            A quiet map of the stories, pages, and chapters
            that are becoming part of your universe.
          </p>
        </div>

        <div className="reading-stats-header-mark">
          <span>✦</span>
          <small>YOUR<br />UNIVERSE</small>
        </div>

      </div>

      <section className="stats-grid reading-stats-overview">

        <div className="stat-card reading-stat-card">
          <span>
            Total Books
          </span>
          <strong>{totalBooks}</strong>
          <small>Your collection</small>
        </div>

        <div className="stat-card reading-stat-card">
          <span>
            Currently Reading
          </span>
          <strong>{currentlyReadingCount}</strong>
          <small>{currentlyReadingProgress}% average progress</small>
        </div>

        <div className="stat-card reading-stat-card">
          <span>
            Want to Read
          </span>
          <strong>{wantToReadCount}</strong>
          <small>Stories waiting</small>
        </div>

        <div className="stat-card reading-stat-card">
          <span>
            Books Read
          </span>
          <strong>{readCount}</strong>
          <small>{completionRate}% of your library</small>
        </div>

      </section>

      <section className="reading-stats-dashboard">

        <article className="reading-panel reading-progress-panel">
          <div className="reading-panel-heading">
            <div>
              <span className="eyebrow">
                THE BIG PICTURE
              </span>
              <h3>Your Reading Journey</h3>
              <p>
                Every page counts. Here is how far your collection has travelled.
              </p>
            </div>
            <span className="reading-panel-symbol">◒</span>
          </div>

          <div className="journey-orbit">
            <div className="journey-orbit-inner">
              <strong>{overallProgress}%</strong>
              <span>collection progress</span>
            </div>
          </div>

          <div className="journey-bar-wrap">
            <div className="journey-bar-labels">
              <span>{pagesRead.toLocaleString()} pages read</span>
              <span>{pagesAvailable.toLocaleString()} available</span>
            </div>
            <div className="journey-bar">
              <div
                className="journey-bar-fill"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          <div className="journey-mini-grid">
            <div>
              <span>Average book</span>
              <strong>
                {averagePagesPerBook > 0
                  ? `${averagePagesPerBook} pages`
                  : "—"}
              </strong>
            </div>
            <div>
              <span>Longest book</span>
              <strong>
                {longestBook
                  ? `${Number(longestBook.totalPages).toLocaleString()} pages`
                  : "—"}
              </strong>
            </div>
          </div>
        </article>

        <article className="reading-panel goal-panel">
          <div className="reading-panel-heading">
            <div>
              <span className="eyebrow">
                THIS YEAR
              </span>
              <h3>Reading Goal</h3>
              <p>
                A gentle target — not a race.
              </p>
            </div>
            <span className="reading-panel-symbol">✦</span>
          </div>

          <div className="goal-number">
            <strong>{readCount}</strong>
            <span>/ {readingGoal} books</span>
          </div>

          <div className="goal-bar">
            <div
              className="goal-bar-fill"
              style={{ width: `${readingGoalProgress}%` }}
            />
          </div>

          <div className="goal-footer">
            <span>{readingGoalProgress}% complete</span>
            <span>
              {Math.max(
                0,
                readingGoal - readCount
              )} books to go
            </span>
          </div>

          <div className="goal-note">
            <span>✧</span>
            <p>
              {readCount >= readingGoal
                ? "You reached your reading goal. Beautifully done."
                : `Your next milestone is ${nextBookMilestone} books.`}
            </p>
          </div>
        </article>

        <article className="reading-panel composition-panel">
          <div className="reading-panel-heading">
            <div>
              <span className="eyebrow">
                YOUR SHELVES
              </span>
              <h3>Library Composition</h3>
              <p>
                The shape of your reading universe right now.
              </p>
            </div>
          </div>

          <div className="composition-rows">
            <div className="composition-row">
              <div className="composition-label">
                <span className="composition-dot currently"></span>
                <span>Currently Reading</span>
              </div>
              <strong>{currentlyReadingCount}</strong>
            </div>

            <div className="composition-track">
              <div
                className="composition-fill currently"
                style={{
                  width: `${totalBooks ? (currentlyReadingCount / totalBooks) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="composition-row">
              <div className="composition-label">
                <span className="composition-dot waiting"></span>
                <span>Want to Read</span>
              </div>
              <strong>{wantToReadCount}</strong>
            </div>

            <div className="composition-track">
              <div
                className="composition-fill waiting"
                style={{
                  width: `${totalBooks ? (wantToReadCount / totalBooks) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="composition-row">
              <div className="composition-label">
                <span className="composition-dot finished"></span>
                <span>Read</span>
              </div>
              <strong>{readCount}</strong>
            </div>

            <div className="composition-track">
              <div
                className="composition-fill finished"
                style={{
                  width: `${totalBooks ? (readCount / totalBooks) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </article>

        <article className="reading-panel pace-panel">
          <div className="reading-panel-heading">
            <div>
              <span className="eyebrow">
                READING PACE
              </span>
              <h3>Your Pace</h3>
              <p>
                Progress across books where page counts are available.
              </p>
            </div>
          </div>

          <div className="pace-stat">
            <span>Pages read</span>
            <strong>{pagesRead.toLocaleString()}</strong>
            <small>across your library</small>
          </div>

          <div className="pace-divider"></div>

          <div className="pace-stat-row">
            <div>
              <span>Average length</span>
              <strong>
                {averagePagesPerBook > 0
                  ? `${averagePagesPerBook} pp.`
                  : "—"}
              </strong>
            </div>
            <div>
              <span>Current progress</span>
              <strong>{currentlyReadingProgress}%</strong>
            </div>
          </div>
        </article>

        <article className="reading-panel milestone-panel">
          <div className="reading-panel-heading">
            <div>
              <span className="eyebrow">
                MILESTONES
              </span>
              <h3>What Comes Next</h3>
              <p>
                Little landmarks along the way.
              </p>
            </div>
          </div>

          <div className="milestone-list">
            <div className={`milestone ${readCount >= 5 ? "achieved" : ""}`}>
              <span className="milestone-icon">{readCount >= 5 ? "✓" : "5"}</span>
              <div>
                <strong>Five books</strong>
                <span>{readCount >= 5 ? "Reached" : `${5 - readCount} more to go`}</span>
              </div>
            </div>

            <div className={`milestone ${pagesRead >= 1000 ? "achieved" : ""}`}>
              <span className="milestone-icon">{pagesRead >= 1000 ? "✓" : "1K"}</span>
              <div>
                <strong>1,000 pages</strong>
                <span>{pagesRead >= 1000 ? "Reached" : `${Math.max(0, nextPageMilestone - pagesRead).toLocaleString()} pages to go`}</span>
              </div>
            </div>

            <div className={`milestone ${readCount >= 10 ? "achieved" : ""}`}>
              <span className="milestone-icon">{readCount >= 10 ? "✓" : "10"}</span>
              <div>
                <strong>Ten books</strong>
                <span>{readCount >= 10 ? "Reached" : `${10 - readCount} more to go`}</span>
              </div>
            </div>
          </div>
        </article>

        <article className="reading-panel archetype-panel">
          <div className="archetype-stars">✦ · ✧ · ✦</div>
          <span className="eyebrow">
            YOUR READER ARCHETYPE
          </span>
          <h3>{readerArchetype.title}</h3>
          <p>
            {readerArchetype.text}
          </p>
          <div className="archetype-footer">
            <span>Chapter Zero</span>
            <span>✧</span>
            <span>Keep turning pages.</span>
          </div>
        </article>

      </section>

    </section>
  );

  // =========================================================
  // NORMAL LIBRARY PAGE
  // =========================================================

  const libraryPage = (
    <>
      <header className="topbar">

        <div>

          <span className="eyebrow">
            YOUR PERSONAL LIBRARY
          </span>

          <h2>
            {activeCustomShelf
              ? activeCustomShelf.name
              : shelfTitle[
                  activeShelf
                ]}
          </h2>

        </div>

        <div className="topbar-actions">

          <button
            className="secondary-button"
            onClick={() => {
              setShowDiscover(true);
              setSearchResults([]);
            }}
          >
            Discover
          </button>

          <button
            className="primary-button"
            onClick={() =>
              setShowAddBook(true)
            }
          >
            + Add a book
          </button>

        </div>

      </header>

      <section className="hero">

        <div className="hero-content">

          <span className="eyebrow">
            {activeCustomShelf
              ? "CUSTOM SHELF"
              : activeShelf === "ALL"
              ? "WELCOME BACK"
              : "YOUR SHELF"}
          </span>

          <h1>
            {activeCustomShelf
              ? activeCustomShelf.name
              : activeShelf === "ALL"
              ? "Where every story finds a home."
              : shelfTitle[
                  activeShelf
                ]}
          </h1>

          <p>
            {activeCustomShelf
              ? activeCustomShelf.description ||
                "A little corner of your reading universe."
              : shelfDescription[
                  activeShelf
                ]}
          </p>

          {activeCustomShelf ? (
            <button
              className="secondary-button"
              onClick={
                leaveCustomShelf
              }
            >
              ← Back to My Library
            </button>
          ) : (
            <button
              className="primary-button"
              onClick={() =>
                setShowAddBook(
                  true
                )
              }
            >
              + Add a book
            </button>
          )}

        </div>

        <div className="hero-decoration">

          <div className="hero-book">

            <div className="hero-book-spine"></div>

            <div className="hero-book-title">
              CHAPTER
              <br />
              ZERO
            </div>

          </div>

        </div>

      </section>

      <section className="stats-grid">

        <div className="stat-card">
          <span>
            Total Books
          </span>

          <strong>
            {totalBooks}
          </strong>
        </div>

        <div className="stat-card">
          <span>
            Currently Reading
          </span>

          <strong>
            {currentlyReadingCount}
          </strong>
        </div>

        <div className="stat-card">
          <span>
            Want to Read
          </span>

          <strong>
            {wantToReadCount}
          </strong>
        </div>

        <div className="stat-card">
          <span>
            Books Read
          </span>

          <strong>
            {readCount}
          </strong>
        </div>

      </section>

      <section className="library-section">

        <div className="section-header">

          <div>

            <span className="eyebrow">
              {activeCustomShelf
                ? "CUSTOM SHELF"
                : activeShelf === "ALL"
                ? "YOUR COLLECTION"
                : "SHELF"}
            </span>

            <h3>
              {activeCustomShelf
                ? activeCustomShelf.name
                : shelfTitle[
                    activeShelf
                  ]}
            </h3>

            <p className="section-subtitle">
              {
                filteredLibrary.length
              }{" "}
              {
                filteredLibrary.length ===
                1
                  ? "book"
                  : "books"
              }
            </p>

          </div>

          {activeCustomShelf && (
            <button
              className="secondary-button"
              onClick={
                leaveCustomShelf
              }
            >
              ← My Library
            </button>
          )}

        </div>

        {loading ? (
          <div className="empty-library">

            <div className="empty-library-icon">
              ◌
            </div>

            <h3>
              Opening your library...
            </h3>

            <p>
              Give us a moment.
            </p>

          </div>
        ) : filteredLibrary.length ===
          0 ? (
          <div className="empty-library">

            <div className="empty-library-icon">
              📚
            </div>

            <h3>
              {activeCustomShelf
                ? "This shelf is waiting for its first story"
                : activeShelf ===
                  "ALL"
                ? "Your library is empty"
                : activeShelf ===
                  "CURRENTLY_READING"
                ? "Nothing currently reading"
                : activeShelf ===
                  "WANT_TO_READ"
                ? "Your reading list is empty"
                : "No finished books yet"}
            </h3>

            <p>
              {activeCustomShelf
                ? "Open a book and give it a place on this shelf."
                : activeShelf ===
                  "ALL"
                ? "Start building your personal reading universe."
                : "Books will appear here when you update their reading status."}
            </p>

            {activeShelf ===
              "ALL" &&
              !activeCustomShelf && (
                <button
                  className="primary-button"
                  onClick={() =>
                    setShowDiscover(
                      true
                    )
                  }
                >
                  Discover a book
                </button>
              )}

          </div>
        ) : (
          <div className="library-grid">

            {filteredLibrary.map(
              (item) => {

                const book =
                  item.book;

                const progress =
                  getProgress(
                    item
                  );

                return (
                  <article
                    className="library-card"
                    key={item.id}
                    onClick={() =>
                      openBookDetails(
                        item
                      )
                    }
                  >

                    <div className="book-cover">

                      {book?.coverUrl ? (
                        <img
                          src={
                            book.coverUrl
                          }
                          alt={
                            book.title
                          }
                        />
                      ) : (
                        <div className="book-cover-placeholder">

                          <span>
                            ✦
                          </span>

                          <strong>
                            {book?.title
                              ?.charAt(
                                0
                              )
                              ?.toUpperCase() ||
                              "?"}
                          </strong>

                        </div>
                      )}

                    </div>

                    <div className="book-info">

                      <h4>
                        {book?.title ||
                          "Untitled"}
                      </h4>

                      <p className="book-author">
                        {book?.author ||
                          "Unknown Author"}
                      </p>

                      {book?.publishedYear && (
                        <span className="book-year">
                          {
                            book.publishedYear
                          }
                        </span>
                      )}

                      <div
                        className="status-section"
                        onClick={(
                          event
                        ) =>
                          event.stopPropagation()
                        }
                      >

                        <label>
                          Reading Status
                        </label>

                        <select
                          value={
                            item.status ||
                            "WANT_TO_READ"
                          }
                          disabled={
                            updatingStatus ===
                            item.id
                          }
                          onChange={(
                            event
                          ) =>
                            updateStatus(
                              item.id,
                              event
                                .target
                                .value
                            )
                          }
                        >

                          <option value="WANT_TO_READ">
                            Want to Read
                          </option>

                          <option value="CURRENTLY_READING">
                            Currently Reading
                          </option>

                          <option value="READ">
                            Read
                          </option>

                        </select>

                      </div>

                      <div className="progress-section">

                        <div className="progress-header">

                          <label>
                            Progress
                          </label>

                          <span>
                            {progress}%
                          </span>

                        </div>

                        <div className="progress-bar">

                          <div
                            className="progress-fill"
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                        <div className="page-info">
                          {
                            item.currentPage ||
                            0
                          }
                          {" / "}
                          {
                            item.totalPages ||
                            "—"
                          }
                          {" pages"}
                        </div>

                        <div
                          className="progress-controls"
                          onClick={(
                            event
                          ) =>
                            event.stopPropagation()
                          }
                        >

                          <input
                            type="number"
                            min="0"
                            max={
                              item.totalPages ||
                              undefined
                            }
                            value={
                              progressValues[
                                item.id
                              ] ?? ""
                            }
                            onChange={(
                              event
                            ) =>
                              setProgressValues(
                                (
                                  previous
                                ) => ({
                                  ...previous,
                                  [item.id]:
                                    event
                                      .target
                                      .value,
                                })
                              )
                            }
                            placeholder="Current page"
                          />

                          <button
                            className="save-progress-button"
                            disabled={
                              savingProgress ===
                              item.id
                            }
                            onClick={() =>
                              updateProgress(
                                item
                              )
                            }
                          >
                            {savingProgress ===
                            item.id
                              ? "Saving..."
                              : "Save"}
                          </button>

                        </div>

                      </div>

                      <button
                        className="remove-book-button"
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();
                          removeBook(
                            item.id
                          );
                        }}
                      >
                        Remove from library
                      </button>

                    </div>

                  </article>
                );
              }
            )}

          </div>
        )}

      </section>
    </>
  );

  // =========================================================
  // MAIN RETURN
  // =========================================================

  return (
    <div className="app">

      {sidebar}

      <main className="main-content">

        {activeView ===
          "recommendations" &&
          recommendationsPage}

        {activeView ===
          "quotes" &&
          quotesPage}

        {activeView ===
          "characters" &&
          charactersPage}

        {activeView ===
          "stats" &&
          statsPage}

        {activeView ===
          "library" &&
          libraryPage}

      </main>

      {/* =====================================================
          BOOK DETAILS
          ===================================================== */}

      {selectedBook &&
        !showReader && (
          <div
            className="modal-overlay book-details-overlay"
            onClick={
              closeBookDetails
            }
          >

            <div
              className="book-details-modal"
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >

              <button
                className="modal-close book-details-close"
                onClick={
                  closeBookDetails
                }
              >
                ×
              </button>

              <div className="book-details-inner">

                <div className="book-details-cover">

                  {selectedBook
                    .book
                    ?.coverUrl ? (
                    <img
                      src={
                        selectedBook
                          .book
                          .coverUrl
                      }
                      alt={
                        selectedBook
                          .book
                          .title
                      }
                    />
                  ) : (
                    <div className="book-details-cover-placeholder">

                      <span>
                        ✦
                      </span>

                      <strong>
                        {selectedBook
                          .book
                          ?.title
                          ?.charAt(
                            0
                          )
                          ?.toUpperCase() ||
                          "?"}
                      </strong>

                    </div>
                  )}

                </div>

                <div className="book-details-content">

                  <span className="eyebrow">
                    YOUR LIBRARY
                  </span>

                  <h2>
                    {
                      selectedBook
                        .book
                        ?.title ||
                      "Untitled"
                    }
                  </h2>

                  <p className="book-details-author">

                    {
                      selectedBook
                        .book
                        ?.author ||
                      "Unknown Author"
                    }

                    {selectedBook
                      .book
                      ?.publishedYear && (
                      <>
                        {" "}
                        ·{" "}
                        {
                          selectedBook
                            .book
                            .publishedYear
                        }
                      </>
                    )}

                  </p>

                  <div className="book-details-divider" />

                  <p
                    className={`book-details-description ${
                      selectedBook
                        .book
                        ?.description
                        ? ""
                        : "muted"
                    }`}
                  >
                    {selectedBook
                      .book
                      ?.description ||
                      "No description has been added for this book yet."}
                  </p>

                  <div className="book-details-status">

                    <div>

                      <span className="detail-label">
                        READING STATUS
                      </span>

                      <select
                        value={
                          selectedBook.status ||
                          "WANT_TO_READ"
                        }
                        disabled={
                          updatingStatus ===
                          selectedBook.id
                        }
                        onChange={(
                          event
                        ) =>
                          updateStatus(
                            selectedBook.id,
                            event
                              .target
                              .value
                          )
                        }
                      >

                        <option value="WANT_TO_READ">
                          Want to Read
                        </option>

                        <option value="CURRENTLY_READING">
                          Currently Reading
                        </option>

                        <option value="READ">
                          Read
                        </option>

                      </select>

                    </div>

                    <div className="book-details-percent">

                      <span className="detail-label">
                        PROGRESS
                      </span>

                      <strong>
                        {getProgress(
                          selectedBook
                        )}
                        %
                      </strong>

                    </div>

                  </div>

                  <div className="book-details-progress">

                    <div className="progress-bar">

                      <div
                        className="progress-fill"
                        style={{
                          width: `${getProgress(
                            selectedBook
                          )}%`,
                        }}
                      />

                    </div>

                    <span>
                      {
                        selectedBook.currentPage ||
                        0
                      }
                      {" / "}
                      {
                        selectedBook.totalPages ||
                        "—"
                      }
                      {" pages"}
                    </span>

                  </div>

                  {selectedBook.book
                    ?.isbn && (
                    <div className="book-detail-meta">

                      <span>
                        ISBN
                      </span>

                      <strong>
                        {
                          selectedBook
                            .book
                            .isbn
                        }
                      </strong>

                    </div>
                  )}

                  {/* READING ROOM */}

                  <div
                    className="book-details-reader-action"
                    style={{
                      marginTop:
                        "1.5rem",
                      marginBottom:
                        "1.5rem",
                    }}
                  >

                    <button
                      type="button"
                      className="primary-button"
                      onClick={
                        openReader
                      }
                      style={{
                        width:
                          "100%",
                        fontSize:
                          "1rem",
                        padding:
                          "0.9rem 1.2rem",
                      }}
                    >
                      📖 Read Now
                    </button>

                  </div>

                  {/* SHELVES */}

                  <div className="book-details-shelves">

                    <div className="book-details-shelves-header">

                      <div>

                        <span className="detail-label">
                          YOUR SHELVES
                        </span>

                        <p>
                          Give this story a little home.
                        </p>

                      </div>

                      <button
                        type="button"
                        className="shelf-create-mini"
                        onClick={() =>
                          setShowCreateShelf(
                            true
                          )
                        }
                      >
                        + New Shelf
                      </button>

                    </div>

                    {shelves.length ===
                    0 ? (
                      <div className="no-custom-shelves">
                        No custom shelves yet.
                      </div>
                    ) : (
                      <div className="book-shelf-options">

                        {shelves.map(
                          (
                            shelf
                          ) => {

                            const assigned =
                              bookShelves.some(
                                (
                                  item
                                ) =>
                                  item.id ===
                                  shelf.id
                              );

                            return (
                              <button
                                type="button"
                                key={
                                  shelf.id
                                }
                                className={`book-shelf-option ${
                                  assigned
                                    ? "assigned"
                                    : ""
                                }`}
                                disabled={
                                  updatingShelfBook ===
                                  shelf.id
                                }
                                onClick={() =>
                                  assigned
                                    ? removeBookFromShelf(
                                        shelf.id
                                      )
                                    : addBookToShelf(
                                        shelf.id
                                      )
                                }
                              >

                                <span>
                                  {assigned
                                    ? "✓"
                                    : "◇"}
                                </span>

                                <strong>
                                  {
                                    shelf.name
                                  }
                                </strong>

                                <small>
                                  {assigned
                                    ? "Added"
                                    : "Add"}
                                </small>

                              </button>
                            );
                          }
                        )}

                      </div>
                    )}

                  </div>

                  {/* QUOTES */}

                  <section className="quotes-section">

                    <div className="quotes-section-header">

                      <div>

                        <span className="quotes-eyebrow">
                          ✦ QUOTES & ANNOTATIONS
                        </span>

                        <h3>
                          Words worth keeping.
                        </h3>

                      </div>

                      <button
                        type="button"
                        className="add-quote-button"
                        onClick={() =>
                          openQuoteModal()
                        }
                      >
                        + Add a quote
                      </button>

                    </div>

                    {loadingQuotes ? (
                      <div className="quotes-empty">

                        <span>
                          ✦
                        </span>

                        <p>
                          Opening your notes...
                        </p>

                      </div>
                    ) : quotes.length ===
                      0 ? (
                      <div className="quotes-empty">

                        <span>
                          “
                        </span>

                        <p>
                          No quotes saved for this book yet.
                        </p>

                        <small>
                          Keep the words that stay with you.
                        </small>

                      </div>
                    ) : (
                      <div className="quotes-list">

                        {quotes.map(
                          (
                            quote
                          ) => (
                            <article
                              className="quote-card"
                              key={
                                quote.id
                              }
                            >

                              <div className="quote-mark">
                                “
                              </div>

                              <blockquote>
                                {
                                  quote.quoteText
                                }
                              </blockquote>

                              <div className="quote-meta">

                                {quote.pageNumber && (
                                  <span>
                                    Page{" "}
                                    {
                                      quote.pageNumber
                                    }
                                  </span>
                                )}

                                <div className="quote-actions">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openQuoteModal(
                                        quote
                                      )
                                    }
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteQuote(
                                        quote.id
                                      )
                                    }
                                  >
                                    Delete
                                  </button>

                                </div>

                              </div>

                              {quote.annotation && (
                                <div className="quote-annotation">

                                  <span>
                                    Your note
                                  </span>

                                  <p>
                                    {
                                      quote.annotation
                                    }
                                  </p>

                                </div>
                              )}

                            </article>
                          )
                        )}

                      </div>
                    )}

                  </section>

                  <div className="book-details-actions">

                    <button
                      className="secondary-button"
                      onClick={
                        closeBookDetails
                      }
                    >
                      Close
                    </button>

                    <button
                      className="remove-book-details-button"
                      onClick={() =>
                        removeBook(
                          selectedBook.id
                        )
                      }
                    >
                      Remove from library
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      {/* =====================================================
          READING ROOM
          ===================================================== */}

      {showReader &&
        selectedBook && (
          <Reader
            book={selectedBook}
            onClose={closeReader}
          />
        )}

      {/* =====================================================
          QUOTE MODAL
          ===================================================== */}

      {showQuoteModal && (
        <div
          className="quote-modal-overlay"
          onClick={
            closeQuoteModal
          }
        >

          <div
            className="quote-modal"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="quote-modal-header">

              <div>

                <span>
                  ✦{" "}
                  {editingQuote
                    ? "EDIT QUOTE"
                    : "NEW QUOTE"}
                </span>

                <h3>
                  {editingQuote
                    ? "Refine a thought."
                    : "Keep a moment."}
                </h3>

              </div>

              <button
                type="button"
                className="quote-modal-close"
                onClick={
                  closeQuoteModal
                }
              >
                ×
              </button>

            </div>

            <label>
              Quote
            </label>

            <textarea
              className="quote-input"
              value={quoteText}
              onChange={(
                event
              ) =>
                setQuoteText(
                  event.target
                    .value
                )
              }
              placeholder="Write the words you want to remember..."
              rows={5}
              autoFocus
            />

            <label>
              Your annotation
            </label>

            <textarea
              className="quote-input"
              value={
                quoteAnnotation
              }
              onChange={(
                event
              ) =>
                setQuoteAnnotation(
                  event.target
                    .value
                )
              }
              placeholder="What did this passage make you think or feel?"
              rows={4}
            />

            <label>
              Page number
            </label>

            <input
              className="quote-page-input"
              type="number"
              min="1"
              value={
                quotePage
              }
              onChange={(
                event
              ) =>
                setQuotePage(
                  event.target
                    .value
                )
              }
              placeholder="Optional"
            />

            <div className="quote-modal-actions">

              <button
                type="button"
                className="quote-cancel-button"
                onClick={
                  closeQuoteModal
                }
                disabled={
                  savingQuote
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="quote-save-button"
                onClick={
                  saveQuote
                }
                disabled={
                  savingQuote
                }
              >
                {savingQuote
                  ? "Saving..."
                  : editingQuote
                  ? "Save changes"
                  : "Save quote"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          CHARACTER MODAL
          ===================================================== */}

      {showCharacterModal && (
        <div
          className="modal-overlay"
          onClick={
            closeCharacterModal
          }
        >

          <div
            className="add-book-modal"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <span className="eyebrow">
                  YOUR UNIVERSE
                </span>

                <h3>
                  {editingCharacter
                    ? "Edit Character"
                    : "Add Character"}
                </h3>

              </div>

              <button
                className="modal-close"
                onClick={
                  closeCharacterModal
                }
              >
                ×
              </button>

            </div>

            <form
              className="add-book-form"
              onSubmit={
                saveCharacter
              }
            >

              <div className="form-group">

                <label>
                  Character Name *
                </label>

                <input
                  type="text"
                  value={
                    characterForm.name
                  }
                  onChange={(
                    event
                  ) =>
                    setCharacterForm(
                      {
                        ...characterForm,
                        name:
                          event
                            .target
                            .value,
                      }
                    )
                  }
                  placeholder="Elizabeth Bennet"
                  required
                  autoFocus
                />

              </div>

              <div className="form-group">

                <label>
                  Book
                </label>

                <input
                  type="text"
                  value={
                    characterForm.book
                  }
                  onChange={(
                    event
                  ) =>
                    setCharacterForm(
                      {
                        ...characterForm,
                        book:
                          event
                            .target
                            .value,
                      }
                    )
                  }
                  placeholder="Pride and Prejudice"
                />

              </div>

              <div className="form-group">

                <label>
                  Role
                </label>

                <input
                  type="text"
                  value={
                    characterForm.role
                  }
                  onChange={(
                    event
                  ) =>
                    setCharacterForm(
                      {
                        ...characterForm,
                        role:
                          event
                            .target
                            .value,
                      }
                    )
                  }
                  placeholder="Protagonist"
                />

              </div>

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  value={
                    characterForm.description
                  }
                  onChange={(
                    event
                  ) =>
                    setCharacterForm(
                      {
                        ...characterForm,
                        description:
                          event
                            .target
                            .value,
                      }
                    )
                  }
                  placeholder="Who are they?"
                  rows="4"
                />

              </div>

              <div className="form-group">

                <label>
                  Relationships
                </label>

                <textarea
                  value={
                    characterForm.relationships
                  }
                  onChange={(
                    event
                  ) =>
                    setCharacterForm(
                      {
                        ...characterForm,
                        relationships:
                          event
                            .target
                            .value,
                      }
                    )
                  }
                  placeholder="Family, friends, rivals, romances..."
                  rows="4"
                />

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={
                    closeCharacterModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingCharacter
                    ? "Save Character"
                    : "Add Character"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          DISCOVER MODAL
          ===================================================== */}

      {showDiscover && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowDiscover(false)
          }
        >

          <div
            className="discover-modal"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <span className="eyebrow">
                  OPEN LIBRARY
                </span>

                <h3>
                  Discover Books
                </h3>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowDiscover(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <form
              className="discover-search"
              onSubmit={
                searchBooks
              }
            >

              <input
                type="text"
                value={
                  searchQuery
                }
                onChange={(
                  event
                ) =>
                  setSearchQuery(
                    event.target
                      .value
                  )
                }
                placeholder="Search by title, author, ISBN..."
              />

              <button
                type="submit"
                className="primary-button"
                disabled={
                  searchingBooks
                }
              >
                {searchingBooks
                  ? "Searching..."
                  : "Search"}
              </button>

            </form>

            <div className="discover-results">

              {searchingBooks ? (
                <div className="discover-message">

                  <strong>
                    Searching the shelves...
                  </strong>

                  <span>
                    Looking for your next story.
                  </span>

                </div>
              ) : searchResults.length ===
                0 ? (
                <div className="discover-message">

                  <strong>
                    Find your next chapter.
                  </strong>

                  <span>
                    Search for a title or author above.
                  </span>

                </div>
              ) : (
                searchResults.map(
                  (
                    book,
                    index
                  ) => {

                    const bookKey =
                      book.key ||
                      `${book.title}-${index}`;

                    const coverUrl =
                      book.cover_i
                        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                        : "";

                    return (
                      <div
                        className="discover-book"
                        key={
                          bookKey
                        }
                      >

                        <div className="discover-cover">

                          {coverUrl ? (
                            <img
                              src={
                                coverUrl
                              }
                              alt={
                                book.title
                              }
                            />
                          ) : (
                            <div className="discover-cover-placeholder">
                              📖
                            </div>
                          )}

                        </div>

                        <div className="discover-book-info">

                          <h4>
                            {book.title ||
                              "Untitled"}
                          </h4>

                          <p>
                            {book.author_name?.join(
                              ", "
                            ) ||
                              "Unknown Author"}
                          </p>

                          {book.first_publish_year && (
                            <span>
                              {
                                book.first_publish_year
                              }
                            </span>
                          )}

                          <button
                            className="discover-add-button"
                            disabled={
                              addingDiscoveredBook ===
                              book.key
                            }
                            onClick={() =>
                              addDiscoveredBook(
                                book
                              )
                            }
                          >
                            {addingDiscoveredBook ===
                            book.key
                              ? "Adding..."
                              : "+ Add to Library"}
                          </button>

                        </div>

                      </div>
                    );
                  }
                )
              )}

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          ADD BOOK MODAL
          ===================================================== */}

      {showAddBook && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowAddBook(false)
          }
        >

          <div
            className="add-book-modal"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <span className="eyebrow">
                  YOUR LIBRARY
                </span>

                <h3>
                  Add a Book
                </h3>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowAddBook(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <form
              className="add-book-form"
              onSubmit={
                addBook
              }
            >

              <div className="form-group">

                <label>
                  Title *
                </label>

                <input
                  type="text"
                  value={
                    newBook.title
                  }
                  onChange={(
                    event
                  ) =>
                    setNewBook({
                      ...newBook,
                      title:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder="The Name of the Wind"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Author
                </label>

                <input
                  type="text"
                  value={
                    newBook.author
                  }
                  onChange={(
                    event
                  ) =>
                    setNewBook({
                      ...newBook,
                      author:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder="Patrick Rothfuss"
                />

              </div>

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Published Year
                  </label>

                  <input
                    type="number"
                    value={
                      newBook.publishedYear
                    }
                    onChange={(
                      event
                    ) =>
                      setNewBook({
                        ...newBook,
                        publishedYear:
                          event
                            .target
                            .value,
                      })
                    }
                    placeholder="2007"
                  />

                </div>

                <div className="form-group">

                  <label>
                    ISBN
                  </label>

                  <input
                    type="text"
                    value={
                      newBook.isbn
                    }
                    onChange={(
                      event
                    ) =>
                      setNewBook({
                        ...newBook,
                        isbn:
                          event
                            .target
                            .value,
                      })
                    }
                    placeholder="978..."
                  />

                </div>

              </div>

              <div className="form-group">

                <label>
                  Cover URL
                </label>

                <input
                  type="url"
                  value={
                    newBook.coverUrl
                  }
                  onChange={(
                    event
                  ) =>
                    setNewBook({
                      ...newBook,
                      coverUrl:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder="https://..."
                />

              </div>

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  value={
                    newBook.description
                  }
                  onChange={(
                    event
                  ) =>
                    setNewBook({
                      ...newBook,
                      description:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder="A short description..."
                  rows="4"
                />

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setShowAddBook(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    addingBook
                  }
                >
                  {addingBook
                    ? "Adding..."
                    : "Add to Library"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          SHELVES MODAL
          ===================================================== */}

      {showShelves && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowShelves(
              false
            )
          }
        >

          <div
            className="shelves-modal"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <span className="eyebrow">
                  YOUR UNIVERSE
                </span>

                <h3>
                  Custom Shelves
                </h3>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowShelves(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <p className="shelves-intro">
              Create little worlds inside
              your reading universe.
            </p>

            <button
              className="primary-button shelf-new-button"
              onClick={() =>
                setShowCreateShelf(
                  true
                )
              }
            >
              + Create a Shelf
            </button>

            <div className="shelves-list">

              {shelves.length ===
              0 ? (
                <div className="shelves-empty">

                  <div className="empty-library-icon">
                    ✦
                  </div>

                  <h3>
                    No shelves yet.
                  </h3>

                  <p>
                    Create your first little collection.
                  </p>

                </div>
              ) : (
                shelves.map(
                  (shelf) => (
                    <div
                      className="shelf-item"
                      key={
                        shelf.id
                      }
                    >

                      <button
                        className="shelf-item-main"
                        onClick={() =>
                          openCustomShelf(
                            shelf
                          )
                        }
                      >

                        <div className="shelf-icon">
                          ✦
                        </div>

                        <div className="shelf-item-info">

                          <strong>
                            {
                              shelf.name
                            }
                          </strong>

                          <span>
                            {
                              shelf.description ||
                              "A little corner of your reading universe."
                            }
                          </span>

                        </div>

                        <div className="shelf-count">
                          {
                            shelf.bookCount
                          }
                        </div>

                      </button>

                      <button
                        className="shelf-delete"
                        onClick={() =>
                          deleteShelf(
                            shelf.id
                          )
                        }
                      >
                        ×
                      </button>

                    </div>
                  )
                )
              )}

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          CREATE SHELF MODAL
          ===================================================== */}

      {showCreateShelf && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowCreateShelf(
              false
            )
          }
        >

          <div
            className="create-shelf-modal"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <span className="eyebrow">
                  YOUR UNIVERSE
                </span>

                <h3>
                  Create a Shelf
                </h3>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowCreateShelf(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <p className="shelves-intro">
              Give a collection of stories
              its own little world.
            </p>

            <form
              onSubmit={
                createShelf
              }
            >

              <div className="form-group">

                <label>
                  Shelf Name
                </label>

                <input
                  type="text"
                  value={
                    newShelf.name
                  }
                  onChange={(
                    event
                  ) =>
                    setNewShelf({
                      ...newShelf,
                      name:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder="Comfort Reads"
                  autoFocus
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  value={
                    newShelf.description
                  }
                  onChange={(
                    event
                  ) =>
                    setNewShelf({
                      ...newShelf,
                      description:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder="Books I return to when I need a familiar story..."
                  rows="4"
                />

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setShowCreateShelf(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    creatingShelf
                  }
                >
                  {creatingShelf
                    ? "Creating..."
                    : "Create Shelf"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default App;