// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAdmin, isLibrarian, isStudent } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  let hasPermission = false;

  switch (requiredRole) {
    case "admin":
      hasPermission = isAdmin();
      break;
    case "librarian":
      hasPermission = isLibrarian();
      break;
    case "student":
      hasPermission = isStudent();
      break;
    default:
      hasPermission = !!user;
  }

  if (!hasPermission) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
