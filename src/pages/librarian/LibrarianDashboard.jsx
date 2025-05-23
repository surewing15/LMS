import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import dashboardService from "../../services/dashboardService";

const LibrarianDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableCopies: 0,
    activeLoans: 0,
    overdueLoans: 0,
    totalStudents: 0,
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const statsData = await dashboardService.getStats();

        setStats({
          totalBooks: statsData.totalBooks,
          availableBooks: statsData.availableCopies,
          activeLoans: statsData.activeLoans,
          overdueLoans: statsData.overdueLoans,
          totalStudents: statsData.totalStudents,
        });

        setRecentLoans(statsData.recentLoans || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const actionCards = [
    {
      title: "Manage Books",
      description: "Add, edit, or remove books from the system",
      icon: "📚",
      path: "/librarian/books/manage",
      color: "bg-blue-500",
    },
    {
      title: "Manage Authors",
      description: "Add or edit author information",
      icon: "✍️",
      path: "/librarian/authors/manage",
      color: "bg-purple-500",
    },
    {
      title: "Manage Categories",
      description: "Organize books by categories",
      icon: "🏷️",
      path: "/librarian/categories/manage",
      color: "bg-green-500",
    },
    {
      title: "Loan Management",
      description: "View and manage all library loans",
      icon: "📋",
      path: "/librarian/loans",
      color: "bg-amber-500",
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome, {user?.name || "Librarian"}
        </h1>
        <p className="text-gray-600">
          Manage your library operations from this dashboard. Here you can view
          key metrics, manage books, handle loans, and oversee student borrowing
          activities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Total Books
          </h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalBooks}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Available Copies
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {stats.availableBooks}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Active Loans
          </h3>
          <p className="text-3xl font-bold text-amber-600">
            {stats.activeLoans}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Overdue Loans
          </h3>
          <p className="text-3xl font-bold text-red-600">
            {stats.overdueLoans}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Total Students
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {stats.totalStudents}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {actionCards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div
                  className={`${card.color} text-white text-3xl p-4 flex justify-center`}
                >
                  {card.icon}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {card.description}
                  </p>
                  <Link
                    to={card.path}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium inline-block transition-colors duration-300"
                  >
                    Go
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Loans
          </h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {recentLoans.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Borrower
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentLoans.map((loan) => (
                      <tr key={loan.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {loan.bookTitle || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {loan.userName || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(loan.dueAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              loan.status === "returned"
                                ? "bg-green-100 text-green-800"
                                : loan.status === "overdue"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {loan.status === "returned"
                              ? "Returned"
                              : loan.status === "overdue"
                              ? "Overdue"
                              : "Borrowed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No recent loans found
              </div>
            )}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <Link
                to="/librarian/loans"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
              >
                View all loans →
              </Link>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Quick Actions
            </h2>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => navigate("/librarian/loans")}
                className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md transition-colors duration-300"
              >
                View All Loans
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibrarianDashboard;
