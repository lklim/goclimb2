import { useState, useEffect } from "react";
import supabase from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import "./editProfile.css";
import Navbar from "./components/Navbar";

function EditProfile() {
    const [username, setUsername] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [activities, setActivities] = useState([]);
    const [selectedAchievement1, setSelectedAchievement1] = useState("");
    const [selectedAchievement2, setSelectedAchievement2] = useState("");
    const [selectedAchievement3, setSelectedAchievement3] = useState("");
    const [selectedAchievement4, setSelectedAchievement4] = useState("");
    const [selectedActivity1, setSelectedActivity1] = useState("");
    const [selectedActivity2, setSelectedActivity2] = useState("");
    const [selectedActivity3, setSelectedActivity3] = useState("");
    const [selectedActivity4, setSelectedActivity4] = useState("");
    const [fullName, setFullName] = useState("");
    const [showRemoveModal, setShowRemoveModal] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("email", user.email)
                .single();

            if (data) {
                setUsername(data.username || "");
                setDateOfBirth(data.date_of_birth || "");
                setFullName(data.full_name || "");
            }

            const { data: achievementData } = await supabase
                .from("user_achievement")
                .select("id, achievements(id, achievement_name), show_table")
                .eq("user_id", user.id);

            const { data: activitiesData } = await supabase
                .from("user_activities")
                .select("id, activities(id, activity_name), show_table")
                .eq("user_id", user.id);

            setAchievements(achievementData || []);
            setActivities(activitiesData || []);

            const showcasedAchievements = (achievementData || []).filter(a => a.show_table);
            setSelectedAchievement1(showcasedAchievements[0]?.id || "");
            setSelectedAchievement2(showcasedAchievements[1]?.id || "");
            setSelectedAchievement3(showcasedAchievements[2]?.id || "");
            setSelectedAchievement4(showcasedAchievements[3]?.id || "");

            const showcasedActivities = (activitiesData || []).filter(a => a.show_table);
            setSelectedActivity1(showcasedActivities[0]?.id || "");
            setSelectedActivity2(showcasedActivities[1]?.id || "");
            setSelectedActivity3(showcasedActivities[2]?.id || "");
            setSelectedActivity4(showcasedActivities[3]?.id || "");
        };

        fetchProfile();
    }, []);

    const defaultImageUrl = "https://mtkfbnzhyfyomshvzpeb.supabase.co/storage/v1/object/public/profile-pictures//default.jpg";

    const removeProfilePicture = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const fileNamePrefix = `${user.id}`;

    // Get list of files to find the one with matching prefix
    const { data: files, error: listError } = await supabase
    .storage
    .from("profile-pictures")
    .list("", { limit: 100 });

    if (listError) {
        console.error("Failed to list files:", listError.message);
        return;
    }

    const fileToRemove = files.find(file => file.name.startsWith(fileNamePrefix));
    if (fileToRemove) {
        const { error: deleteError } = await supabase
            .storage
            .from("profile-pictures")
            .remove([fileToRemove.name]);

        if (deleteError) {
            console.error("Failed to remove profile picture:", deleteError.message);
            return;
        }
    }

    // Update DB to remove profile_picture reference
    await supabase
        .from("profiles")
        .update({ profile_picture: defaultImageUrl})
        .eq("email", user.email);

        setProfilePicture(null);
        setShowRemoveModal(false);
        alert("Profile picture removed.");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { data: { user } } = await supabase.auth.getUser();

        let imageUrl = null;
        if (profilePicture) {
            const fileExt = profilePicture.name.split(".").pop();
            const fileName = `${user.id}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("profile-pictures")
                .upload(filePath, profilePicture, {
                    upsert: true,
                    contentType: profilePicture.type,
                    cacheControl: "3600"
                });

            if (uploadError) {
                console.error("Upload failed:", uploadError.message);
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from("profile-pictures")
                .getPublicUrl(filePath);

            imageUrl = publicUrlData.publicUrl;
        }

        await supabase
            .from("profiles")
            .update({
                username,
                full_name: fullName,
                date_of_birth: dateOfBirth,
                profile_picture: imageUrl || undefined,
            })
            .eq("email", user.email);

        // Reset all to false first
        await supabase
            .from("user_achievement")
            .update({ show_table: false })
            .eq("user_id", user.id);

        await supabase
            .from("user_activities")
            .update({ show_table: false })
            .eq("user_id", user.id);

        // Set selected achievements to true
        const achievementIdsToShow = [
            selectedAchievement1,
            selectedAchievement2,
            selectedAchievement3,
            selectedAchievement4,
        ].filter(Boolean);

        for (const id of achievementIdsToShow) {
            await supabase
                .from("user_achievement")
                .update({ show_table: true })
                .eq("id", id);
        }

        // Set selected activities to true
        const activityIdsToShow = [
            selectedActivity1,
            selectedActivity2,
            selectedActivity3,
            selectedActivity4,
        ].filter(Boolean);

        for (const id of activityIdsToShow) {
            await supabase
                .from("user_activities")
                .update({ show_table: true })
                .eq("id", id);
        }

        navigate(`/profile/${user.id}`);
    };

    return (
        <div className="edit-profile-page">
            <Navbar />
            <div className="edit-form-container">
                <h2>Edit Profile</h2>
                <form onSubmit={handleSubmit} className="edit-profile-form">
                    <h3>
                        Username:
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </h3>
                    <h3>
                        Full Name:
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </h3>
                    <h3>
                        Date of Birth:
                        <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            required
                        />
                    </h3>
                    <h3>
                        Profile Picture:
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProfilePicture(e.target.files[0])}
                        />
                        <button
                            type="button"
                            className="remove-picture-btn"
                            onClick={() => setShowRemoveModal(true)}
                            >
                            Remove Profile Picture
                        </button>
                    </h3>

                    <h3>Showcase Achievements:</h3>
                    {[1, 2, 3, 4].map((index) => (
                        <h4 key={`achievement${index}`}>
                            {index} Achievement:
                            <select
                                value={eval(`selectedAchievement${index}`)}
                                onChange={(e) => eval(`setSelectedAchievement${index}`)(e.target.value)}
                            >
                                <option value="">-- None --</option>
                                {achievements.map(({ id, achievements }) => (
                                    <option key={id} value={id}>{achievements.achievement_name}</option>
                                ))}
                            </select>
                        </h4>
                    ))}

                    <h3>Showcase Activities:</h3>
                    {[1, 2, 3, 4].map((index) => (
                        <h4 key={`activity${index}`}>
                            {index} Activity:
                            <select
                                value={eval(`selectedActivity${index}`)}
                                onChange={(e) => eval(`setSelectedActivity${index}`)(e.target.value)}
                            >
                                <option value="">-- None --</option>
                                {activities.map(({ id, activities }) => (
                                    <option key={id} value={id}>{activities.activity_name}</option>
                                ))}
                            </select>
                        </h4>
                    ))}

                    <button type="submit">Save Changes</button>
                </form>
                {showRemoveModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                        <p>Are you sure you want to remove your profile picture?</p>
                        <div className="modal-buttons">
                            <button className="confirm-btn" onClick={removeProfilePicture}>Yes</button>
                            <button className="cancel-btn" onClick={() => setShowRemoveModal(false)}>No</button>
                        </div>
                        </div>
                    </div>
                    )}
            </div>
        </div>
    );
}

export default EditProfile;
