import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Building,
  Grid,
  List,
} from "lucide-react";
import publisherService from "../../../services/publisherService";

const Publishers = () => {
  const [publishers, setPublishers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPublisher, setCurrentPublisher] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact_info: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPublishers();
  }, []);

  const fetchPublishers = async () => {
    setIsLoading(true);
    try {
      const response = await publisherService.getAll();
      setPublishers(response);
    } catch (error) {
      console.error("Error fetching publishers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter publishers based on search term
  const filteredPublishers = publishers.filter(
    (publisher) =>
      publisher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (publisher.address &&
        publisher.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (publisher.contact_info &&
        publisher.contact_info.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Toggle functions for modals
  const toggleAddModal = () => {
    setShowAddModal(!showAddModal);
    if (!showAddModal) {
      // Reset form data when opening modal
      setFormData({
        name: "",
        address: "",
        contact_info: "",
      });
      setFormErrors({});
    }
  };

  const toggleEditModal = (publisher = null) => {
    if (publisher) {
      setFormData({
        name: publisher.name,
        address: publisher.address || "",
        contact_info: publisher.contact_info || "",
      });
    }
    setCurrentPublisher(publisher);
    setShowEditModal(!showEditModal);
    setFormErrors({});
  };

  const toggleDeleteModal = (publisher = null) => {
    setCurrentPublisher(publisher);
    setShowDeleteModal(!showDeleteModal);
  };

  // Toggle view mode (grid or list)
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user starts typing
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
      errors.name = "Publisher name is required";
    }

    return errors;
  };

  const handleAddPublisher = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await publisherService.create(formData);

      // Update local state
      setPublishers([...publishers, response]);

      // Close modal
      toggleAddModal();
    } catch (error) {
      console.error("Error adding publisher:", error);

      // Handle validation errors from server
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPublisher = async (e) => {
    e.preventDefault();

    if (!currentPublisher) return;

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await publisherService.update(
        currentPublisher.publisher_id,
        formData
      );

      // Update local state
      setPublishers(
        publishers.map((pub) =>
          pub.publisher_id === currentPublisher.publisher_id ? response : pub
        )
      );

      // Close modal
      toggleEditModal();
    } catch (error) {
      console.error("Error updating publisher:", error);

      // Handle validation errors from server
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePublisher = async () => {
    if (!currentPublisher) return;

    try {
      await publisherService.delete(currentPublisher.publisher_id);

      // Update local state by removing the deleted publisher
      setPublishers(
        publishers.filter(
          (pub) => pub.publisher_id !== currentPublisher.publisher_id
        )
      );

      // Close modal
      toggleDeleteModal();
    } catch (error) {
      console.error("Error deleting publisher:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 shadow-md rounded-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Publisher Management
        </h1>
        <p className="text-gray-600">
          Manage publishing companies and their information
        </p>
      </div>

      {/* Search, View Toggle, and Add Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="w-full md:w-auto flex flex-1 items-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search publishers..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => toggleViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-orange-100 text-orange-600"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
              title="Grid View"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => toggleViewMode("list")}
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-orange-100 text-orange-600"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
              title="List View"
            >
              <List className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={toggleAddModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Publisher
          </button>
        </div>
      </div>

      {/* Publishers Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPublishers.length > 0 ? (
            filteredPublishers.map((publisher) => (
              <div
                key={publisher.publisher_id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-md bg-orange-100 flex items-center justify-center text-orange-600 mr-4">
                      <Building className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {publisher.name}
                      </h3>
                    </div>
                  </div>

                  {publisher.address && (
                    <p className="text-sm text-gray-600 mb-4">
                      {publisher.address}
                    </p>
                  )}

                  {publisher.contact_info && (
                    <p className="text-sm text-gray-600 mb-4">
                      {publisher.contact_info}
                    </p>
                  )}

                  <div className="flex justify-end mt-2 space-x-2">
                    <button
                      onClick={() => toggleEditModal(publisher)}
                      className="text-orange-600 hover:text-orange-900 p-1"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => toggleDeleteModal(publisher)}
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
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                No publishers found
              </h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your search or add a new publisher.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Publishers List View */}
      {viewMode === "list" && (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Publisher
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Address
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact Info
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPublishers.length > 0 ? (
                filteredPublishers.map((publisher) => (
                  <tr key={publisher.publisher_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-md flex items-center justify-center text-orange-600">
                          <Building className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {publisher.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {publisher.address || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {publisher.contact_info || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleEditModal(publisher)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => toggleDeleteModal(publisher)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No publishers found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Publisher Modal */}
      {showAddModal && (
        <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Add Publisher
            </h2>
            <form onSubmit={handleAddPublisher}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Publisher Name*
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`block w-full p-3 border ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="Enter Publisher Name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter Publisher Address"
                  rows="3"
                  value={formData.address}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="contact_info"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contact Information
                </label>
                <textarea
                  id="contact_info"
                  name="contact_info"
                  className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter Contact Information (Email, Phone, etc.)"
                  rows="2"
                  value={formData.contact_info}
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
                  className="px-6 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition duration-150 ease-in-out disabled:bg-orange-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Publisher Modal */}
      {showEditModal && currentPublisher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Edit Publisher
            </h2>
            <form onSubmit={handleEditPublisher}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Publisher Name*
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`block w-full p-3 border ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="Enter Publisher Name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter Publisher Address"
                  rows="3"
                  value={formData.address}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="contact_info"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contact Information
                </label>
                <textarea
                  id="contact_info"
                  name="contact_info"
                  className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter Contact Information (Email, Phone, etc.)"
                  rows="2"
                  value={formData.contact_info}
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
                  className="px-6 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition duration-150 ease-in-out disabled:bg-orange-400"
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
      {showDeleteModal && currentPublisher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Delete Publisher
            </h2>
            <p className="mb-4 text-gray-600">
              Are you sure you want to delete the publisher{" "}
              <span className="font-semibold">{currentPublisher.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={toggleDeleteModal}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-150 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePublisher}
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

export default Publishers;
