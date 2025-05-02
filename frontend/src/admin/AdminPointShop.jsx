import React, { useEffect, useState, useRef } from "react";
import supabase from "../supabaseClient";
import Navbar from "../components/Navbar";
import AdminSidebar from "./AdminSidebar";
import "./AdminPointShop.css";

const CreateItemModal = ({ onClose, onCreate, newItem, setNewItem, newItemFile, setNewItemFile, error, setError }) => {
  const fileInputRef = useRef(null);

  console.log("CreateItemModal rendered");

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
    setNewItemFile(file);
  };

  const triggerFileInput = () => {
    console.log("Triggering file input click");
    fileInputRef.current.click();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Create New Item</h3>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="item_name"
            value={newItem.item_name}
            onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="item_description"
            value={newItem.item_description}
            onChange={(e) => setNewItem({ ...newItem, item_description: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Point Cost</label>
          <input
            type="number"
            name="point_cost"
            value={newItem.point_cost}
            onChange={(e) => setNewItem({ ...newItem, point_cost: e.target.value })}
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
          {newItemFile && (
            <div className="image-preview">
              <p>{newItemFile.name}</p>
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
              setNewItemFile(null);
              setError(null);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const EditItemModal = ({ onClose, onSave, editingItem, setEditingItem, editItemFile, setEditItemFile, error, setError }) => {
  const fileInputRef = useRef(null);

  console.log("EditItemModal rendered");

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
    setEditItemFile(file);
  };

  const triggerFileInput = () => {
    console.log("Triggering file input click");
    fileInputRef.current.click();
  };

  const getFileName = () => {
    if (editItemFile) return editItemFile.name;
    if (editingItem.item_picture) {
      return editingItem.item_picture.split("/").pop();
    }
    return null;
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Edit Item</h3>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="item_name"
            value={editingItem.item_name}
            onChange={(e) => setEditingItem({ ...editingItem, item_name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="item_description"
            value={editingItem.item_description}
            onChange={(e) => setEditingItem({ ...editingItem, item_description: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Point Cost</label>
          <input
            type="number"
            name="point_cost"
            value={editingItem.point_cost}
            onChange={(e) => setEditingItem({ ...editingItem, point_cost: e.target.value })}
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
          {(editItemFile || editingItem.item_picture) && (
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
              setEditItemFile(null);
              setError(null);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminPointShop = () => {
  const [items, setItems] = useState([]);
  const [sortOption, setSortOption] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showCreateMessage, setShowCreateMessage] = useState(false);
  const [showUpdateMessage, setShowUpdateMessage] = useState(false);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [newItem, setNewItem] = useState({
    item_name: "",
    item_description: "",
    point_cost: "",
    item_picture: "",
  });
  const [newItemFile, setNewItemFile] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editItemFile, setEditItemFile] = useState(null);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [userPoints, setUserPoints] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("Fetching point_shop_items...");
      const { data: itemsData, error: itemsError } = await supabase
        .from("point_shop_items")
        .select("*")
        .order("point_cost", { ascending: true });
      console.log("point_shop_items:", itemsData, "Error:", itemsError);
      if (itemsError) throw new Error(`Items error: ${itemsError.message}`);
      setItems(itemsData || []);
      setTotalItems(itemsData ? itemsData.length : 0);

      console.log("Fetching purchased_items...");
      const { data: purchasedData, error: purchasedError } = await supabase
        .from("purchased_items")
        .select(`
          *,
          profiles (username),
          point_shop_items (item_name)
        `)
        .order("purchased_at", { ascending: false });
      console.log("purchased_items:", purchasedData, "Error:", purchasedError);
      if (purchasedError) throw new Error(`Purchased items error: ${purchasedError.message}`);
      setPurchasedItems(purchasedData || []);

      console.log("Fetching points...");
      const { data: pointsData, error: pointsError } = await supabase
        .from("points")
        .select(`
          *,
          profiles (username)
        `)
        .order("points", { ascending: false });
      console.log("points:", pointsData, "Error:", pointsError);
      if (pointsError) throw new Error(`Points error: ${pointsError.message}`);
      setUserPoints(pointsData || []);

      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err.message);
      setError(`Failed to load admin data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file, itemId) => {
    console.log("Uploading image for item:", itemId);
    const fileExt = file.name.split(".").pop();
    const fileName = `item-${itemId}-${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("pointshop-item-pictures")
      .upload(fileName, file, { upsert: true });
    if (error) {
      console.error("Error uploading image:", error.message);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    const { data: urlData } = supabase.storage
      .from("pointshop-item-pictures")
      .getPublicUrl(fileName);
    console.log("Public URL:", urlData?.publicUrl);
    if (!urlData?.publicUrl) {
      throw new Error("Failed to get public URL for the image.");
    }
    return urlData.publicUrl;
  };

  const handleAddItem = async () => {
    if (!newItem.item_name || !newItem.item_description || !newItem.point_cost) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      console.log("Adding item:", newItem);
      let itemPicture = newItem.item_picture;
      if (newItemFile) {
        const { data: insertedData, error: insertError } = await supabase
          .from("point_shop_items")
          .insert({
            item_name: newItem.item_name,
            item_description: newItem.item_description,
            point_cost: parseInt(newItem.point_cost),
          })
          .select()
          .single();
        if (insertError) {
          console.error("Error creating item:", insertError.message);
          throw new Error(`Failed to create item: ${insertError.message}`);
        }
        const itemId = insertedData.id;
        itemPicture = await uploadImage(newItemFile, itemId);
        const { error: updateError } = await supabase
          .from("point_shop_items")
          .update({ item_picture: itemPicture })
          .eq("id", itemId);
        if (updateError) {
          console.error("Error updating item picture:", updateError.message);
          throw new Error(`Failed to update item picture: ${updateError.message}`);
        }
      } else {
        const { error } = await supabase.from("point_shop_items").insert({
          item_name: newItem.item_name,
          item_description: newItem.item_description,
          point_cost: parseInt(newItem.point_cost),
          item_picture: itemPicture || null,
        });
        if (error) {
          console.error("Error creating item:", error.message);
          throw new Error(`Failed to create item: ${error.message}`);
        }
      }
      setShowCreateModal(false);
      setNewItem({ item_name: "", item_description: "", point_cost: "", item_picture: "" });
      setNewItemFile(null);
      await fetchData();
      setShowCreateMessage(true);
      setTimeout(() => setShowCreateMessage(false), 3000);
      setError(null);
    } catch (err) {
      console.error("Error adding item:", err.message);
      setError(`Failed to add item: ${err.message}`);
    }
  };

  const handleEditItem = async () => {
    if (!editingItem.item_name || !editingItem.item_description || !editingItem.point_cost) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      console.log("Updating item:", editingItem);
      let itemPicture = editingItem.item_picture;
      if (editItemFile) {
        itemPicture = await uploadImage(editItemFile, editingItem.id);
      }
      const { error } = await supabase
        .from("point_shop_items")
        .update({
          item_name: editingItem.item_name,
          item_description: editingItem.item_description,
          point_cost: parseInt(editingItem.point_cost),
          item_picture: itemPicture || null,
        })
        .eq("id", editingItem.id);
      if (error) {
        console.error("Error updating item:", error.message);
        throw new Error(`Failed to update item: ${error.message}`);
      }
      setShowEditModal(false);
      setEditingItem(null);
      setEditItemFile(null);
      await fetchData();
      setShowUpdateMessage(true);
      setTimeout(() => setShowUpdateMessage(false), 3000);
      setError(null);
    } catch (err) {
      console.error("Error updating item:", err.message);
      setError(`Failed to update item: ${err.message}`);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      console.log("Deleting item ID:", itemToDelete);
      const { error } = await supabase
        .from("point_shop_items")
        .delete()
        .eq("id", itemToDelete);
      if (error) {
        console.error("Error deleting item:", error.message);
        throw new Error(`Failed to delete item: ${error.message}`);
      }
      setItems((prev) => prev.filter((item) => item.id !== itemToDelete));
      setItemToDelete(null);
      setShowConfirmDelete(false);
      setShowDeleteMessage(true);
      setTimeout(() => setShowDeleteMessage(false), 3000);
      setError(null);
    } catch (err) {
      console.error("Error deleting item:", err.message);
      setError(`Failed to delete item: ${err.message}`);
    }
  };

  const handleSortChange = (value) => setSortOption(value);

  const filteredItems = items
    .filter((item) => {
      const name = item.item_name?.toLowerCase() || "";
      const description = item.item_description?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return name.includes(query) || description.includes(query);
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "nameDesc":
          return b.item_name.localeCompare(a.item_name);
        case "costAsc":
          return a.point_cost - b.point_cost;
        case "costDesc":
          return b.point_cost - a.point_cost;
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return a.item_name.localeCompare(b.item_name);
      }
    });

  return (
    <div className="admin-wrapper">
      <Navbar />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <h1>Manage Point Shop</h1>

          {error && <p className="error-message">{error}</p>}

          <div className="item-counts">
            <p>Total Items: {totalItems}</p>
            <p>Currently Displaying: {filteredItems.length}</p>
          </div>

          <div className="pointshop-toolbar">
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select value={sortOption} onChange={(e) => handleSortChange(e.target.value)}>
              <option value="name">Name (A-Z)</option>
              <option value="nameDesc">Name (Z-A)</option>
              <option value="costAsc">Cost (Low to High)</option>
              <option value="costDesc">Cost (High to Low)</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
            <button
              className="create-btn"
              onClick={() => setShowCreateModal(true)}
            >
              Create New Item
            </button>
          </div>

          <div className="pointshop-grid">
            {loading ? (
              <p>Loading items...</p>
            ) : filteredItems.length === 0 ? (
              <p>No items found.</p>
            ) : (
              filteredItems.map((item) => (
                <div className="pointshop-card" key={item.id}>
                  <img
                    src={item.item_picture || "/images/default-item.png"}
                    alt={item.item_name}
                    className="pointshop-image"
                  />
                  <div className="pointshop-info">
                    <p><strong>Name:</strong> {item.item_name}</p>
                    <p><strong>Description:</strong> {item.item_description}</p>
                    <p><strong>Point Cost:</strong> {item.point_cost}</p>
                    <p><strong>ID:</strong> {item.id}</p>
                    <div className="pointshop-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditingItem(item);
                          setShowEditModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => {
                          setItemToDelete(item.id);
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

          <h2>Purchased Items</h2>
          <div className="purchased-items-grid">
            {purchasedItems.length === 0 ? (
              <p>No purchased items.</p>
            ) : (
              purchasedItems.map((purchase) => (
                <div className="purchased-item-card" key={purchase.id}>
                  <p><strong>Item:</strong> {purchase.point_shop_items.item_name}</p>
                  <p><strong>User:</strong> {purchase.profiles.username}</p>
                  <p><strong>Purchased on:</strong> {new Date(purchase.purchased_at).toLocaleDateString()}</p>
                  <p><strong>ID:</strong> {purchase.id}</p>
                </div>
              ))
            )}
          </div>

          <h2>User Points</h2>
          <div className="user-points-grid">
            {userPoints.length === 0 ? (
              <p>No user points data.</p>
            ) : (
              userPoints.map((point) => (
                <div className="user-points-card" key={point.id}>
                  <p><strong>User:</strong> {point.profiles.username}</p>
                  <p><strong>Points:</strong> {point.points}</p>
                  <p><strong>ID:</strong> {point.id}</p>
                </div>
              ))
            )}
          </div>

          {showCreateModal && (
            <CreateItemModal
              onClose={() => setShowCreateModal(false)}
              onCreate={handleAddItem}
              newItem={newItem}
              setNewItem={setNewItem}
              newItemFile={newItemFile}
              setNewItemFile={setNewItemFile}
              error={error}
              setError={setError}
            />
          )}

          {showEditModal && editingItem && (
            <EditItemModal
              onClose={() => setShowEditModal(false)}
              onSave={handleEditItem}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
              editItemFile={editItemFile}
              setEditItemFile={setEditItemFile}
              error={error}
              setError={setError}
            />
          )}

          {showConfirmDelete && (
            <div className="modal-backdrop">
              <div className="modal">
                <h3>Confirm Deletion</h3>
                <p>Are you sure you want to delete this item?</p>
                <div className="modal-buttons">
                  <button className="confirm-btn" onClick={handleDeleteItem}>
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
            <div className="toast-popup">Item created successfully!</div>
          )}
          {showUpdateMessage && (
            <div className="toast-popup">Item updated successfully!</div>
          )}
          {showDeleteMessage && (
            <div className="toast-popup">Item deleted successfully!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPointShop;