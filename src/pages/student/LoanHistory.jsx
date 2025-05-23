import React, { useState, useEffect } from "react";
import borrowService from "../../services/borrowService";

const LoanHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await borrowService.getHistory();
        setHistory(data);
        setError(null);
      } catch {
        setError("Failed to load loan history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading)
    return <div className="p-6 text-center">Loading loan history...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  if (history.length === 0)
    return <div className="p-6 text-center">No loan history found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <h2 className="text-3xl font-semibold mb-6">Loan History</h2>
      <ul>
        {history.map((record) => (
          <li
            key={record.id}
            className="mb-4 p-4 bg-white rounded shadow flex flex-col"
          >
            <h3 className="text-xl font-semibold">{record.book.title}</h3>
            <p>Author: {record.book.author?.name || "Unknown"}</p>
            <p>
              Borrowed at: {new Date(record.borrowed_at).toLocaleDateString()}
            </p>
            <p>Due at: {new Date(record.due_at).toLocaleDateString()}</p>
            <p>
              Status: <strong>{record.status}</strong>
            </p>
            {record.returned_at && (
              <p>
                Returned at: {new Date(record.returned_at).toLocaleDateString()}
              </p>
            )}
            {record.fine_amount > 0 && (
              <p className="text-red-600">
                Fine: ${record.fine_amount.toFixed(2)}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LoanHistory;
