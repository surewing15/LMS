import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Tag,
  BookOpen,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import api from "../../../services/api";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/categories");
      const categoriesData = response.data;
      const hierarchicalCategories = buildCategoryHierarchy(categoriesData);

      setCategories(hierarchicalCategories);

      const expanded = {};
      hierarchicalCategories.forEach((category) => {
        expanded[category.category_id] = true;
      });
      setExpandedCategories(expanded);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const buildCategoryHierarchy = (flatCategories) => {
    const categoryMap = {};
    const rootCategories = [];

    flatCategories.forEach((category) => {
      const formattedCategory = {
        category_id: category.category_id,
        name: category.name,
        description: category.description,
        parent_id: category.parent_id,
        bookCount: category.book_count || 0,
        children: [],
      };
      categoryMap[category.category_id] = formattedCategory;
    });

    flatCategories.forEach((category) => {
      const categoryId = category.category_id;

      if (!category.parent_id) {
        rootCategories.push(categoryMap[categoryId]);
      } else if (categoryMap[category.parent_id]) {
        categoryMap[category.parent_id].children.push(categoryMap[categoryId]);
      }
    });

    return rootCategories;
  };

  const toggleExpand = (categoryId) => {
    setExpandedCategories({
      ...expandedCategories,
      [categoryId]: !expandedCategories[categoryId],
    });
  };

  const searchCategories = (categories, term) => {
    if (!term) return categories;

    const results = [];

    const search = (items, parent = null) => {
      items.forEach((item) => {
        if (
          item.name.toLowerCase().includes(term.toLowerCase()) ||
          item.description.toLowerCase().includes(term.toLowerCase())
        ) {
          if (parent) {
            if (!results.find((r) => r.category_id === parent.category_id)) {
              results.push({ ...parent, children: [] });
            }
          }

          const resultParent = parent
            ? results.find((r) => r.category_id === parent.category_id)
            : null;
          const existingItem = results.find(
            (r) => r.category_id === item.category_id
          );

          if (!existingItem) {
            const newItem = { ...item, children: [] };
            if (resultParent) {
              resultParent.children.push(newItem);
            } else {
              results.push(newItem);
            }
          }
        }

        if (item.children && item.children.length > 0) {
          search(item.children, item);
        }
      });
    };

    search(categories);
    return results;
  };

  const filteredCategories = searchTerm
    ? searchCategories(categories, searchTerm)
    : categories;

  const toggleAddModal = () => {
    setShowAddModal(!showAddModal);
    if (!showAddModal) {
      setFormData({
        name: "",
        description: "",
        parentId: null,
      });
      setFormErrors({});
    }
  };

  const toggleEditModal = (category = null) => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        parentId: category.parent_id,
      });
    }
    setCurrentCategory(category);
    setShowEditModal(!showEditModal);
    setFormErrors({});
  };

  const toggleDeleteModal = (category = null) => {
    setCurrentCategory(category);
    setShowDeleteModal(!showDeleteModal);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Category name is required";
    }

    return errors;
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/categories", formData);
      await fetchCategories();

      toggleAddModal();
      console.log("Category added successfully:", response.data);
    } catch (error) {
      console.error("Error adding category:", error);

      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();

    if (!currentCategory) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.put(
        `/categories/${currentCategory.category_id}`,
        formData
      );

      await fetchCategories();

      toggleEditModal();

      console.log("Category updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating category:", error);

      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!currentCategory) return;

    try {
      await api.delete(`/categories/${currentCategory.category_id}`);

      await fetchCategories();

      toggleDeleteModal();

      console.log("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const renderCategory = (category, level = 0) => {
    const isExpanded = expandedCategories[category.category_id];
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div
        key={category.category_id}
        className="border-b border-gray-100 last:border-b-0"
      >
        <div
          className={`flex items-center justify-between p-4 hover:bg-gray-50 ${
            level > 0 ? "pl-" + level * 8 : ""
          }`}
          style={{ paddingLeft: `${level * 16 + 16}px` }}
        >
          <div className="flex-1">
            <div className="flex items-center">
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(category.category_id)}
                  className="mr-2 text-gray-400 hover:text-gray-600"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
              ) : (
                <span className="w-5 mr-2"></span>
              )}

              <div className="flex items-center">
                <Tag className="h-5 w-5 mr-2 text-green-600" />
                <span className="font-medium text-gray-900">
                  {category.name}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 ml-9">{category.description}</p>
            <div className="flex items-center ml-9 mt-1">
              <div className="flex items-center text-sm text-gray-500">
                <BookOpen className="h-4 w-4 mr-1" />
                <span>{category.bookCount} books</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => toggleEditModal(category)}
              className="text-gray-400 hover:text-indigo-600 p-1"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => toggleDeleteModal(category)}
              className="text-gray-400 hover:text-red-600 p-1"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 shadow-md rounded-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Category Management
        </h1>
        <p className="text-gray-600">
          Manage your library's book categories and genres
        </p>
      </div>

      {/* Search and Add Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="w-full md:w-auto flex flex-1 items-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={toggleAddModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Categories Hierarchical List */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase">
            Categories
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => renderCategory(category))
          ) : (
            <div className="p-6 text-center">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                No categories found
              </h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your search or add a new category.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Add Category
            </h2>
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category Name*
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`block w-full p-3 border ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500`}
                  placeholder="Enter Category Name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter Category Description"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="parentId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Parent Category (Optional)
                </label>
                <select
                  id="parentId"
                  name="parentId"
                  className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.parentId || ""}
                  onChange={handleInputChange}
                >
                  <option value="">None (Top-level category)</option>
                  {categories.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={toggleAddModal}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-150 ease-in-out"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition duration-150 ease-in-out disabled:bg-green-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
