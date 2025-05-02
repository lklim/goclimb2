import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import Navbar from "../components/Navbar";
import AdminSidebar from "./AdminSidebar";
import "./AdminFeedback.css";

function AdminFeedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [sortOption, setSortOption] = useState("desc");
    const [subjectFilter, setSubjectFilter] = useState("All");
    const [openDropdown, setOpenDropdown] = useState(null);

    // Counts for all feedbacks (not filtered)
    const [feedbackCount, setFeedbackCount] = useState(0);
    const [bugCount, setBugCount] = useState(0);
    const [featureCount, setFeatureCount] = useState(0);
    const [generalCount, setGeneralCount] = useState(0);

    // ✅ This fetch is for FILTERED DISPLAY ONLY
    useEffect(() => {
        const fetchFeedbacks = async () => {
            let query = supabase
                .from("feedback")
                .select("*")
                .order("created_at", { ascending: sortOption === "asc" });

            if (subjectFilter !== "All") {
                query = query.eq("subject", subjectFilter);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching feedback:", error.message);
            } else {
                setFeedbacks(data);
            }
        };

        fetchFeedbacks();
    }, [sortOption, subjectFilter]);

    // ✅ This fetch is for TOTAL COUNTS ONLY
    useEffect(() => {
        const fetchAllCounts = async () => {
            const { data, error } = await supabase.from("feedback").select("*");

            if (!error && data) {
                setFeedbackCount(data.length);
                setBugCount(data.filter(item => item.subject === "Bug Report").length);
                setFeatureCount(data.filter(item => item.subject === "Feature Request").length);
                setGeneralCount(data.filter(item => item.subject === "General Feedback").length);
            } else {
                console.error("Error fetching total feedback counts:", error?.message);
            }
        };

        fetchAllCounts();
    }, []);

    const handleSort = (value) => {
        setSortOption(value);
        setOpenDropdown(null);
    };

    const handleFilter = (value) => {
        setSubjectFilter(value);
        setOpenDropdown(null);
    };

    const handleDiscard = async (id) => {
        const { error } = await supabase
            .from("feedback")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Failed to discard feedback:", error.message);
        } else {
            setFeedbacks(prev => prev.filter(fb => fb.id !== id));
            // Re-fetch total counts after deletion
            const { data } = await supabase.from("feedback").select("*");
            setFeedbackCount(data.length);
            setBugCount(data.filter(item => item.subject === "Bug Report").length);
            setFeatureCount(data.filter(item => item.subject === "Feature Request").length);
            setGeneralCount(data.filter(item => item.subject === "General Feedback").length);
        }
    };

    return (
        <div className="admin-wrapper">
            <Navbar />
            <div className="admin-layout">
                <AdminSidebar />
                <div className="admin-content">
                    <h1>User Feedback</h1>

                    <div className="feedback-summary">
                        <p><strong>Total Feedback:</strong> {feedbackCount}</p>
                        <p><strong>Bug Reports:</strong> {bugCount}</p>
                        <p><strong>Feature Requests:</strong> {featureCount}</p>
                        <p><strong>General Feedback:</strong> {generalCount}</p>
                    </div>

                    <div className="toolbar">
                        {/* Sort Dropdown */}
                        <div className="dropdown-group">
                            <label className="dropdown-label">Sort by:</label>
                            <button
                                className="dropdown-button"
                                onClick={() =>
                                    setOpenDropdown(openDropdown === "sort" ? null : "sort")
                                }
                            >
                                {sortOption === "desc" ? "Most Recent" : "Oldest"} ▾
                            </button>

                            {openDropdown === "sort" && (
                                <div className="dropdown-menu">
                                    <button onClick={() => handleSort("desc")}>Most Recent</button>
                                    <button onClick={() => handleSort("asc")}>Oldest</button>
                                </div>
                            )}
                        </div>

                        {/* Filter Dropdown */}
                        <div className="dropdown-group">
                            <label className="dropdown-label">Filter by subject:</label>
                            <button
                                className="dropdown-button"
                                onClick={() =>
                                    setOpenDropdown(openDropdown === "filter" ? null : "filter")
                                }
                            >
                                {subjectFilter} ▾
                            </button>

                            {openDropdown === "filter" && (
                                <div className="dropdown-menu">
                                    {["All", "Bug Report", "Feature Request", "General Feedback"].map((item) => (
                                        <button key={item} onClick={() => handleFilter(item)}>{item}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="feedback-list">
                        {feedbacks.map((item) => (
                            <div key={item.id} className="feedback-card">
                                <p><strong className="label-subject">Subject:</strong> {item.subject}</p>
                                <p><strong className="label-comment">Comment:</strong> {item.comments}</p>
                                <p className="feedback-date">{new Date(item.created_at).toLocaleString()}</p>
                                <button
                                    className="discard-button"
                                    onClick={() => handleDiscard(item.id)}
                                >
                                    Discard
                                </button>
                            </div>
                        ))}
                        {feedbacks.length === 0 && <p>No feedback yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminFeedback;
