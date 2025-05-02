import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import Navbar from "../components/Navbar";
import AdminSidebar from "./AdminSidebar";
import "./AdminManageCrags.css";

function AdminManageCrags() {
    const [crags, setCrags] = useState([]);
    const [editingCrags, setEditingCrags] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [showNewForm, setShowNewForm] = useState(false);
    const [newCrag, setNewCrag] = useState({
        name: "",
        description: "",
        difficulty: "",
        latitude: "",
        longitude: "",
        address: "",
        country: "",
        image_url: "",
        ar_url: "",
        user_rating: ""
    });

    useEffect(() => {
        const fetchCrags = async () => {
            const { data, error } = await supabase.from("crags").select("*");
            if (!error) {
                setCrags(data);
                const edits = {};
                data.forEach(c => edits[c.id] = { ...c });
                setEditingCrags(edits);
            } else {
                console.error("Error fetching crags:", error.message);
            }
        };
        fetchCrags();
    }, []);

    const handleEditChange = (id, field, value) => {
        setEditingCrags(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    const handleImageUpload = async (e, id, isNew = false) => {
        const file = e.target.files[0];
        if (!file) return;
        const path = `crags/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("assets").upload(path, file);
        if (error) return console.error("Upload failed:", error.message);

        const { data } = supabase.storage.from("assets").getPublicUrl(path);
        if (isNew) {
            setNewCrag(prev => ({ ...prev, image_url: data.publicUrl }));
        } else {
            setEditingCrags(prev => ({
                ...prev,
                [id]: { ...prev[id], image_url: data.publicUrl }
            }));
        }
    };

    const saveCrag = async (id) => {
        const { error } = await supabase.from("crags").update(editingCrags[id]).eq("id", id);
        if (error) return console.error("Save error:", error.message);
        alert("Crag updated!");
    };

    const deleteCrag = async (id) => {
        if (!window.confirm("Delete this crag?")) return;
        const { error } = await supabase.from("crags").delete().eq("id", id);
        if (!error) setCrags(prev => prev.filter(c => c.id !== id));
    };

    const handleNewCragChange = (field, value) => {
        setNewCrag(prev => ({ ...prev, [field]: value }));
    };

    const submitNewCrag = async () => {
        const { data, error } = await supabase.from("crags").insert([newCrag]);
        if (error) return console.error("Insert error:", error.message);
        alert("New crag added!");
        setCrags(prev => [...prev, ...data]);
        setNewCrag({
            name: "",
            description: "",
            difficulty: "",
            latitude: "",
            longitude: "",
            address: "",
            country: "",
            image_url: "",
            ar_url: "",
            user_rating: ""
        });
        setShowNewForm(false);
    };

    const filteredCrags = crags.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-wrapper">
            <Navbar />
            <div className="admin-layout">
                <AdminSidebar />
                <div className="admin-content">
                    <div className="crag-header">
                        <h1>Manage Crags</h1>
                        <p className="crag-count">Number of Crags: {filteredCrags.length}</p>
                        <div className="crag-header-actions">
                            <input
                                className="crag-search"
                                placeholder="Search crags..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <button className="new-crag-btn" onClick={() => setShowNewForm(p => !p)}>
                                + New Crag
                            </button>
                        </div>
                    </div>

                    {showNewForm && (
                        <div className="crag-grid">
                            <div className="crag-card">
                                <div className="crag-box">
                                    {[
                                        ["Name", "name"],
                                        ["Description", "description", "textarea"],
                                        ["Difficulty", "difficulty"],
                                        ["User Rating", "user_rating"],
                                        ["Address", "address"],
                                        ["Country", "country"],
                                        ["Latitude", "latitude"],
                                        ["Longitude", "longitude"],
                                        ["AR URL", "ar_url"]
                                    ].map(([label, field, type]) => (
                                        <div className="crag-field" key={field}>
                                            <label>{label}:</label>
                                            {type === "textarea" ? (
                                                <textarea
                                                    value={newCrag[field]}
                                                    onChange={e => handleNewCragChange(field, e.target.value)}
                                                    rows={3}
                                                />
                                            ) : (
                                                <input
                                                    type={field === "user_rating" ? "number" : "text"}
                                                    value={newCrag[field]}
                                                    onChange={e => handleNewCragChange(field, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                    <div className="crag-field">
                                        <label>Upload Image:</label>
                                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, null, true)} />
                                    </div>
                                    {newCrag.image_url && (
                                        <img src={newCrag.image_url} alt="Preview" className="crag-thumbnail" />
                                    )}
                                    <div className="crag-buttons">
                                        <button className="save-btn" onClick={submitNewCrag}>Submit</button>
                                        <button className="delete-btn" onClick={() => setShowNewForm(false)}>Cancel</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="crag-grid">
                        {filteredCrags.map((crag) => (
                            <div className="crag-card" key={crag.id}>
                                <div className="crag-box">
                                    {[
                                        ["Name", "name"],
                                        ["Description", "description", "textarea"],
                                        ["Difficulty", "difficulty"],
                                        ["User Rating", "user_rating"],
                                        ["Address", "address"],
                                        ["Country", "country"],
                                        ["Latitude", "latitude"],
                                        ["Longitude", "longitude"],
                                        ["AR URL", "ar_url"]
                                    ].map(([label, field, type]) => (
                                        <div className="crag-field" key={field}>
                                            <label>{label}:</label>
                                            {type === "textarea" ? (
                                                <textarea
                                                    value={editingCrags[crag.id]?.[field] || ""}
                                                    onChange={e => handleEditChange(crag.id, field, e.target.value)}
                                                    rows={3}
                                                />
                                            ) : (
                                                <input
                                                    type={field === "user_rating" ? "number" : "text"}
                                                    value={editingCrags[crag.id]?.[field] || ""}
                                                    onChange={e => handleEditChange(crag.id, field, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                    <div className="crag-field">
                                        <label>Upload New Image:</label>
                                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, crag.id)} />
                                    </div>
                                    {editingCrags[crag.id]?.image_url && (
                                        <img src={editingCrags[crag.id].image_url} alt={crag.name} className="crag-thumbnail" />
                                    )}
                                    <div className="crag-buttons">
                                        <button className="save-btn" onClick={() => saveCrag(crag.id)}>Save</button>
                                        <button className="delete-btn" onClick={() => deleteCrag(crag.id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminManageCrags;
