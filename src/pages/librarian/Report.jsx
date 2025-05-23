import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  Book,
  Users,
  TrendingUp,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";

import borrowService from "../../services/borrowService";
import bookService from "../../services/bookService";
import categoryService from "../../services/categoryService";

const Report = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    totalBorrows: 0,
    booksByCategory: [],
    borrowingTrends: [],
    topBorrowedBooks: [],
    overdueBooks: [],
    allBorrows: [],
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [activeTab, setActiveTab] = useState("overview");

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [borrowsResponse, booksResponse] = await Promise.all([
        borrowService.getAllBorrows(),
        bookService ? bookService.getAll() : Promise.resolve([]),
      ]);

      const allBorrows = borrowsResponse || [];
      const allBooks = booksResponse || [];

      const filteredBorrows = allBorrows.filter((borrow) => {
        const borrowDate = new Date(borrow.borrowed_at);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        return borrowDate >= startDate && borrowDate <= endDate;
      });

      const totalBooks = allBooks.length;
      const borrowedBookIds = allBorrows
        .filter((borrow) => !borrow.returned_at)
        .map((borrow) => borrow.book_id);
      const availableBooks = totalBooks - new Set(borrowedBookIds).size;
      const borrowedBooks = new Set(borrowedBookIds).size;
      const categoryCount = {};
      allBooks.forEach((book) => {
        const category = book.category || "Uncategorized";
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
      const booksByCategory = Object.entries(categoryCount).map(
        ([name, value]) => ({
          name,
          value,
        })
      );
      const borrowingTrends = generateBorrowingTrends(
        filteredBorrows,
        dateRange
      );
      const bookBorrowCount = {};
      allBorrows.forEach((borrow) => {
        const bookTitle = borrow.book?.title || `Book ${borrow.book_id}`;
        bookBorrowCount[bookTitle] = (bookBorrowCount[bookTitle] || 0) + 1;
      });
      const topBorrowedBooks = Object.entries(bookBorrowCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([title, count]) => ({ title, count }));
      const overdueBooks = allBorrows.filter((borrow) => {
        if (borrow.returned_at) return false;
        const dueDate = new Date(borrow.due_at);
        return dueDate < new Date();
      });

      setReportData({
        totalBooks,
        availableBooks,
        borrowedBooks,
        totalBorrows: allBorrows.length,
        booksByCategory,
        borrowingTrends,
        topBorrowedBooks,
        overdueBooks,
        allBorrows: filteredBorrows,
      });
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError("Failed to load report data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateBorrowingTrends = (borrows, dateRange) => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const trends = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const borrowsOnDate = borrows.filter(
        (borrow) =>
          borrow.borrowed_at && borrow.borrowed_at.split("T")[0] === dateStr
      ).length;

      trends.push({
        date: dateStr,
        borrows: borrowsOnDate,
        returns: borrows.filter(
          (borrow) =>
            borrow.returned_at && borrow.returned_at.split("T")[0] === dateStr
        ).length,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return trends;
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const exportToCSV = () => {
    const csvContent = [
      [
        "Date",
        "Total Books",
        "Available Books",
        "Borrowed Books",
        "Total Borrows",
      ],
      [
        new Date().toLocaleDateString(),
        reportData.totalBooks,
        reportData.availableBooks,
        reportData.borrowedBooks,
        reportData.totalBorrows,
      ],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `library-report-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin w-8 h-8 mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={fetchReportData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Library Reports
              </h1>
              <p className="text-gray-600">
                Comprehensive analytics on book availability and borrowing
                patterns
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={fetchReportData}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <div className="flex items-center mb-4 md:mb-0">
              <Filter className="w-5 h-5 mr-2 text-gray-500" />
              <span className="font-medium text-gray-700">Date Range:</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    handleDateRangeChange("startDate", e.target.value)
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    handleDateRangeChange("endDate", e.target.value)
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Book className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Books</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.totalBooks}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {reportData.availableBooks}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Borrowed</p>
                <p className="text-2xl font-bold text-orange-600">
                  {reportData.borrowedBooks}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Borrows
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {reportData.totalBorrows}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview" },
                { id: "trends", label: "Borrowing Trends" },
                { id: "categories", label: "Book Categories" },
                { id: "details", label: "Detailed Records" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Top Borrowed Books */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Top Borrowed Books
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportData.topBorrowedBooks}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="title"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Overdue Books Alert */}
                {reportData.overdueBooks.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      Overdue Books ({reportData.overdueBooks.length})
                    </h3>
                    <div className="space-y-2">
                      {reportData.overdueBooks
                        .slice(0, 5)
                        .map((borrow, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-red-700">
                              {borrow.book?.title || `Book ${borrow.book_id}`}
                            </span>
                            <span className="text-red-600">
                              Due:{" "}
                              {new Date(borrow.due_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      {reportData.overdueBooks.length > 5 && (
                        <p className="text-red-600 text-sm">
                          And {reportData.overdueBooks.length - 5} more...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "trends" && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Borrowing Trends
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={reportData.borrowingTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="borrows"
                        stroke="#3B82F6"
                        name="Books Borrowed"
                      />
                      <Line
                        type="monotone"
                        dataKey="returns"
                        stroke="#10B981"
                        name="Books Returned"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === "categories" && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Books by Category
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={reportData.booksByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {reportData.booksByCategory.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    {reportData.booksByCategory.map((category, index) => (
                      <div
                        key={category.name}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          ></div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className="text-gray-600">
                          {category.value} books
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "details" && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Detailed Borrow Records
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Book
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Borrowed Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.allBorrows.map((borrow, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {borrow.book?.title || `Book ${borrow.book_id}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {borrow.user?.username ||
                              borrow.user?.email ||
                              "Unknown User"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(borrow.borrowed_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(borrow.due_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                                borrow.returned_at
                                  ? "bg-green-100 text-green-800"
                                  : new Date(borrow.due_at) < new Date()
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {borrow.returned_at
                                ? "Returned"
                                : new Date(borrow.due_at) < new Date()
                                ? "Overdue"
                                : "Borrowed"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
