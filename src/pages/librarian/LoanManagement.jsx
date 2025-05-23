// src/pages/librarian/LoanManagement.jsx
import React from "react";
import AllLoansManagement from "../../components/shared/AllLoansManagement";

const LoanManagement = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Librarian Loan Management</h1>
      <AllLoansManagement />
    </div>
  );
};

export default LoanManagement;
