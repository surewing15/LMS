// src/pages/admin/Loans.jsx
import React from "react";
import AllLoansManagement from "../../components/shared/AllLoansManagement";

const Loans = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Loan Management</h1>
      <AllLoansManagement />
    </div>
  );
};

export default Loans;
