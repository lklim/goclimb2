import { useEffect, useState, useRef, useCallback } from "react";
import supabase from "../supabaseClient";
import Navbar from "../components/Navbar";
import AdminSidebar from "./AdminSidebar";
import "./AdminManageActivities.css";

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error) => {
      console.error("ErrorBoundary caught:", error);
      setHasError(true);
    };
    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  if (hasError) {
    return <h1>Something went wrong. Please try refreshing the page.</h1>;
  }
  return children;
}

function CreateActivityModal({ onClose, onCreate, newActivity, setNewActivity, newActivityFile, setNewActivityFile, error, setError }) {
  const fileInputRef = useRef(null);

  console.log("CreateActivityModal rendered");

  const validateFile = (file) => {
    if (!file) return { valid: false, message: "No file selected." };
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return { valid: false, message: "Only JPEG, PNG, or GIF images are allowed." };
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, message: "File size must be less than 5MB." };
    }
    return { valid: true, message: "" };
  };

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    console.log("Create file selected:", file);
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.message);
        return;
      }
      setError(null);
    }
    setNewActivityFile(file);
  }, [setNewActivityFile, setError]);

  const triggerFileInput = useCallback(() => {
    console.log("Triggering file input click");
    fileInputRef.current.click();
  }, []);

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Create New Activity</h3>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={newActivity.activity_name}
            onChange={(e) =>
              setNewActivity({
                ...newActivity,
                activity_name: e.target.value,
              })
            }
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={newActivity.activity_description}
            onChange={(e) =>
              setNewActivity({
                ...newActivity,
                activity_description: e.target.value,
              })
            }
          />
        </div>
        <div className="form-group">
          <label>Requirement Type</label>
          <select
            value={newActivity.requirement_type}
            onChange={(e) =>
              setNewActivity({
                ...newActivity,
                requirement_type: e.target.value,
              })
            }
          >
            <option value="">Select Type</option>
            <option value="likes">Likes</option>
            <option value="comments">Comments</option>
          </select>
        </div>
        <div className="form-group">
          <label>Requirement Value</label>
          <input
            type="number"
            value={newActivity.requirement_value}
            onChange={(e) =>
              setNewActivity({
                ...newActivity,
                requirement_value: e.target.value,
              })
            }
            min="1"
          />
        </div>
        <div className="form-group">
          <label>Reset Duration</label>
          <select
            value={newActivity.reset_duration}
            onChange={(e) =>
              setNewActivity({
                ...newActivity,
                reset_duration: e.target.value,
              })
            }
          >
            <option value="">No reset</option>
            <option value="1 hour">1 hour</option>
            <option value="1 day">1 day</option>
            <option value="1 week">1 week</option>
          </select>
        </div>
        <div className="form-group">
          <label>Point Value</label>
          <input
            type="number"
            value={newActivity.point_value}
            onChange={(e) =>
              setNewActivity({
                ...newActivity,
                point_value: e.target.value,
              })
            }
            min="1"
            defaultValue="10"
          />
        </div>
        <div className="form-group">
          <label>Picture</label>
          <button
            className="confirm-btn"
            onClick={triggerFileInput}
            style={{ marginBottom: "10px" }}
          >
            Choose File
          </button>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleFileChange}
            className="file-input"
            ref={fileInputRef}
            style={{ display: "none" }}
          />
          {newActivityFile && (
            <div className="image-preview">
              <p>{newActivityFile.name}</p>
            </div>
          )}
        </div>
        <div className="modal-buttons">
          <button className="confirm-btn" onClick={onCreate}>
            Create
          </button>
          <button
            className="cancel-btn"
            onClick={() => {
              onClose();
              setNewActivityFile(null);
              setError(null);
              setNewActivity({
                activity_name: "",
                activity_description: "",
                requirement_type: "",
                requirement_value: "",
                reset_duration: "",
                point_value: 10,
                activity_picture: "",
              });
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function EditActivityModal({ onClose, onSave, editActivity, setEditActivity, editActivityFile, setEditActivityFile, error, setError }) {
  const fileInputRef = useRef(null);

  console.log("EditActivityModal rendered");

  const validateFile = (file) => {
    if (!file) return { valid: false, message: "No file selected." };
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return { valid: false, message: "Only JPEG, PNG, or GIF images are allowed." };
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, message: "File size must be less than 5MB." };
    }
    return { valid: true, message: "" };
  };

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    console.log("Edit file selected:", file);
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.message);
        return;
      }
      setError(null);
    }
    setEditActivityFile(file);
  }, [setEditActivityFile, setError]);

  const triggerFileInput = useCallback(() => {
    console.log("Triggering file input click");
    fileInputRef.current.click();
  }, []);

  const getFileName = () => {
    if (editActivityFile) return editActivityFile.name;
    if (editActivity.activity_picture) {
      return editActivity.activity_picture.split("/").pop();
    }
    return null;
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Edit Activity</h3>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={editActivity.activity_name || ""}
            onChange={(e) =>
              setEditActivity({
                ...editActivity,
                activity_name: e.target.value,
              })
            }
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={editActivity.activity_description || ""}
            onChange={(e) =>
              setEditActivity({
                ...editActivity,
                activity_description: e.target.value,
              })
            }
          />
        </div>
        <div className="form-group">
          <label>Requirement Type</label>
          <select
            value={editActivity.requirement_type || ""}
            onChange={(e) =>
              setEditActivity({
                ...editActivity,
                requirement_type: e.target.value,
              })
            }
          >
            <option value="">Select Type</option>
            <option value="likes">Likes</option>
            <option value="comments">Comments</option>
          </select>
        </div>
        <div className="form-group">
          <label>Requirement Value</label>
          <input
            type="number"
            value={editActivity.requirement_value || ""}
            onChange={(e) =>
              setEditActivity({
                ...editActivity,
                requirement_value: e.target.value,
              })
            }
            min="1"
          />
        </div>
        <div className="form-group">
          <label>Reset Duration</label>
          <select
            value={editActivity.reset_duration || ""}
            onChange={(e) =>
              setEditActivity({
                ...editActivity,
                reset_duration: e.target.value,
              })
            }
          >
            <option value="">No reset</option>
            <option value="1 hour">1 hour</option>
            <option value="1 day">1 day</option>
            <option value="1 week">1 week</option>
          </select>
        </div>
        <div className="form-group">
          <label>Point Value</label>
          <input
            type="number"
            value={editActivity.point_value || ""}
            onChange={(e) =>
              setEditActivity({
                ...editActivity,
                point_value: e.target.value,
              })
            }
            min="1"
            defaultValue="10"
          />
        </div>
        <div className="form-group">
          <label>Picture</label>
          <button
            className="confirm-btn"
            onClick={triggerFileInput}
            style={{ marginBottom: "10px" }}
          >
            Choose File
          </button>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleFileChange}
            className="file-input"
            ref={fileInputRef}
            style={{ display: "none" }}
          />
          {(editActivityFile || editActivity.activity_picture) && (
            <div className="image-preview">
              <p>{getFileName()}</p>
            </div>
          )}
        </div>
        <div className="modal-buttons">
          <button className="confirm-btn" onClick={onSave}>
            Save
          </button>
          <button
            className="cancel-btn"
            onClick={() => {
              onClose();
              setEditActivityFile(null);
              setError(null);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminManageActivities() {
  const [activities, setActivities] = useState([]);
  const [sortOption, setSortOption] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [showCreateMessage, setShowCreateMessage] = useState(false);
  const [showUpdateMessage, setShowUpdateMessage] = useState(false);
  const [totalActivities, setTotalActivities] = useState(0);
  const [newActivity, setNewActivity] = useState({
    activity_name: "",
    activity_description: "",
    requirement_type: "",
    requirement_value: "",
    reset_duration: "",
    point_value: 10,
    activity_picture: "",
  });
  const [newActivityFile, setNewActivityFile] = useState(null);
  const [editActivity, setEditActivity] = useState(null);
  const [editActivityFile, setEditActivityFile] = useState(null);
  const [error, setError] = useState(null);

  console.log("AdminManageActivities rendered");

  useEffect(() => {
    console.log("Fetching activities...");
    fetchActivities();
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("activities").select("*");
      console.log("Fetched activities:", data);
      if (error) {
        console.error("Error fetching activities:", error.message);
        setError("Failed to load activities. Please try again.");
        return;
      }
      setActivities(data || []);
      setTotalActivities(data ? data.length : 0);
      setError(null);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred.");
    }
  }, []);

  const uploadImage = useCallback(async (file, activityId) => {
    console.log("Uploading image for activity:", activityId);
    const fileExt = file.name.split(".").pop();
    const fileName = `activity-${activityId}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from("activity-pictures")
      .upload(fileName, file, { upsert: true });
    if (error) {
      console.error("Error uploading image:", error.message);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    const { data: urlData } = supabase.storage
      .from("activity-pictures")
      .getPublicUrl(fileName);
    console.log("Public URL:", urlData?.publicUrl);
    if (!urlData?.publicUrl) {
      throw new Error("Failed to get public URL for the image.");
    }
    return urlData.publicUrl;
  }, []);

  const handleCreateActivity = useCallback(async () => {
    if (!newActivity.activity_name.trim()) {
      setError("Activity name is required.");
      return;
    }
    if (!newActivity.activity_description.trim()) {
      setError("Activity description is required.");
      return;
    }
    if (!newActivity.requirement_type) {
      setError("Requirement type is required.");
      return;
    }
    if (!newActivity.requirement_value || isNaN(newActivity.requirement_value) || parseInt(newActivity.requirement_value, 10) <= 0) {
      setError("Requirement value must be a positive number.");
      return;
    }
    if (!newActivity.point_value || isNaN(newActivity.point_value) || parseInt(newActivity.point_value, 10) <= 0) {
      setError("Point value must be a positive number.");
      return;
    }
    try {
      console.log("Creating activity:", newActivity);
      const activityData = {
        activity_name: newActivity.activity_name.trim(),
        activity_description: newActivity.activity_description.trim(),
        requirement_type: newActivity.requirement_type,
        requirement_value: parseInt(newActivity.requirement_value, 10),
        reset_duration: newActivity.reset_duration || null,
        point_value: parseInt(newActivity.point_value, 10),
        activity_picture: newActivity.activity_picture,
      };

      if (newActivityFile) {
        const { data: insertedData, error: insertError } = await supabase
          .from("activities")
          .insert(activityData)
          .select()
          .single();
        if (insertError) {
          console.error("Error creating activity:", insertError.message);
          throw new Error(`Failed to create activity: ${insertError.message}`);
        }
        const activityId = insertedData.id;
        const activityPicture = await uploadImage(newActivityFile, activityId);
        const { error: updateError } = await supabase
          .from("activities")
          .update({ activity_picture: activityPicture })
          .eq("id", activityId);
        if (updateError) {
          console.error("Error updating activity picture:", updateError.message);
          throw new Error(`Failed to update activity picture: ${updateError.message}`);
        }
      } else {
        const { error } = await supabase.from("activities").insert(activityData);
        if (error) {
          console.error("Error creating activity:", error.message);
          throw new Error(`Failed to create activity: ${error.message}`);
        }
      }
      setShowCreateModal(false);
      setNewActivity({
        activity_name: "",
        activity_description: "",
        requirement_type: "",
        requirement_value: "",
        reset_duration: "",
        point_value: 10,
        activity_picture: "",
      });
      setNewActivityFile(null);
      setError(null);
      fetchActivities();
      setShowCreateMessage(true);
      setTimeout(() => setShowCreateMessage(false), 3000);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(err.message || "An unexpected error occurred.");
    }
  }, [newActivity, newActivityFile, fetchActivities, uploadImage]);

  const handleEditActivity = useCallback(async () => {
    if (!editActivity) {
      setError("No activity selected for editing.");
      return;
    }
    if (!editActivity.activity_name.trim()) {
      setError("Activity name is required.");
      return;
    }
    if (!editActivity.activity_description.trim()) {
      setError("Activity description is required.");
      return;
    }
    if (!editActivity.requirement_type) {
      setError("Requirement type is required.");
      return;
    }
    if (!editActivity.requirement_value || isNaN(editActivity.requirement_value) || parseInt(editActivity.requirement_value, 10) <= 0) {
      setError("Requirement value must be a positive number.");
      return;
    }
    if (!editActivity.point_value || isNaN(editActivity.point_value) || parseInt(editActivity.point_value, 10) <= 0) {
      setError("Point value must be a positive number.");
      return;
    }
    try {
      console.log("Updating activity:", editActivity);
      let activityPicture = editActivity.activity_picture;
      if (editActivityFile) {
        activityPicture = await uploadImage(editActivityFile, editActivity.id);
      }
      const { error } = await supabase
        .from("activities")
        .update({
          activity_name: editActivity.activity_name.trim(),
          activity_description: editActivity.activity_description.trim(),
          requirement_type: editActivity.requirement_type,
          requirement_value: parseInt(editActivity.requirement_value, 10),
          reset_duration: editActivity.reset_duration || null,
          point_value: parseInt(editActivity.point_value, 10),
          activity_picture: activityPicture,
        })
        .eq("id", editActivity.id);
      if (error) {
        console.error("Error updating activity:", error.message);
        throw new Error(`Failed to update activity: ${error.message}`);
      }
      setShowEditModal(false);
      setEditActivity(null);
      setEditActivityFile(null);
      setError(null);
      fetchActivities();
      setShowUpdateMessage(true);
      setTimeout(() => setShowUpdateMessage(false), 3000);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(err.message || "An unexpected error occurred.");
    }
  }, [editActivity, editActivityFile, fetchActivities, uploadImage]);

  const handleDeleteActivity = useCallback(async () => {
    if (!activityToDelete) {
      setError("No activity selected for deletion.");
      return;
    }
    try {
      console.log("Deleting activity ID:", activityToDelete);
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityToDelete);
      if (error) {
        console.error("Error deleting activity:", error.message);
        throw new Error(`Failed to delete activity: ${error.message}`);
      }
      setActivities((prev) => prev.filter((a) => a.id !== activityToDelete));
      setActivityToDelete(null);
      setShowConfirmDelete(false);
      setError(null);
      setShowDeleteMessage(true);
      setTimeout(() => setShowDeleteMessage(false), 3000);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred.");
    }
  }, [activityToDelete]);

  const handleSortChange = useCallback((value) => {
    console.log("Sort option changed to:", value);
    setSortOption(value);
  }, []);

  const filteredActivities = activities
    .filter((activity) => {
      const name = activity.activity_name?.toLowerCase() || "";
      const description = activity.activity_description?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return name.includes(query) || description.includes(query);
    })
    .sort((a, b) => {
      console.log("Sorting - A created_at:", a.created_at, "B created_at:", b.created_at);
      switch (sortOption) {
        case "id":
          return a.id - b.id;
        case "nameDesc":
          return b.activity_name?.localeCompare(a.activity_name) || 0;
        case "newest":
          if (!a.created_at && !b.created_at) return 0;
          if (!a.created_at) return 1;
          if (!b.created_at) return -1;
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          if (!a.created_at && !b.created_at) return 0;
          if (!a.created_at) return -1;
          if (!b.created_at) return 1;
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return a.activity_name?.localeCompare(b.activity_name) || 0;
      }
    });

  return (
    <ErrorBoundary>
      <div className="admin-wrapper">
        <Navbar />
        <div className="admin-layout">
          <AdminSidebar />
          <div className="admin-content">
            <h1>Manage Activities</h1>

            {error && <p className="error-message">{error}</p>}

            <div className="activity-counts">
              <p>Total Activities: {totalActivities}</p>
              <p>Currently Displaying: {filteredActivities.length}</p>
            </div>

            <div className="activity-toolbar">
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select value={sortOption} onChange={(e) => handleSortChange(e.target.value)}>
                <option value="name">Name (A-Z)</option>
                <option value="nameDesc">Name (Z-A)</option>
                <option value="id">ID</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
              <button
                className="create-btn"
                onClick={() => setShowCreateModal(true)}
              >
                Create New Activity
              </button>
            </div>

            <div className="activity-grid">
              {activities.length === 0 && !error ? (
                <p>Loading activities...</p>
              ) : filteredActivities.length === 0 ? (
                <p>No activities found.</p>
              ) : (
                filteredActivities.map((activity) => (
                  <div className="activity-card" key={activity.id}>
                    <img
                      src={activity.activity_picture || "/images/default-activity.png"}
                      alt={activity.activity_name || "Activity"}
                      className="activity-image"
                    />
                    <div className="activity-info">
                      <p><strong>Name:</strong> {activity.activity_name || "Unnamed"}</p>
                      <p><strong>Description:</strong> {activity.activity_description || "No description"}</p>
                      <p><strong>Requirement:</strong> {activity.requirement_type || "None"} ({activity.requirement_value || 0})</p>
                      <p className="reset-info"><strong>Reset:</strong> {activity.reset_duration || "No reset"}</p>
                      <p className="points-info"><strong>Points:</strong> {activity.point_value || 10}</p>
                      <p><strong>ID:</strong> {activity.id}</p>
                      <div className="activity-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setEditActivity(activity);
                            setShowEditModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => {
                            setActivityToDelete(activity.id);
                            setShowConfirmDelete(true);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {showCreateModal && (
              <CreateActivityModal
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateActivity}
                newActivity={newActivity}
                setNewActivity={setNewActivity}
                newActivityFile={newActivityFile}
                setNewActivityFile={setNewActivityFile}
                error={error}
                setError={setError}
              />
            )}

            {showEditModal && editActivity && (
              <EditActivityModal
                onClose={() => setShowEditModal(false)}
                onSave={handleEditActivity}
                editActivity={editActivity}
                setEditActivity={setEditActivity}
                editActivityFile={editActivityFile}
                setEditActivityFile={setEditActivityFile}
                error={error}
                setError={setError}
              />
            )}

            {showConfirmDelete && (
              <div className="modal-backdrop">
                <div className="modal">
                  <h3>Confirm Deletion</h3>
                  <p>Are you sure you want to delete this activity?</p>
                  <div className="modal-buttons">
                    <button className="confirm-btn" onClick={handleDeleteActivity}>
                      Yes, Delete
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => setShowConfirmDelete(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showCreateMessage && (
              <div className="toast-popup">Activity created successfully!</div>
            )}
            {showUpdateMessage && (
              <div className="toast-popup">Activity updated successfully!</div>
            )}
            {showDeleteMessage && (
              <div className="toast-popup">Activity deleted successfully!</div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default AdminManageActivities;