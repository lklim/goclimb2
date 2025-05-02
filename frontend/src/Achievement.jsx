import { useState, useEffect } from "react";
import supabase from "./supabaseClient";
import Navbar from "./components/Navbar";
import "./Achievement.css";

function Achievement() {
    const [achievements, setAchievements] = useState([]);
    const [completedIds, setCompletedIds] = useState([]);
    const [selectedTab, setSelectedTab] = useState("incomplete");
    const [userId, setUserId] = useState(null);
    const [progressData, setProgressData] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            // Fetch authenticated user
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) {
                console.error("Error fetching user:", userError.message);
                return;
            }

            const user_id = userData.user.id;
            setUserId(user_id);

            // Fetch all achievements
            const { data: allAchievements, error: achievementError } = await supabase
                .from("achievements")
                .select("*");

            // Fetch user's completed achievements
            const { data: userAchievements, error: userAchievementsError } = await supabase
                .from("user_achievement")
                .select("achievement_id")
                .eq("user_id", user_id);

            if (achievementError || userAchievementsError) {
                console.error("Error fetching data:", achievementError || userAchievementsError);
                return;
            }

            setAchievements(allAchievements || []);
            let completed = userAchievements.map((ua) => ua.achievement_id) || [];
            setCompletedIds(completed);

            // Fetch progress for quantifiable achievements and mark completed
            const progress = {};
            for (const achievement of allAchievements) {
                let requirementType = achievement.requirement_type;
                let requirementValue = achievement.requirement_value;

                // Fallback for "Keeping Us Updated"
                if (achievement.achievement_name === "Keeping Us Updated" && !requirementType) {
                    requirementType = "posts";
                    requirementValue = 10;
                }
                // Fallback for "Climb Logger"
                if (achievement.achievement_name === "Climb Logger" && !requirementType) {
                    requirementType = "climb_logs";
                    requirementValue = 5;
                }

                if (requirementType && requirementValue) {
                    let count = 0;
                    if (requirementType === "posts") {
                        const { count: postCount, error: postError } = await supabase
                            .from("posts")
                            .select("*", { count: "exact", head: true })
                            .eq("user_id", user_id);
                        if (postError) {
                            console.error("Error fetching post count:", postError);
                        } else {
                            count = postCount;
                        }
                    } else if (requirementType === "climb_logs") {
                        const { count: climbLogCount, error: climbLogError } = await supabase
                            .from("climb_logs")
                            .select("*", { count: "exact", head: true })
                            .eq("user_id", user_id);
                        if (climbLogError) {
                            console.error("Error fetching climb log count:", climbLogError);
                        } else {
                            count = climbLogCount;
                        }
                    }
                    progress[achievement.id] = {
                        current: Math.min(count, requirementValue), // Cap at requirement
                        total: requirementValue,
                    };

                    // Check if achievement is complete but not yet marked
                    if (count >= requirementValue && !completed.includes(achievement.id)) {
                        const { error: insertError } = await supabase
                            .from("user_achievement")
                            .insert({ user_id, achievement_id: achievement.id });
                        if (insertError) {
                            console.error("Error marking achievement as complete:", insertError);
                        } else {
                            console.log(`Marked achievement ${achievement.id} as complete for user ${user_id}`);
                            completed = [...completed, achievement.id];
                            setCompletedIds(completed);
                        }
                    }
                }
            }
            setProgressData(progress);
        };

        fetchData();
    }, []);

    const filteredAchievements =
        selectedTab === "completed"
            ? achievements.filter((a) => completedIds.includes(a.id))
            : achievements.filter((a) => !completedIds.includes(a.id));

    return (
        <div className="profile-page">
            <Navbar />
            <h2>Achievements</h2>

            <div className="tabs">
                <button
                    className={selectedTab === "incomplete" ? "tab active" : "tab"}
                    onClick={() => setSelectedTab("incomplete")}
                >
                    Incomplete
                </button>
                <button
                    className={selectedTab === "completed" ? "tab active" : "tab"}
                    onClick={() => setSelectedTab("completed")}
                >
                    Completed
                </button>
            </div>

            <div className="achievement-section">
                {filteredAchievements.length > 0 ? (
                    filteredAchievements.map((achievement) => {
                        const progress = progressData[achievement.id];
                        const isIncomplete = !completedIds.includes(achievement.id);

                        return (
                            <div key={achievement.id} className="achievement-card">
                                <img
                                    src={achievement.achievement_picture || "/images/default-achievement.png"}
                                    alt={achievement.achievement_name}
                                    className="achievement-image"
                                />
                                <div className="achievement-info">
                                    <h4>{achievement.achievement_name}</h4>
                                    <p>{achievement.description}</p>
                                    {isIncomplete && progress && (
                                        <p className="progress-counter">
                                            Progress: {progress.current}/{progress.total}
                                        </p>
                                    )}
                                    <small>Achievement ID: {achievement.id}</small>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p>No achievements to show in this tab.</p>
                )}
            </div>
        </div>
    );
}

export default Achievement;