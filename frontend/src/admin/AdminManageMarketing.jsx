import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import Navbar from "../components/Navbar";
import AdminSidebar from "./AdminSidebar";
import "./AdminManageMarketing.css";

function AdminManageMarketing() {
  const [images, setImages] = useState([]);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("marketing")
        .select("id, created_at, picture, placeholder")
        .order("placeholder", { ascending: false });

      if (error) {
        console.error("Error fetching marketing images:", error.message);
      } else {
        setImages(data);
      }
    })();
  }, []);

  const deleteImage = async () => {
    if (!imageToDelete) return;

    const { error } = await supabase
      .from("marketing")
      .update({ picture: null })
      .eq("id", imageToDelete.id);

    if (error) {
      console.error("Error clearing picture field:", error.message);
    } else {
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageToDelete.id ? { ...img, picture: null } : img
        )
      );
      setShowConfirm(false);
      setImageToDelete(null);
    }
  };

  const handleImageReplace = async (e, id) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingId(id);

    const fileExt = file.name.split(".").pop();
    const filePath = `${id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("marketing-page-pics")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Upload failed:", uploadError.message);
      setUploadingId(null);
      return;
    }

    const { data: { publicUrl } = {} } = supabase.storage
      .from("marketing-page-pics")
      .getPublicUrl(filePath);

    if (!publicUrl) {
      console.error("Failed to get public URL");
      setUploadingId(null);
      return;
    }

    const { error: dbError } = await supabase
      .from("marketing")
      .update({ picture: publicUrl })
      .eq("id", id);

    if (dbError) {
      console.error("Failed to update picture in DB:", dbError.message);
    } else {
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, picture: publicUrl } : img))
      );
    }

    setUploadingId(null);
  };

  return (
    <div className="admin-wrapper">
      <Navbar />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <h1>Manage Marketing Pictures</h1>

          <div className="post-grid">
            {images.length === 0 ? (
              <p>No marketing images found.</p>
            ) : (
              images.map((img) => (
                <div className="post-card" key={img.id}>
                  {img.picture && (
                    <img
                      src={img.picture}
                      alt="Marketing"
                      className="marketing-img"
                    />
                  )}
                  <p className="post-date">
                    {new Date(img.created_at).toLocaleString()}
                  </p>
                  <p className="post-placeholder">
                    Placeholder: {img.placeholder || "None"}
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageReplace(e, img.id)}
                    disabled={uploadingId === img.id}
                  />
                  {uploadingId === img.id && <p>Uploading...</p>}

                  <button
                    className="delete-btn"
                    onClick={() => {
                      setImageToDelete(img);
                      setShowConfirm(true);
                    }}
                  >
                    Delete Image
                  </button>
                </div>
              ))
            )}
          </div>

          {showConfirm && (
            <div className="modal-backdrop">
              <div className="modal">
                <h3>Confirm Deletion</h3>
                <p>Are you sure you want to delete this image?</p>
                <div className="modal-buttons">
                  <button className="confirm-btn" onClick={deleteImage}>
                    Yes, Delete
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminManageMarketing;
