import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  BookOpen,
  RefreshCw,
  Filter,
  X,
} from "lucide-react";
import bookService from "../../../services/bookService";
import { useState, useEffect } from "react";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    author: "",
    publisher: "",
    category: "",
    yearFrom: "",
    yearTo: "",
  });

  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    publication_year: "",
    author_id: "",
    publisher_id: "",
    categories: [],
    total_copies: 1,
    available_copies: 1,
    description: "",
    location_in_library: "",
    edition: "",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (showAddModal) {
      resetForm();
    }
  }, [showAddModal]);

  useEffect(() => {
    return () => {
      setShowAddModal(false);
      setShowEditModal(false);
      setShowDeleteModal(false);
      setCurrentBook(null);
    };
  }, []);

  useEffect(() => {
    if (currentBook && showEditModal) {
      setFormData({
        title: currentBook.title || "",
        isbn: currentBook.isbn || "",
        publication_year:
          currentBook.publication_year || currentBook.publicationYear || "",
        author_id: getIdValue(currentBook.author, "author_id", "id"),
        publisher_id: getIdValue(currentBook.publisher, "publisher_id", "id"),
        categories: Array.isArray(currentBook.categories)
          ? currentBook.categories.map((cat) =>
              getIdValue(cat, "category_id", "id")
            )
          : [],
        total_copies: currentBook.total_copies || currentBook.copies || 1,
        available_copies:
          currentBook.available_copies || currentBook.available || 0,
        description: currentBook.description || "",
        location_in_library:
          currentBook.location_in_library || currentBook.location || "",
        edition: currentBook.edition || "",
      });
    }
  }, [currentBook, showEditModal]);
  const getIdValue = (obj, primaryField, fallbackField) => {
    if (!obj) return "";
    return obj[primaryField] !== undefined
      ? obj[primaryField]
      : obj[fallbackField] || "";
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const mockData = {
        authors: [
          { author_id: 1, name: "J.K. Rowling" },
          { author_id: 2, name: "George Orwell" },
        ],
        publishers: [
          { publisher_id: 1, name: "Bloomsbury" },
          { publisher_id: 2, name: "Penguin Books" },
        ],
        categories: [
          { category_id: 1, name: "Fiction" },
          { category_id: 2, name: "Science Fiction" },
        ],
        books: [
          {
            book_id: 1,
            id: 1,
            title: "Harry Potter and the Philosopher's Stone",
            isbn: "9780747532743",
            publicationYear: 1997,
            author: { id: 1, name: "J.K. Rowling" },
            publisher: { id: 1, name: "Bloomsbury" },
            categories: [{ id: 1, name: "Fiction" }],
            status: "Available",
            copies: 5,
            available: 3,
            location: "Shelf A-1",
            description: "The first book in the Harry Potter series.",
          },
        ],
      };

      try {
        const formDataResult = await bookService.getFormData();
        setAuthors(formDataResult.authors || mockData.authors);
        setPublishers(formDataResult.publishers || mockData.publishers);
        setCategories(formDataResult.categories || mockData.categories);
      } catch (error) {
        setAuthors(mockData.authors);
        setPublishers(mockData.publishers);
        setCategories(mockData.categories);
      }

      try {
        const booksResult = await bookService.getAll();
        setBooks(
          Array.isArray(booksResult) && booksResult.length > 0
            ? booksResult
            : mockData.books
        );
      } catch (error) {
        setBooks(mockData.books);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    const searchMatch =
      !searchTerm ||
      (book.title &&
        book.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (book.isbn && book.isbn.includes(searchTerm)) ||
      (book.author &&
        book.author.name &&
        book.author.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!searchMatch) return false;

    const authorMatch =
      !filterOptions.author ||
      (book.author &&
        (book.author.id?.toString() === filterOptions.author ||
          book.author.author_id?.toString() === filterOptions.author));

    const publisherMatch =
      !filterOptions.publisher ||
      (book.publisher &&
        (book.publisher.id?.toString() === filterOptions.publisher ||
          book.publisher.publisher_id?.toString() === filterOptions.publisher));

    const categoryMatch =
      !filterOptions.category ||
      (Array.isArray(book.categories) &&
        book.categories.some(
          (cat) =>
            cat.category_id?.toString() === filterOptions.category ||
            cat.id?.toString() === filterOptions.category
        ));

    const pubYear = book.publicationYear || book.publication_year || 0;
    const yearFromMatch =
      !filterOptions.yearFrom || pubYear >= parseInt(filterOptions.yearFrom);
    const yearToMatch =
      !filterOptions.yearTo || pubYear <= parseInt(filterOptions.yearTo);

    return (
      authorMatch &&
      publisherMatch &&
      categoryMatch &&
      yearFromMatch &&
      yearToMatch
    );
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilterOptions({
      author: "",
      publisher: "",
      category: "",
      yearFrom: "",
      yearTo: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e) => {
    const value = parseInt(e.target.value) || e.target.value;
    const isChecked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      categories: isChecked
        ? [...prev.categories, value]
        : prev.categories.filter((id) => id !== value),
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (formData.isbn && !/^[0-9-]{10,17}$/.test(formData.isbn)) {
      errors.isbn = "ISBN must be a valid format";
    }

    if (formData.publication_year) {
      const year = parseInt(formData.publication_year);
      const currentYear = new Date().getFullYear();

      if (isNaN(year) || year < 1000 || year > currentYear + 1) {
        errors.publication_year = "Please enter a valid publication year";
      }
    }

    const totalCopies = parseInt(formData.total_copies);
    if (isNaN(totalCopies) || totalCopies < 0) {
      errors.total_copies = "Total copies must be a positive number";
    }

    const availableCopies = parseInt(formData.available_copies);
    if (
      isNaN(availableCopies) ||
      availableCopies < 0 ||
      availableCopies > totalCopies
    ) {
      errors.available_copies =
        "Available copies must be a positive number and cannot exceed total copies";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      title: "",
      isbn: "",
      publication_year: "",
      author_id: "",
      publisher_id: "",
      categories: [],
      total_copies: 1,
      available_copies: 1,
      description: "",
      location_in_library: "",
      edition: "",
    });
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (showAddModal) {
      try {
        const response = await bookService.create(formData);

        setBooks((prev) => [...prev, response]);
        setShowAddModal(false);

        alert("Book created successfully!");
      } catch (err) {
        if (err.response?.data?.errors) {
          setFormErrors(err.response.data.errors);
        } else {
          alert(`Error: ${err.message || "Failed to create book"}`);
        }
      }
    } else if (showEditModal && currentBook) {
      try {
        const updatedBooks = books.map((book) =>
          book.id === currentBook.id ? { ...book, ...formData } : book
        );

        setBooks(updatedBooks);
        setShowEditModal(false);
        setCurrentBook(null);

        alert("Book updated successfully!");
      } catch (err) {
        alert(`Error: ${err.message || "Failed to update book"}`);
      }
    }
  };

  const handleDeleteBook = async () => {
    if (!currentBook) return;

    try {
      const updatedBooks = books.filter((book) => book.id !== currentBook.id);
      setBooks(updatedBooks);
      setShowDeleteModal(false);
      setCurrentBook(null);

      alert("Book deleted successfully!");
    } catch (error) {
      alert(`Error: ${error.message || "Failed to delete book"}`);
    }
  };

  const toggleAddModal = () => {
    setShowAddModal((prev) => !prev);

    if (!showAddModal) {
      resetForm();
    }
  };

  const toggleEditModal = (book = null) => {
    if (book) setCurrentBook(book);
    setShowEditModal((prev) => !prev);
    
    if (showEditModal && !book) {
      setCurrentBook(null);
    }
  };

  const toggleDeleteModal = (book = null) => {
    if (book) setCurrentBook(book);
    setShowDeleteModal((prev) => !prev);
   
    if (showDeleteModal) {
      setCurrentBook(null);
    }
  };
  const toggleFilters = () => setShowFilters((prev) => !prev);

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800";
      case "Unavailable":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 shadow-md rounded-lg">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Book Management
        </h1>
        <p className="text-gray-600">Manage your library's book collection</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="w-full md:w-auto flex flex-1 items-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search books by title, ISBN, or author..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={toggleFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button
            onClick={toggleAddModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Add new book"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Book
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">Filter Books</h3>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reset Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Author filter */}
            <div>
              <label
                htmlFor="author"
                className="block text-sm font-medium text-gray-700"
              >
                Author
              </label>
              <select
                id="author"
                name="author"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterOptions.author}
                onChange={handleFilterChange}
              >
                <option value="">All Authors</option>
                {authors.map((author) => (
                  <option
                    key={`author-${
                      author.author_id || author.id || Math.random()
                    }`}
                    value={author.author_id || author.id || ""}
                  >
                    {author.name || "Unknown"}
                  </option>
                ))}
              </select>
            </div>

            {/* Publisher filter */}
            <div>
              <label
                htmlFor="publisher"
                className="block text-sm font-medium text-gray-700"
              >
                Publisher
              </label>
              <select
                id="publisher"
                name="publisher"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterOptions.publisher}
                onChange={handleFilterChange}
              >
                <option value="">All Publishers</option>
                {publishers.map((publisher) => (
                  <option
                    key={`publisher-${
                      publisher.publisher_id || publisher.id || Math.random()
                    }`}
                    value={publisher.publisher_id || publisher.id || ""}
                  >
                    {publisher.name || "Unknown"}
                  </option>
                ))}
              </select>
            </div>

            {/* Category filter */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterOptions.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option
                    key={`category-${
                      category.category_id || category.id || Math.random()
                    }`}
                    value={category.category_id || category.id || ""}
                  >
                    {category.name || "Unnamed Category"}
                  </option>
                ))}
              </select>
            </div>

            {/* Year From filter */}
            <div>
              <label
                htmlFor="yearFrom"
                className="block text-sm font-medium text-gray-700"
              >
                Year From
              </label>
              <input
                type="number"
                id="yearFrom"
                name="yearFrom"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                placeholder="From"
                value={filterOptions.yearFrom}
                onChange={handleFilterChange}
              />
            </div>

            {/* Year To filter */}
            <div>
              <label
                htmlFor="yearTo"
                className="block text-sm font-medium text-gray-700"
              >
                Year To
              </label>
              <input
                type="number"
                id="yearTo"
                name="yearTo"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                placeholder="To"
                value={filterOptions.yearTo}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Books Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Book Details
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Author
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Categories
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Publisher
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => (
                <tr
                  key={`book-${book.book_id || book.id || Math.random()}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-lg">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {book.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          ISBN: {book.isbn || "N/A"} •{" "}
                          {book.publicationYear ||
                            book.publication_year ||
                            "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {book.author?.name || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(book.categories) &&
                        book.categories.map((category) => (
                          <span
                            key={`category-${
                              book.book_id || book.id || Math.random()
                            }-${
                              category.category_id ||
                              category.id ||
                              Math.random()
                            }`}
                            className="px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full bg-blue-100 text-blue-800"
                          >
                            {category.name || "Unknown"}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.publisher?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        book.status
                      )}`}
                    >
                      {book.status || "Unknown"}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {book.available || book.available_copies || 0}/
                      {book.copies || book.total_copies || 0} copies available
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => toggleEditModal(book)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      aria-label={`Edit ${book.title}`}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => toggleDeleteModal(book)}
                      className="text-red-600 hover:text-red-900"
                      aria-label={`Delete ${book.title}`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No books found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{filteredBooks.length}</span> of{" "}
                <span className="font-medium">{filteredBooks.length}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  disabled
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <span
                  aria-current="page"
                  className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  1
                </span>
                <button
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  disabled
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Book Modal */}
      {(showAddModal || (showEditModal && currentBook)) && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50"
          onClick={(e) => {
            // Only close when clicking the backdrop (not the modal content)
            if (e.target === e.currentTarget) {
              showAddModal ? toggleAddModal() : toggleEditModal();
            }
          }}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Using a separate overlay div to ensure proper layering */}
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            {/* Modal Panel */}
            <div
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {showAddModal
                          ? "Add New Book"
                          : `Edit Book: ${currentBook?.title}`}
                      </h3>
                      <button
                        type="button"
                        onClick={
                          showAddModal ? toggleAddModal : toggleEditModal
                        }
                        className="text-gray-400 hover:text-gray-500"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-4">
                      <form onSubmit={handleSubmit}>
                        {/* Form fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Title */}
                          <div className="col-span-2">
                            <label
                              htmlFor="title"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Title*
                            </label>
                            <input
                              type="text"
                              name="title"
                              id="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                formErrors.title ? "border-red-300" : ""
                              }`}
                            />
                            {formErrors.title && (
                              <p className="mt-1 text-sm text-red-600">
                                {formErrors.title}
                              </p>
                            )}
                          </div>

                          {/* ISBN */}
                          <div>
                            <label
                              htmlFor="isbn"
                              className="block text-sm font-medium text-gray-700"
                            >
                              ISBN
                            </label>
                            <input
                              type="text"
                              name="isbn"
                              id="isbn"
                              value={formData.isbn}
                              onChange={handleInputChange}
                              className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                formErrors.isbn ? "border-red-300" : ""
                              }`}
                            />
                            {formErrors.isbn && (
                              <p className="mt-1 text-sm text-red-600">
                                {formErrors.isbn}
                              </p>
                            )}
                          </div>

                          {/* Publication Year */}
                          <div>
                            <label
                              htmlFor="publication_year"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Publication Year
                            </label>
                            <input
                              type="number"
                              name="publication_year"
                              id="publication_year"
                              value={formData.publication_year}
                              onChange={handleInputChange}
                              className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                formErrors.publication_year
                                  ? "border-red-300"
                                  : ""
                              }`}
                            />
                            {formErrors.publication_year && (
                              <p className="mt-1 text-sm text-red-600">
                                {formErrors.publication_year}
                              </p>
                            )}
                          </div>

                          {/* Author */}
                          <div>
                            <label
                              htmlFor="author_id"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Author
                            </label>
                            <select
                              name="author_id"
                              id="author_id"
                              value={formData.author_id}
                              onChange={handleInputChange}
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="">Select an author</option>
                              {authors.map((author) => (
                                <option
                                  key={`author-option-${
                                    author.author_id ||
                                    author.id ||
                                    Math.random()
                                  }`}
                                  value={author.author_id || author.id || ""}
                                >
                                  {author.name || "Unknown"}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Publisher */}
                          <div>
                            <label
                              htmlFor="publisher_id"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Publisher
                            </label>
                            <select
                              name="publisher_id"
                              id="publisher_id"
                              value={formData.publisher_id}
                              onChange={handleInputChange}
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="">Select a publisher</option>
                              {publishers.map((publisher) => (
                                <option
                                  key={`publisher-option-${
                                    publisher.publisher_id ||
                                    publisher.id ||
                                    Math.random()
                                  }`}
                                  value={
                                    publisher.publisher_id || publisher.id || ""
                                  }
                                >
                                  {publisher.name || "Unknown"}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Edition */}
                          <div>
                            <label
                              htmlFor="edition"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Edition
                            </label>
                            <input
                              type="text"
                              name="edition"
                              id="edition"
                              value={formData.edition}
                              onChange={handleInputChange}
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>

                          {/* Total Copies */}
                          <div>
                            <label
                              htmlFor="total_copies"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Total Copies
                            </label>
                            <input
                              type="number"
                              name="total_copies"
                              id="total_copies"
                              value={formData.total_copies}
                              onChange={handleInputChange}
                              className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                formErrors.total_copies ? "border-red-300" : ""
                              }`}
                            />
                            {formErrors.total_copies && (
                              <p className="mt-1 text-sm text-red-600">
                                {formErrors.total_copies}
                              </p>
                            )}
                          </div>

                          {/* Available Copies */}
                          <div>
                            <label
                              htmlFor="available_copies"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Available Copies
                            </label>
                            <input
                              type="number"
                              name="available_copies"
                              id="available_copies"
                              value={formData.available_copies}
                              onChange={handleInputChange}
                              className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                formErrors.available_copies
                                  ? "border-red-300"
                                  : ""
                              }`}
                            />
                            {formErrors.available_copies && (
                              <p className="mt-1 text-sm text-red-600">
                                {formErrors.available_copies}
                              </p>
                            )}
                          </div>

                          {/* Location */}
                          <div>
                            <label
                              htmlFor="location_in_library"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Location in Library
                            </label>
                            <input
                              type="text"
                              name="location_in_library"
                              id="location_in_library"
                              value={formData.location_in_library}
                              onChange={handleInputChange}
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>

                          {/* Categories */}
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Categories
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {categories.map((category) => (
                                <div
                                  key={`category-checkbox-${
                                    category.category_id ||
                                    category.id ||
                                    Math.random()
                                  }`}
                                  className="flex items-center"
                                >
                                  <input
                                    id={`category-${
                                      category.category_id || category.id
                                    }`}
                                    name={`category-${
                                      category.category_id || category.id
                                    }`}
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    value={
                                      category.category_id || category.id || ""
                                    }
                                    checked={
                                      formData.categories.includes(
                                        category.category_id
                                      ) ||
                                      formData.categories.includes(category.id)
                                    }
                                    onChange={handleCategoryChange}
                                  />
                                  <label
                                    htmlFor={`category-${
                                      category.category_id || category.id
                                    }`}
                                    className="ml-2 block text-sm text-gray-700"
                                  >
                                    {category.name || "Unnamed Category"}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Description */}
                          <div className="col-span-2">
                            <label
                              htmlFor="description"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Description
                            </label>
                            <textarea
                              name="description"
                              id="description"
                              rows="3"
                              value={formData.description}
                              onChange={handleInputChange}
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            ></textarea>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {showAddModal ? "Save" : "Update"}
                </button>
                <button
                  type="button"
                  onClick={showAddModal ? toggleAddModal : toggleEditModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentBook && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            {/* Modal Panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Book
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "{currentBook.title}"?
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteBook}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => toggleDeleteModal()}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
