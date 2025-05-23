import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  User,
  Book,
  Calendar,
  Flag,
} from "lucide-react";
import authorService from "../../../services/authorService"; 

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentAuthor, setCurrentAuthor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    nationality: "",
    birth_date: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    setIsLoading(true);
    try {
      const response = await authorService.getAll();
      setAuthors(response);
    } catch (error) {
      console.error("Error fetching authors:", error);
    } finally {
      setIsLoading(false);
    }
  };

 
  const filteredAuthors = authors.filter(
    (author) =>
      author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (author.nationality &&
        author.nationality.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (author.bio &&
        author.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

 
  const calculateAge = (birthDate) => {
    if (!birthDate) return "Unknown";

    const birthDateObj = new Date(birthDate);
    const today = new Date();

  
    if (birthDateObj.getFullYear() < 1940) {
      return "Deceased";
    }

    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }

    return `${age} years`;
  };

 
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";

    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

 
  const toggleAddModal = () => {
    setShowAddModal(!showAddModal);
    if (!showAddModal) {
     
      setFormData({
        name: "",
        bio: "",
        nationality: "",
        birth_date: "",
      });
      setFormErrors({});
    }
  };

  const toggleEditModal = (author = null) => {
    if (author) {
      setFormData({
        name: author.name,
        bio: author.bio || "",
        nationality: author.nationality || "",
        birth_date: author.birth_date || "",
      });
    }
    setCurrentAuthor(author);
    setShowEditModal(!showEditModal);
    setFormErrors({});
  };

  const toggleDeleteModal = (author = null) => {
    setCurrentAuthor(author);
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
      errors.name = "Author name is required";
    }

    if (
      formData.birth_date &&
      !/^\d{4}-\d{2}-\d{2}$/.test(formData.birth_date)
    ) {
      errors.birth_date = "Birth date must be in YYYY-MM-DD format";
    }

    return errors;
  };

  const handleAddAuthor = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authorService.create(formData);

      setAuthors([...authors, response]);

      toggleAddModal();
    } catch (error) {
      console.error("Error adding author:", error);

      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAuthor = async (e) => {
    e.preventDefault();

    if (!currentAuthor) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authorService.update(
        currentAuthor.author_id,
        formData
      );

      setAuthors(
        authors.map((author) =>
          author.author_id === currentAuthor.author_id ? response : author
        )
      );

      toggleEditModal();
    } catch (error) {
      console.error("Error updating author:", error);

      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAuthor = async () => {
    if (!currentAuthor) return;

    try {
      await authorService.delete(currentAuthor.author_id);

      // Update local state by removing the deleted author
      setAuthors(
        authors.filter((author) => author.author_id !== currentAuthor.author_id)
      );

      // Close modal
      toggleDeleteModal();
    } catch (error) {
      console.error("Error deleting author:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 shadow-md rounded-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Author Management
        </h1>
        <p className="text-gray-600">Manage authors and their information</p>
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
              placeholder="Search authors by name or nationality..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={toggleAddModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Author
        </button>
      </div>

      {/* Authors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuthors.length > 0 ? (
          filteredAuthors.map((author) => (
            <div
              key={author.author_id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xl font-semibold mr-4">
                    {author.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {author.name}
                    </h3>
                    {author.nationality && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Flag className="h-3.5 w-3.5 mr-1" />
                        <span>{author.nationality}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {author.birth_date && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-800">
                        {formatDate(author.birth_date)}
                      </span>
                      <span className="text-gray-500 ml-2">
                        ({calculateAge(author.birth_date)})
                      </span>
                    </div>
                  )}

                  {author.book_count !== undefined && (
                    <div className="flex items-center text-sm">
                      <Book className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-800">
                        {author.book_count}{" "}
                        {author.book_count === 1 ? "book" : "books"}
                      </span>
                    </div>
                  )}
                </div>

                {author.bio && (
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {author.bio}
                  </p>
                )}

                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={() => toggleEditModal(author)}
                    className="text-purple-600 hover:text-purple-900 p-1"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => toggleDeleteModal(author)}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">
              No authors found
            </h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your search or add a new author.
            </p>
          </div>
        )}
      </div>

      {/* Add Author Modal */}
      {showAddModal && (
        <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Add Author
            </h2>
            <form onSubmit={handleAddAuthor}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Author Name*
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`block w-full p-3 border ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="Enter Author Name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="nationality"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nationality
                </label>
                <input
                  id="nationality"
                  name="nationality"
                  type="text"
                  className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter nationality (e.g. American, British)"
                  value={formData.nationality}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="birth_date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Birth Date
                </label>
                <input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  className={`block w-full p-3 border ${
                    formErrors.birth_date ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  value={formData.birth_date}
                  onChange={handleInputChange}
                />
                {formErrors.birth_date && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.birth_date}
                  </p>
                )}
              </div>
              <div className="mb-6">
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Biography
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter author biography"
                  rows="4"
                  value={formData.bio}
                  onChange={handleInputChange}
                ></textarea>
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
                  className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition duration-150 ease-in-out disabled:bg-purple-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Author Modal */}
      {showEditModal && currentAuthor && (
        <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Edit Author
            </h2>
            <form onSubmit={handleEditAuthor}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Author Name*
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`block w-full p-3 border ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="Enter Author Name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="nationality"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nationality
                </label>
                <input
                  id="nationality"
                  name="nationality"
                  type="text"
                  className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter nationality (e.g. American, British)"
                  value={formData.nationality}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="birth_date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Birth Date
                </label>
                <input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  className={`block w-full p-3 border ${
                    formErrors.birth_date ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  value={formData.birth_date}
                  onChange={handleInputChange}
                />
                {formErrors.birth_date && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.birth_date}
                  </p>
                )}
              </div>
              <div className="mb-6">
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Biography
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter author biography"
                  rows="4"
                  value={formData.bio}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={toggleEditModal}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-150 ease-in-out"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition duration-150 ease-in-out disabled:bg-purple-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentAuthor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Delete Author
            </h2>
            <p className="mb-4 text-gray-600">
              Are you sure you want to delete the author{" "}
              <span className="font-semibold">{currentAuthor.name}</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={toggleDeleteModal}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-150 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAuthor}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition duration-150 ease-in-out"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Authors;
