// src/services/borrowService.js - updated version
import api from "./api";

const borrowService = {
  /**
   *
   */
  getAll: async () => {
    const response = await api.get("/borrow-records");
    return response.data;
  },

  /**
   *
   * @param {number|object} bookIdOrBook
   * @param {{ borrowed_at?: string, due_at?: string }} [dates]
   */
  borrowBook: async (bookIdOrBook, dates = {}) => {
    ssed;
    let bookId;

    if (typeof bookIdOrBook === "object") {
      bookId = bookIdOrBook.book_id || bookIdOrBook.id;
    } else {
      bookId = bookIdOrBook;
    }

    if (!bookId) {
      throw new Error("Book ID is required");
    }

    console.log("Borrowing book with ID:", bookId);

    const payload = {
      book_id: bookId,
      ...dates,
    };

    const response = await api.post("/borrow-records", payload);
    return response.data;
  },

  /**
   *
   * @param {number} recordId
   */
  returnBook: async (recordId) => {
    console.log("Returning book with record ID:", recordId);
    try {
      const response = await api.post(`/borrow-records/${recordId}/return`);
      console.log("Return response:", response);
      return response.data;
    } catch (error) {
      console.error("Return error details:", {
        url: `/borrow-records/${recordId}/return`,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  },
  getHistory: async () => {
    const response = await api.get("/borrow-history");
    return response.data;
  },

  getAllBorrows: async () => {
    try {
      console.log("Fetching all borrow records...");
      const response = await api.get("/all-borrow-records");
      console.log("API response:", response);

      return response.data;
    } catch (error) {
      console.error("Error in getAllBorrows:", error);
      throw error;
    }
  },
};

export default borrowService;
