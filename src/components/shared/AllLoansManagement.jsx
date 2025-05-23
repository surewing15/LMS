import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { format } from "date-fns";

const AllLoansManagement = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [returningId, setReturningId] = useState(null);

  // Fetch all loans
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        const response = await api.get("/all-borrow-records");
        console.log("Loans data:", response.data);
        setLoans(response.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching loans:", err);
        setError(err.message || "Failed to fetch loans");
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const handleReturn = async (recordId) => {
    if (!window.confirm("Confirm return this book?")) return;

    setReturningId(recordId);
    try {
      await api.post(`/borrow-records/${recordId}/return`);

      const response = await api.get("/all-borrow-records");
      setLoans(response.data || []);
    } catch (err) {
      console.error("Error returning book:", err);
      alert(err.message || "Failed to return book");
    } finally {
      setReturningId(null);
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  const getBookTitle = (loan) => loan?.book?.title || "N/A";
  const getUserName = (loan) => loan?.user?.name || "Unknown";
  const getUserEmail = (loan) => loan?.user?.email || "";

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Library Loans</h2>
        <p className="text-gray-600">
          Manage all borrower records in the system
        </p>
      </div>

      {loading && (
        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <p>Loading loan records...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && loans.length === 0 && (
        <div className="bg-yellow-50 p-4 rounded-md">
          <p>No loan records found.</p>
        </div>
      )}

      {!loading && !error && loans.length > 0 && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Loans</h3>
              <p className="text-2xl font-bold">{loans.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">
                Active Loans
              </h3>
              <p className="text-2xl font-bold">
                {loans.filter((loan) => !loan.returned_at).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">
                Overdue Loans
              </h3>
              <p className="text-2xl font-bold text-red-600">
                {
                  loans.filter(
                    (loan) => !loan.returned_at && isOverdue(loan.due_at)
                  ).length
                }
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Fines</h3>
              <p className="text-2xl font-bold text-amber-600">
                ₱
                {loans
                  .reduce(
                    (sum, loan) => sum + parseFloat(loan.fine_amount || 0),
                    0
                  )
                  .toFixed(2)}
              </p>
            </div>
          </div>

          {/* Loans Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Book
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Borrower
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Borrowed Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Due Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Fine
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loans.map((loan) => (
                    <tr
                      key={loan.id}
                      className={
                        isOverdue(loan.due_at) && !loan.returned_at
                          ? "bg-red-50"
                          : ""
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {loan.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getBookTitle(loan)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getUserName(loan)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getUserEmail(loan)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(loan.borrowed_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(loan.due_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {loan.returned_at ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Returned
                          </span>
                        ) : isOverdue(loan.due_at) ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Overdue
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Borrowed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {loan.fine_amount && parseFloat(loan.fine_amount) > 0
                          ? `₱
${parseFloat(loan.fine_amount).toFixed(2)}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!loan.returned_at && (
                          <button
                            onClick={() => handleReturn(loan.id)}
                            disabled={returningId === loan.id}
                            className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                          >
                            {returningId === loan.id
                              ? "Processing..."
                              : "Return"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllLoansManagement;
