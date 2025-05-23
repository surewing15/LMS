import React, { useState, useEffect } from "react";
import borrowService from "../../services/borrowService";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";

const Return = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [returningId, setReturningId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const { isLibrarian } = useAuth();

  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        setLoading(true);

        const data = isLibrarian()
          ? await borrowService.getAllBorrows()
          : await borrowService.getAll();

        console.log("API Response:", data);

        const unreturned = data.filter((item) => !item.returned_at);
        setBorrowedBooks(unreturned);
        setError(null);
      } catch (err) {
        console.error("Error fetching borrowed books:", err);
        setError(err.message || "Failed to load borrowed books.");
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowedBooks();
  }, [isLibrarian]);

  const handleReturn = async (recordId) => {
    if (!window.confirm("Confirm return this book?")) return;

    setReturningId(recordId);
    setSuccessMsg("");
    setError(null);

    try {
      await borrowService.returnBook(recordId);
      setSuccessMsg("Book returned successfully!");

      setBorrowedBooks((prev) => prev.filter((book) => book.id !== recordId));
    } catch (err) {
      console.error("Error returning book:", err);
      setError(err.message || "Failed to return the book.");
    } finally {
      setReturningId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    try {
      return new Date() > new Date(dueDate);
    } catch (e) {
      console.error("Error parsing date:", dueDate, e);
      return false;
    }
  };

  const getBookTitle = (item) => item?.book?.title || "N/A";
  const getUserName = (item) => item?.user?.name || "Unknown";

  // Stats calculation
  const totalBorrowed = borrowedBooks.length;
  const overdueCount = borrowedBooks.filter((item) =>
    isOverdue(item.due_at)
  ).length;
  const dueSoonCount = borrowedBooks.filter((item) => {
    if (!item.due_at || isOverdue(item.due_at)) return false;
    const dueDate = new Date(item.due_at);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  }).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          📚 Return Borrowed Books
        </h1>
        <p className="text-gray-600">
          Manage book returns and view borrowed items. Keep track of due dates
          and overdue books.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Total Borrowed
          </h3>
          <p className="text-3xl font-bold text-blue-600">{totalBorrowed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Due Soon (3 days)
          </h3>
          <p className="text-3xl font-bold text-amber-600">{dueSoonCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Overdue Books
          </h3>
          <p className="text-3xl font-bold text-red-600">{overdueCount}</p>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✅</span>
            {successMsg}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {borrowedBooks.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No borrowed books to return
            </h3>
            <p className="text-gray-500">
              All books have been returned or no books are currently borrowed.
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Borrowed Books ({borrowedBooks.length})
              </h2>
            </div>

            {/* Books List */}
            <div className="divide-y divide-gray-200">
              {borrowedBooks.map((item) => (
                <div
                  key={item.id}
                  className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${
                    isOverdue(item.due_at)
                      ? "bg-red-50 border-l-4 border-red-400"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getBookTitle(item)}
                        </h3>
                        {isOverdue(item.due_at) && (
                          <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            OVERDUE
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium text-gray-700">
                            Borrowed by:
                          </span>
                          <p className="mt-1">{getUserName(item)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Borrowed on:
                          </span>
                          <p className="mt-1">{formatDate(item.borrowed_at)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Due date:
                          </span>
                          <p
                            className={`mt-1 ${
                              isOverdue(item.due_at)
                                ? "text-red-600 font-medium"
                                : ""
                            }`}
                          >
                            {formatDate(item.due_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex-shrink-0">
                      <button
                        onClick={() => handleReturn(item.id)}
                        disabled={returningId === item.id}
                        className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200 ${
                          returningId === item.id
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        }`}
                      >
                        {returningId === item.id ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>🔄 Return Book</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Return;
