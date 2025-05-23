import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import LibrarianDashboard from "./pages/librarian/LibrarianDashboard.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import Loans from "./pages/admin/Loans.jsx";
import Books from "./pages/admin/catalog/books.jsx";
import Authors from "./pages/admin/catalog/authors.jsx";
import Category from "./pages/admin/catalog/categories.jsx";
import Publishers from "./pages/admin/catalog/publishers.jsx";
import Catalogstudent from "./pages/student/Catalogstudent.jsx";
import Loanstudent from "./pages/student/Loanstudent.jsx";
import LoanHistory from "./pages/student/LoanHistory.jsx";
import LoanManagement from "./pages/librarian/LoanManagement.jsx";
import Return from "./pages/librarian/Return.jsx";
import Report from "./pages/librarian/Report.jsx";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/loans"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Loans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/catalog/books"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Books />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/catalog/authors"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Authors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/catalog/categories"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Category />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/catalog/publishers"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Publishers />
                </ProtectedRoute>
              }
            />

            {/* Librarian Routes */}
            <Route
              path="/librarian/dashboard"
              element={
                <ProtectedRoute requiredRole="librarian">
                  <LibrarianDashboard />
                </ProtectedRoute>
              }
            />

            {/* Added Librarian Catalog Routes */}
            <Route
              path="/librarian/books/manage"
              element={
                <ProtectedRoute requiredRole="librarian">
                  <Books />
                </ProtectedRoute>
              }
            />
            <Route
              path="/librarian/authors/manage"
              element={
                <ProtectedRoute requiredRole="librarian">
                  <Authors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/librarian/categories/manage"
              element={
                <ProtectedRoute requiredRole="librarian">
                  <Category />
                </ProtectedRoute>
              }
            />
            <Route
              path="/librarian/publishers"
              element={
                <ProtectedRoute requiredRole="librarian">
                  <Publishers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/librarian/loans"
              element={
                <ProtectedRoute requiredRole="librarian">
                  <LoanManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/librarian/returns"
              element={
                <ProtectedRoute requiredRole="librarian">
                  <Return />
                </ProtectedRoute>
              }
            />
            <Route
              path="/librarian/reports"
              element={
                <ProtectedRoute requiredRole="librarian">
                  <Report />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/catalog"
              element={
                <ProtectedRoute requiredRole="student">
                  <Catalogstudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/loans"
              element={
                <ProtectedRoute requiredRole="student">
                  <Loanstudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/history"
              element={
                <ProtectedRoute requiredRole="student">
                  <LoanHistory />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
