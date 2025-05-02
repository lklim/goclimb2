import { useEffect, useState, useRef } from "react";
import supabase from "../supabaseClient";
import Navbar from "../components/Navbar";
import AdminSidebar from "./AdminSidebar";
import "./AdminManageAchievement.css";

function CreateAchievementModal({ onClose, onCreate, newAchievement, setNewAchievement, newAchievementFile, setNewAchievementFile, error, setError }) {
  const fileInputRef = useRef(null);

  console.log("CreateAchievementModal rendered");

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

  const handleFileChange = (e) => {
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
    setNewAchievementFile(file);
  };

  const triggerFileInput = () => {
    console.log("Triggering file input click");
    fileInputRef.current.click();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Create New Achievement</h3>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={newAchievement.achievement_name}
            onChange={(e) =>
              setNewAchievement({
                ...newAchievement,
                achievement_name: e.target.value,
              })
            }
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={newAchievement.description}
            onChange={(e) =>
              setNewAchievement({
                ...newAchievement,
                description: e.target.value,
              })
            }
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
          {newAchievementFile && (
            <div className="image-preview">
              <p>{newAchievementFile.name}</p>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Requirement Type</label>
          <select
            value={newAchievement.requirement_type}
            onChange={(e) =>
              setNewAchievement({
                ...newAchievement,
                requirement_type: e.target.value,
              })
            }
          >
            <option value="">Select Requirement Type</option>
            <option value="Climb Log">Climb Log</option>
            <option value="Posts">Posts</option>
          </select>
        </div>
        <div className="form-group">
          <label>Requirement Value</label>
          <input
            type="text"
            value={newAchievement.requirement_value}
            onChange={(e) =>
              setNewAchievement({
                ...newAchievement,
                requirement_value: e.target.value,
              })
            }
          />
        </div>
        <div className="modal-buttons">
          <button className="confirm-btn" onClick={onCreate}>
            Create
          </button>
          <button
            className="cancel-btn"
            onClick={() => {
              onClose();
              setNewAchievementFile(null);
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

function EditAchievementModal({ onClose, onSave, editAchievement, setEditAchievement, editAchievementFile, setEditAchievementFile, error, setError }) {
  const fileInputRef = useRef(null);

  console.log("EditAchievementModal rendered");

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

  const handleFileChange = (e) => {
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
    setEditAchievementFile(file);
  };

  const triggerFileInput = () => {
    console.log("Triggering file input click");
    fileInputRef.current.click();
  };

  const getFileName = () => {
    if (editAchievementFile) return editAchievementFile.name;
    if (editAchievement.achievement_picture) {
      return editAchievement.achievement_picture.split("/").pop();
    }
    return null;
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Edit Achievement</h3>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={editAchievement.achievement_name}
            onChange={(e) =>
              setEditAchievement({
                ...editAchievement,
                achievement_name: e.target.value,
              })
            }
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={editAchievement.description}
            onChange={(e) =>
              setEditAchievement({
                ...editAchievement,
                description: e.target.value,
              })
            }
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
          {(editAchievementFile || editAchievement.achievement_picture) && (
            <div className="image-preview">
              <p>{getFileName()}</p>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Requirement Type</label>
          <select
            value={editAchievement.requirement_type || ""}
            onChange={(e) =>
              setEditAchievement({
                ...editAchievement,
                requirement_type: e.target.value,
              })
            }
          >
            <option value="">Select Requirement Type</option>
            <option value="Climb Log">Climb Log</option>
            <option value="Posts">Posts</option>
          </select>
        </div>
        <div className="form-group">
          <label>Requirement Value</label>
          <input
            type="text"
            value={editAchievement.requirement_value}
            onChange={(e) =>
              setEditAchievement({
                ...editAchievement,
                requirement_value: e.target.value,
              })
            }
          />
        </div>
        <div className="modal-buttons">
          <button className="confirm-btn" onClick={onSave}>
            Save
          </button>
          <button
            className="cancel-btn"
            onClick={() => {
              onClose();
              setEditAchievementFile(null);
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

function AdminManageAchievement() {
  console.log("AdminManageAchievement component rendered");

  const [achievements, setAchievements] = useState([]);
  const [sortOption, setSortOption] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [achievementToDelete, setAchievementToDelete] = useState(null);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [showCreateMessage, setShowCreateMessage] = useState(false);
  const [showUpdateMessage, setShowUpdateMessage] = useState(false);
  const [totalAchievements, setTotalAchievements] = useState(0);
  const [newAchievement, setNewAchievement] = useState({
    achievement_name: "",
    description: "",
    achievement_picture: "",
    requirement_type: "",
    requirement_value: "",
  });
  const [newAchievementFile, setNewAchievementFile] = useState(null);
  const [editAchievement, setEditAchievement] = useState(null);
  const [editAchievementFile, setEditAchievementFile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Fetching achievements on mount");
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase.from("achievements").select("*");
      console.log("Fetched achievements:", data);
      if (error) {
        console.error("Error fetching achievements:", error.message);
        setError("Failed to load achievements. Please try again.");
        return;
      }
      setAchievements(data || []);
      setTotalAchievements(data ? data.length : 0);
      setError(null);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred.");
    }
  };

  const uploadImage = async (file, achievementId) => {
    console.log("Uploading image for achievement:", achievementId);
    const fileExt = file.name.split(".").pop();
    const fileName = `achievement-${achievementId}-${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("achievement-pictures")
      .upload(fileName, file, { upsert: true });
    if (error) {
      console.error("Error uploading image:", error.message);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    const { data: urlData } = supabase.storage
      .from("achievement-pictures")
      .getPublicUrl(fileName);
    console.log("Public URL:", urlData?.publicUrl);
    if (!urlData?.publicUrl) {
      throw new Error("Failed to get public URL for the image.");
    }
    return urlData.publicUrl;
  };

  const handleCreateAchievement = async () => {
    if (!newAchievement.achievement_name || !newAchievement.description) {
      setError("Name and description are required.");
      return;
    }
    try {
      let achievementPicture = newAchievement.achievement_picture;
      if (newAchievementFile) {
        const { data: insertedData, error: insertError } = await supabase
          .from("achievements")
          .insert({
            achievement_name: newAchievement.achievement_name,
            description: newAchievement.description,
            requirement_type: newAchievement.requirement_type,
            requirement_value: newAchievement.requirement_value,
          })
          .select()
          .single();
        if (insertError) {
          console.error("Error creating achievement:", insertError.message);
          throw new Error(`Failed to create achievement: ${insertError.message}`);
        }
        const achievementId = insertedData.id;
        achievementPicture = await uploadImage(newAchievementFile, achievementId);
        const { error: updateError } = await supabase
          .from("achievements")
          .update({ achievement_picture: achievementPicture })
          .eq("id", achievementId);
        if (updateError) {
          console.error("Error updating achievement picture:", updateError.message);
          throw new Error(`Failed to update achievement picture: ${updateError.message}`);
        }
      } else {
        const { error } = await supabase.from("achievements").insert({
          achievement_name: newAchievement.achievement_name,
          description: newAchievement.description,
          achievement_picture: achievementPicture,
          requirement_type: newAchievement.requirement_type,
          requirement_value: newAchievement.requirement_value,
        });
        if (error) {
          console.error("Error creating achievement:", error.message);
          throw new Error(`Failed to create achievement: ${error.message}`);
        }
      }
      setShowCreateModal(false);
      setNewAchievement({
        achievement_name: "",
        description: "",
        achievement_picture: "",
        requirement_type: "",
        requirement_value: "",
      });
      setNewAchievementFile(null);
      fetchAchievements();
      setShowCreateMessage(true);
      setTimeout(() => setShowCreateMessage(false), 3000);
      setError(null);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const handleEditAchievement = async () => {
    if (!editAchievement || !editAchievement.achievement_name || !editAchievement.description) {
      setError("Name and description are required.");
      return;
    }
    try {
      let achievementPicture = editAchievement.achievement_picture;
      if (editAchievementFile) {
        achievementPicture = await uploadImage(editAchievementFile, editAchievement.id);
      }
      const { error } = await supabase
        .from("achievements")
        .update({
          achievement_name: editAchievement.achievement_name,
          description: editAchievement.description,
          achievement_picture: achievementPicture,
          requirement_type: editAchievement.requirement_type,
          requirement_value: editAchievement.requirement_value,
        })
        .eq("id", editAchievement.id);
      if (error) {
        console.error("Error updating achievement:", error.message);
        throw new Error(`Failed to update achievement: ${error.message}`);
      }
      setShowEditModal(false);
      setEditAchievement(null);
      setEditAchievementFile(null);
      fetchAchievements();
      setShowUpdateMessage(true);
      setTimeout(() => setShowUpdateMessage(false), 3000);
      setError(null);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const handleDeleteAchievement = async () => {
    if (!achievementToDelete) return;
    try {
      const { error } = await supabase
        .from("achievements")
        .delete()
        .eq("id", achievementToDelete);
      if (error) {
        console.error("Error deleting achievement:", error.message);
        throw new Error(`Failed to delete achievement: ${error.message}`);
      }
      setAchievements((prev) => prev.filter((a) => a.id !== achievementToDelete));
      setAchievementToDelete(null);
      setShowConfirmDelete(false);
      setShowDeleteMessage(true);
      setTimeout(() => setShowDeleteMessage(false), 3000);
      setError(null);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred.");
    }
  };

  const handleSortChange = (value) => setSortOption(value);

  const filteredAchievements = achievements
    .filter((achievement) => {
      const name = achievement.achievement_name?.toLowerCase() || "";
      const description = achievement.description?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return name.includes(query) || description.includes(query);
    })
    .sort((a, b) => {
      console.log("Sorting - A created_at:", a.created_at, "B created_at:", b.created_at);
      switch (sortOption) {
        case "id":
          return a.id - b.id;
        case "nameDesc":
          return b.achievement_name.localeCompare(a.achievement_name);
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
          return a.achievement_name.localeCompare(a.achievement_name);
      }
    });

  return (
    <div className="admin-wrapper">
      <Navbar />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <h1>Manage Achievements</h1>

          {error && <p className="error-message">{error}</p>}

          <div className="achievement-counts">
            <p>Total Achievements: {totalAchievements}</p>
            <p>Currently Displaying: {filteredAchievements.length}</p>
          </div>

          <div className="achievement-toolbar">
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
              Create New Achievement
            </button>
          </div>

          <div className="achievement-grid">
            {achievements.length === 0 && !error ? (
              <p>Loading achievements...</p>
            ) : filteredAchievements.length === 0 ? (
              <p>No achievements found.</p>
            ) : (
              filteredAchievements.map((achievement) => (
                <div className="achievement-card" key={achievement.id}>
                  <img
                    src={achievement.achievement_picture || "/images/default-achievement.png"}
                    alt={achievement.achievement_name}
                    className="achievement-image"
                  />
                  <div className="achievement-info">
                    <p><strong>Name:</strong> {achievement.achievement_name}</p>
                    <p><strong>Description:</strong> {achievement.description}</p>
                    <p><strong>Requirement Type:</strong> {achievement.requirement_type || "N/A"}</p>
                    <p><strong>Requirement Value:</strong> {achievement.requirement_value || "N/A"}</p>
                    <p><strong>ID:</strong> {achievement.id}</p>
                    <div className="achievement-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditAchievement(achievement);
                          setShowEditModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => {
                          setAchievementToDelete(achievement.id);
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
            <CreateAchievementModal
              onClose={() => setShowCreateModal(false)}
              onCreate={handleCreateAchievement}
              newAchievement={newAchievement}
              setNewAchievement={setNewAchievement}
              newAchievementFile={newAchievementFile}
              setNewAchievementFile={setNewAchievementFile}
              error={error}
              setError={setError}
            />
          )}

          {showEditModal && editAchievement && (
            <CreateAchievementModal
              onClose={() => setShowEditModal(false)}
              onCreate={handleEditAchievement}
              newAchievement={editAchievement}
              setNewAchievement={setEditAchievement}
              newAchievementFile={editAchievementFile}
              setNewAchievementFile={setEditAchievementFile}
              error={error}
              setError={setError}
            />
          )}

          {showConfirmDelete && (
            <div className="modal-backdrop">
              <div className="modal">
                <h3>Confirm Deletion</h3>
                <p>Are you sure you want to delete this achievement?</p>
                <div className="modal-buttons">
                  <button className="confirm-btn" onClick={handleDeleteAchievement}>
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
            <div className="toast-popup">Achievement created successfully!</div>
          )}
          {showUpdateMessage && (
            <div className="toast-popup">Achievement updated successfully!</div>
          )}
          {showDeleteMessage && (
            <div className="toast-popup">Achievement deleted successfully!</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminManageAchievement;