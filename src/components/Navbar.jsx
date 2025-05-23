import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  BookOpen,
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Settings,
  BookMarked,
  Users,
  Home,
  Search,
  FileText,
  Database,
  BarChart,
  Calendar,
  AlertTriangle,
  Bookmark,
  Clock,
  HelpCircle,
  List,
  Edit,
  Tag,
  Building,
  Layers,
} from "lucide-react";

const Navbar = () => {
  const { user, logout, isAdmin, isLibrarian } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [catalogMenuOpen, setCatalogMenuOpen] = useState(false);
  const [mobileCatalogMenuOpen, setMobileCatalogMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [userRole, setUserRole] = useState("student");

  useEffect(() => {
    if (!user) {
      return;
    }

    if (isAdmin()) {
      setUserRole("admin");
    } else if (isLibrarian()) {
      setUserRole("librarian");
    } else {
      setUserRole("student");
    }
  }, [user, isAdmin, isLibrarian]);

  const notifications = {
    admin: [
      {
        id: 1,
        message: "5 books due for return today",
        time: "10 minutes ago",
        read: false,
      },
      {
        id: 2,
        message: "New user registration requires approval",
        time: "30 minutes ago",
        read: false,
      },
      {
        id: 3,
        message: "System update scheduled for tonight",
        time: "2 hours ago",
        read: true,
      },
    ],
    librarian: [
      {
        id: 1,
        message: "3 new book requests awaiting approval",
        time: "15 minutes ago",
        read: false,
      },
      {
        id: 2,
        message: "Overdue books report ready",
        time: "1 hour ago",
        read: false,
      },
      {
        id: 3,
        message: "New books arrived in inventory",
        time: "Yesterday",
        read: true,
      },
    ],
    student: [
      {
        id: 1,
        message: "Your book reservation is ready",
        time: "20 minutes ago",
        read: false,
      },
      {
        id: 2,
        message: "Book due in 2 days",
        time: "2 hours ago",
        read: false,
      },
      {
        id: 3,
        message: "New recommendations available",
        time: "Yesterday",
        read: true,
      },
    ],
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);

    setNotificationsOpen(false);
    setProfileMenuOpen(false);
    setMobileCatalogMenuOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
    setNotificationsOpen(false);
  };

  const toggleCatalogMenu = () => {
    setCatalogMenuOpen(!catalogMenuOpen);
  };

  const toggleMobileCatalogMenu = () => {
    setMobileCatalogMenuOpen(!mobileCatalogMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const catalogManagementLinks = {
    admin: [
      {
        path: "/admin/catalog/books",
        label: "Books",
        icon: <BookOpen className="h-4 w-4" />,
      },
      {
        path: "/admin/catalog/authors",
        label: "Authors",
        icon: <Edit className="h-4 w-4" />,
      },
      {
        path: "/admin/catalog/categories",
        label: "Categories",
        icon: <Tag className="h-4 w-4" />,
      },
      {
        path: "/admin/catalog/publishers",
        label: "Publishers",
        icon: <Building className="h-4 w-4" />,
      },
    ],
    librarian: [
      {
        path: "/librarian/books/manage",
        label: "Books",
        icon: <BookOpen className="h-4 w-4" />,
      },
      {
        path: "/librarian/authors/manage",
        label: "Authors",
        icon: <Edit className="h-4 w-4" />,
      },
      {
        path: "/librarian/categories/manage",
        label: "Categories",
        icon: <Tag className="h-4 w-4" />,
      },
      {
        path: "/librarian/publishers",
        label: "Publishers",
        icon: <Building className="h-4 w-4" />,
      },
    ],
  };

  const navLinks = {
    admin: [
      {
        path: "/admin/dashboard",
        label: "Dashboard",
        icon: <Home className="h-5 w-5" />,
      },
      {
        path: "/admin/users",
        label: "Users",
        icon: <Users className="h-5 w-5" />,
      },
      {
        path: "/admin/catalog",
        label: "Catalog",
        icon: <Layers className="h-5 w-5" />,
        hasSubmenu: true,
      },
      {
        path: "/admin/loans",
        label: "Loans",
        icon: <Calendar className="h-5 w-5" />,
      },
    ],
    librarian: [
      {
        path: "/librarian/dashboard",
        label: "Dashboard",
        icon: <Home className="h-5 w-5" />,
      },
      {
        path: "/librarian/books",
        label: "Catalog",
        icon: <Layers className="h-5 w-5" />,
        hasSubmenu: true,
      },
      {
        path: "/librarian/loans",
        label: "Loan Management",
        icon: <Calendar className="h-5 w-5" />,
      },
      {
        path: "/librarian/returns",
        label: "Returns",
        icon: <Clock className="h-5 w-5" />,
      },
      // {
      //   path: "/librarian/members",
      //   label: "Members",
      //   icon: <Users className="h-5 w-5" />,
      // },
      {
        path: "/librarian/reports",
        label: "Reports",
        icon: <FileText className="h-5 w-5" />,
      },
    ],
    student: [
      {
        path: "/student/dashboard",
        label: "Dashboard",
        icon: <Home className="h-5 w-5" />,
      },
      {
        path: "/student/catalog",
        label: "Browse Books",
        icon: <BookOpen className="h-5 w-5" />,
      },
      {
        path: "/student/loans",
        label: "My Loans",
        icon: <Bookmark className="h-5 w-5" />,
      },
      // {
      //   path: "/student/history",
      //   label: "Loan History",
      //   icon: <Clock className="h-5 w-5" />,
      // },
      // {
      //   path: "/student/profile",
      //   label: "My Profile",
      //   icon: <User className="h-5 w-5" />,
      // },
    ],
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuOpen || notificationsOpen || catalogMenuOpen) {
        if (
          !event.target.closest(".profile-menu") &&
          !event.target.closest(".notifications-menu") &&
          !event.target.closest(".catalog-menu")
        ) {
          setProfileMenuOpen(false);
          setNotificationsOpen(false);
          setCatalogMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen, notificationsOpen, catalogMenuOpen]);

  const getRoleStyles = () => {
    switch (userRole) {
      case "admin":
        return {
          badge: "bg-purple-600",
          profileBg: "bg-purple-600",
          roleBadge: "bg-purple-100 text-purple-800",
          roleName: "Administrator",
        };
      case "librarian":
        return {
          badge: "bg-blue-600",
          profileBg: "bg-blue-600",
          roleBadge: "bg-blue-100 text-blue-800",
          roleName: "Librarian",
        };
      case "student":
        return {
          badge: "bg-green-600",
          profileBg: "bg-green-600",
          roleBadge: "bg-green-100 text-green-800",
          roleName: "Student",
        };
      default:
        return {
          badge: "bg-gray-600",
          profileBg: "bg-gray-600",
          roleBadge: "bg-gray-100 text-gray-800",
          roleName: "User",
        };
    }
  };

  const roleStyles = getRoleStyles();
  const currentNavLinks = navLinks[userRole] || [];
  const currentNotifications = notifications[userRole] || [];
  const currentCatalogLinks = catalogManagementLinks[userRole] || [];

  const getHomePath = () => {
    switch (userRole) {
      case "admin":
        return "/admin/dashboard";
      case "librarian":
        return "/librarian/dashboard";
      case "student":
        return "/student/dashboard";
      default:
        return "/";
    }
  };

  return (
    <>
      {user && (
        <nav className="bg-gray-800 text-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Brand */}
              <div className="flex items-center">
                <Link to={getHomePath()} className="flex items-center">
                  <BookOpen className="h-7 w-7 text-blue-400 mr-2" />
                  <span className="font-bold text-xl">Library System</span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {currentNavLinks.map((link) =>
                  link.hasSubmenu ? (
                    <div key={link.path} className="relative catalog-menu">
                      <button
                        onClick={toggleCatalogMenu}
                        className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                          isActive(link.path)
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`}
                      >
                        <span className="mr-1">{link.icon}</span>
                        {link.label}
                        <svg
                          className={`ml-1 h-4 w-4 transform ${
                            catalogMenuOpen ? "rotate-180" : ""
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {catalogMenuOpen && (
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-gray-800">
                          {currentCatalogLinks.map((subLink) => (
                            <Link
                              key={subLink.path}
                              to={subLink.path}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <span className="flex items-center">
                                {subLink.icon}
                                <span className="ml-2">{subLink.label}</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                        isActive(link.path)
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <span className="mr-1">{link.icon}</span>
                      {link.label}
                    </Link>
                  )
                )}
              </div>

              {/* Right side elements - User info and controls */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-4">
                  {/* User badge */}
                  <div className="flex items-center">
                    <span className="text-gray-300 text-sm mr-2">
                      Welcome, {user?.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${roleStyles.badge}`}
                    >
                      {roleStyles.roleName}
                    </span>
                  </div>

                  {/* Notifications */}
                  <div className="relative notifications-menu">
                    <button
                      onClick={toggleNotifications}
                      className="text-gray-300 hover:text-white focus:outline-none relative"
                      aria-label="Notifications"
                    >
                      <Bell className="h-6 w-6" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadNotifications}
                        </span>
                      )}
                    </button>

                    {notificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 text-gray-800">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <h3 className="text-sm font-medium">
                            My Notifications
                          </h3>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {currentNotifications.length > 0 ? (
                            currentNotifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`px-4 py-2 border-b border-gray-100 hover:bg-gray-50 ${
                                  !notification.read ? "bg-blue-50" : ""
                                }`}
                              >
                                <p className="text-sm font-medium">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2">
                              <p className="text-sm text-gray-500">
                                No notifications
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="px-4 py-2 border-t border-gray-200 text-center">
                          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                            View all notifications
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User profile menu */}
                  <div className="relative profile-menu">
                    <button
                      onClick={toggleProfileMenu}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none"
                      aria-label="User menu"
                    >
                      <div
                        className={`h-8 w-8 rounded-full ${roleStyles.profileBg} flex items-center justify-center text-white font-semibold`}
                      >
                        {user?.name?.charAt(0) || "U"}
                      </div>
                    </button>

                    {profileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-gray-800">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-medium truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                          <p
                            className={`text-xs ${roleStyles.roleBadge} px-2 py-0.5 rounded mt-1 inline-block`}
                          >
                            {roleStyles.roleName}
                          </p>
                        </div>
                        <Link
                          to={`/${userRole}/profile`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            My Profile
                          </span>
                        </Link>
                        <Link
                          to={`/${userRole}/settings`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <span className="flex items-center">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </span>
                        </Link>
                        <Link
                          to="/help"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <span className="flex items-center">
                            <HelpCircle className="h-4 w-4 mr-2" />
                            Help & Support
                          </span>
                        </Link>
                        <div className="border-t border-gray-200 mt-1">
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            <span className="flex items-center">
                              <LogOut className="h-4 w-4 mr-2" />
                              Logout
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Direct logout button */}
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <div className="flex items-center mr-2">
                  {/* Mobile Notifications */}
                  <button
                    onClick={toggleNotifications}
                    className="text-gray-300 hover:text-white p-1 rounded-full relative"
                  >
                    <Bell className="h-6 w-6" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </button>
                </div>

                <button
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open main menu</span>
                  {mobileMenuOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu, show/hide based on menu state */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-gray-800">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <div className="px-4 py-2 border-b border-gray-700">
                  <div className="flex items-center">
                    <div
                      className={`h-8 w-8 rounded-full ${roleStyles.profileBg} flex items-center justify-center text-white font-semibold`}
                    >
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {roleStyles.roleName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Role-based mobile navigation */}
                {currentNavLinks.map((link) =>
                  link.hasSubmenu ? (
                    <div key={link.path}>
                      <button
                        onClick={toggleMobileCatalogMenu}
                        className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                          isActive(link.path)
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span className="flex items-center">
                            <span className="mr-2">{link.icon}</span>
                            {link.label}
                          </span>
                          <svg
                            className={`ml-1 h-4 w-4 transform ${
                              mobileCatalogMenuOpen ? "rotate-180" : ""
                            }`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </button>

                      {mobileCatalogMenuOpen && (
                        <div className="pl-6 mt-1 space-y-1">
                          {currentCatalogLinks.map((subLink) => (
                            <Link
                              key={subLink.path}
                              to={subLink.path}
                              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                              <span className="flex items-center">
                                {subLink.icon}
                                <span className="ml-2">{subLink.label}</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive(link.path)
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center">
                        <span className="mr-2">{link.icon}</span>
                        {link.label}
                      </span>
                    </Link>
                  )
                )}

                <div className="pt-4 pb-3 border-t border-gray-700">
                  <div className="space-y-1">
                    <Link
                      to={`/${userRole}/profile`}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        My Profile
                      </span>
                    </Link>
                    <Link
                      to="/help"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <span className="flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Help
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <span className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>
      )}
    </>
  );
};

export default Navbar;
