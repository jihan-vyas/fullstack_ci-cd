
import { useCallback, useEffect, useState } from "react";
import "./App.css";

function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch all books
  const fetchBooks = useCallback(async (showError = true) => {
    try {
      const res = await fetch("/api/books");

      if (!res.ok) {
        throw new Error("Unable to load books. Please try again.");
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response received from server.");
      }

      setBooks(data);
      setError("");
    } catch (err) {
      console.error("Error fetching books:", err);

      if (showError) {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Add a book
  const handleAddBook = async (e) => {
    e.preventDefault();

    const cleanTitle = title.trim();
    const cleanAuthor = author.trim();

    if (!cleanTitle || !cleanAuthor) {
      setError("Please enter both the title and author.");
      return;
    }

    try {
      setAdding(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: cleanTitle,
          author: cleanAuthor,
        }),
      });

      if (!res.ok) {
        throw new Error("Could not add the book. Please try again.");
      }

      setTitle("");
      setAuthor("");

      await fetchBooks(false);
      setSuccess("Your book has been added successfully!");
    } catch (err) {
      console.error("Error adding book:", err);
      setError(err.message || "Something went wrong while adding the book.");
    } finally {
      setAdding(false);
    }
  };

  // Delete a book
  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      const res = await fetch(`/api/books/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Could not delete the book. Please try again.");
      }

      setBooks((currentBooks) =>
        currentBooks.filter((book) => book._id !== id)
      );

      setSuccess("Book deleted successfully!");
    } catch (err) {
      console.error("Error deleting book:", err);
      setError(err.message || "Something went wrong while deleting the book.");
    } finally {
      setDeletingId(null);
    }
  };

  const dismissMessages = () => {
    setError("");
    setSuccess("");
  };

  return (
    <div className="app-shell">
      <main className="container">
        {/* Hero Header */}
        <header className="hero">
          <div className="hero-content">
            <div className="hero-icon" aria-hidden="true">
              📚
            </div>

            <div className="hero-text">
              <span className="eyebrow">YOUR PERSONAL COLLECTION</span>
              <h1>Books Library</h1>
              <p>Discover something wonderful, one page at a time.</p>

              <div className="hero-tags">
                <span>✦ Discover</span>
                <span>✦ Read</span>
                <span>✦ Grow</span>
              </div>
            </div>
          </div>

          <div className="hero-decoration decoration-one" />
          <div className="hero-decoration decoration-two" />

          <div className="floating-book floating-book-one">📕</div>
          <div className="floating-book floating-book-two">📗</div>
          <div className="floating-book floating-book-three">📘</div>
        </header>

        {/* Notifications */}
        {success && (
          <div className="alert alert-success" role="status">
            <span className="alert-icon">✓</span>
            <span>{success}</span>
            <button
              className="alert-close"
              onClick={dismissMessages}
              aria-label="Dismiss success message"
              type="button"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">!</span>
            <span>{error}</span>
            <button
              className="alert-close"
              onClick={dismissMessages}
              aria-label="Dismiss error message"
              type="button"
            >
              ×
            </button>
          </div>
        )}

        {/* Add Book Form */}
        <section className="panel add-panel">
          <div className="section-header">
            <div className="section-icon add-icon">+</div>

            <div>
              <h2>Add a New Book</h2>
              <p>Every great adventure starts with a book.</p>
            </div>
          </div>

          <form className="book-form" onSubmit={handleAddBook}>
            <div className="input-group">
              <label htmlFor="book-title">Book title</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  ▤
                </span>
                <input
                  id="book-title"
                  type="text"
                  placeholder="e.g. The Great Gatsby"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={150}
                  required
                  disabled={adding}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="book-author">Author</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  ♙
                </span>
                <input
                  id="book-author"
                  type="text"
                  placeholder="e.g. F. Scott Fitzgerald"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  maxLength={100}
                  required
                  disabled={adding}
                />
              </div>
            </div>

            <button className="add-button" type="submit" disabled={adding}>
              <span>{adding ? "◌" : "+"}</span>
              {adding ? "Adding..." : "Add Book"}
            </button>
          </form>
        </section>

        {/* Library List */}
        <section className="panel library-panel">
          <div className="section-header library-heading">
            <div className="section-icon library-icon">▤</div>

            <div className="library-title">
              <h2>All Books</h2>
              <p>Your collection of amazing stories.</p>
            </div>

            {!loading && (
              <span className="book-count">
                {books.length} {books.length === 1 ? "book" : "books"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
              <p>Gathering your books...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="empty-state">
              <div className="empty-illustration">📚</div>
              <h3>Your shelves are waiting!</h3>
              <p>Add your first book to start building your collection.</p>
            </div>
          ) : (
            <ul className="book-list">
              {books.map((book, index) => (
                <li
                  className={`book-card book-color-${index % 4}`}
                  key={book._id}
                >
                  <div className="book-cover" aria-hidden="true">
                    <span>▤</span>
                  </div>

                  <div className="book-info">
                    <h3>{book.title}</h3>
                    <p>
                      <span className="author-label">by </span>
                      {book.author}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleDelete(book._id)}
                    disabled={deletingId !== null}
                    aria-label={`Delete ${book.title}`}
                  >
                    {deletingId === book._id ? (
                      "Deleting..."
                    ) : (
                      <>
                        <span aria-hidden="true">⌫</span>
                        Delete
                      </>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!loading && (
            <button
              className="refresh-button"
              type="button"
              onClick={() => fetchBooks()}
            >
              ↻ Refresh library
            </button>
          )}
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-decoration">
            <span>〰</span>
            <span>〰</span>
            <span>〰</span>
          </div>
          <p>
            Made with <span className="heart">♥</span> and a love for reading
          </p>
          <span className="footer-subtitle">
            React · Node.js · Express · MongoDB
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
