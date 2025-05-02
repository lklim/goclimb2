import { useState, useEffect } from "react";
import supabase from "./supabaseClient";
import Navbar from "./components/Navbar";
import "./Activities.css";

// Utility function to parse reset_duration into milliseconds
const parseResetDuration = (duration) => {
  if (!duration) return null; // No reset
  const [value, unit] = duration.split(" ");
  const num = parseInt(value, 10);
  if (isNaN(num)) return null;
  switch (unit.toLowerCase()) {
    case "hour":
    case "hours":
      return num * 60 * 60 * 1000;
    case "day":
    case "days":
      return num * 24 * 60 * 60 * 1000;
    case "week":
    case "weeks":
      return num * 7 * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
};

// Utility function to format milliseconds into "Xh Ym Zs"
const formatTimeRemaining = (ms) => {
  if (ms <= 0) return "Resets now";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `Resets in: ${hours}h ${minutes}m ${seconds}s`;
};

function Activities() {
  const [activities, setActivities] = useState([]);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [userId, setUserId] = useState(null);
  const [progressData, setProgressData] = useState({});
  const [resetTimers, setResetTimers] = useState({});
  const [showPointsMessage, setShowPointsMessage] = useState(null); // { message: string, points: number }

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }
      if (user) {
        setUserId(user.id);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchActivities = async () => {
      // Fetch all activities with point_value
      const { data: allActivities, error: activityError } = await supabase
        .from("activities")
        .select("*, point_value");

      if (activityError) {
        console.error("Error fetching activities:", activityError.message);
        return;
      }

      // Fetch user's completed activities and handle resets
      const { data: userActivities, error: completedError } = await supabase
        .from("user_activities")
        .select("activity_id, completed_at")
        .eq("user_id", userId);

      if (completedError) {
        console.error("Error fetching user activities:", completedError.message);
        return;
      }

      // Handle resets and build timers
      const now = new Date();
      let completedIds = [];
      let timers = {};
      for (const ua of userActivities) {
        const activity = allActivities.find((a) => a.id === ua.activity_id);
        let resetDuration = activity?.reset_duration;

        // Fallback for "Spreading the Love" and "Engaging Commentator"
        if (activity?.activity_name === "Spreading the Love" && !resetDuration) {
          resetDuration = "1 day";
        }
        if (activity?.activity_name === "Engaging Commentator" && !resetDuration) {
          resetDuration = "1 day";
        }

        if (resetDuration && ua.completed_at) {
          const completedAt = new Date(ua.completed_at);
          const resetMs = parseResetDuration(resetDuration);
          if (!resetMs) {
            completedIds.push(ua.activity_id);
            continue; // Invalid duration, treat as completed
          }

          const elapsedMs = now - completedAt;
          if (elapsedMs < resetMs) {
            completedIds.push(ua.activity_id);
            timers[ua.activity_id] = {
              reset_duration: resetDuration,
              completed_at: ua.completed_at,
              remainingMs: resetMs - elapsedMs,
            };
          } else {
            // Reset: Delete outdated user_activities record
            const { error: deleteError } = await supabase
              .from("user_activities")
              .delete()
              .eq("user_id", userId)
              .eq("activity_id", ua.activity_id);
            if (deleteError) {
              console.error("Error resetting activity:", deleteError.message);
            } else {
              console.log(`Reset activity ${ua.activity_id} for user ${userId}`);
            }
          }
        } else {
          completedIds.push(ua.activity_id);
        }
      }

      // Fetch progress for quantifiable activities
      const progress = {};
      for (const activity of allActivities) {
        let requirementType = activity.requirement_type;
        let requirementValue = activity.requirement_value;

        // Fallback for "Spreading the Love"
        if (activity.activity_name === "Spreading the Love" && !requirementType) {
          requirementType = "likes";
          requirementValue = 1;
        }
        // Fallback for "Engaging Commentator"
        if (activity.activity_name === "Engaging Commentator" && !requirementType) {
          requirementType = "comments";
          requirementValue = 1;
        }

        if (requirementType && requirementValue && !completedIds.includes(activity.id)) {
          let count = 0;
          if (requirementType === "likes") {
            const { count: postLikesCount, error: postLikesError } = await supabase
              .from("post_likes")
              .select("*", { count: "exact", head: true })
              .eq("user_id", userId);
            if (postLikesError) {
              console.error("Error fetching post likes count:", postLikesError);
            }

            const { count: climbLogLikesCount, error: climbLogLikesError } = await supabase
              .from("climb_log_likes")
              .select("*", { count: "exact", head: true })
              .eq("user_id", userId);
            if (climbLogLikesError) {
              console.error("Error fetching climb log likes count:", climbLogLikesError);
            }

            count = (postLikesCount || 0) + (climbLogLikesCount || 0);
          } else if (requirementType === "comments") {
            const { count: commentCount, error: commentError } = await supabase
              .from("comments")
              .select("*", { count: "exact", head: true })
              .eq("user_id", userId);
            if (commentError) {
              console.error("Error fetching comment count:", commentError);
            } else {
              count = commentCount;
            }
          }
          progress[activity.id] = {
            current: Math.min(count, requirementValue),
            total: requirementValue,
          };

          // Mark as complete if requirement met
          if (count >= requirementValue && !completedIds.includes(activity.id)) {
            const { error: insertError } = await supabase
              .from("user_activities")
              .insert({
                user_id: userId,
                activity_id: activity.id,
                completed_at: new Date().toISOString(),
              });
            if (insertError) {
              console.error("Error marking activity as complete:", insertError.message);
            } else {
              console.log(`Marked activity ${activity.id} as complete for user ${userId}`);
              completedIds.push(activity.id);
              const resetDuration = activity.reset_duration || (activity.activity_name === "Spreading the Love" || activity.activity_name === "Engaging Commentator" ? "1 day" : null);
              if (resetDuration) {
                const resetMs = parseResetDuration(resetDuration);
                if (resetMs) {
                  timers[activity.id] = {
                    reset_duration: resetDuration,
                    completed_at: new Date().toISOString(),
                    remainingMs: resetMs,
                  };
                }
              }

              // Award points
              const pointValue = activity.point_value || 10; // Default to 10 if not set
              const { data: pointsData, error: pointsError } = await supabase
                .from("points")
                .select("points")
                .eq("user_id", userId)
                .single();
              if (pointsError && pointsError.code !== "PGRST116") {
                console.error("Error fetching points:", pointsError.message);
              } else {
                if (pointsData) {
                  const { error: updateError } = await supabase
                    .from("points")
                    .update({
                      points: pointsData.points + pointValue,
                      updated_at: new Date().toISOString(),
                    })
                    .eq("user_id", userId);
                  if (updateError) {
                    console.error("Error updating points:", updateError.message);
                  } else {
                    console.log(`Added ${pointValue} points for user ${userId}`);
                    setShowPointsMessage({
                      message: `Earned ${pointValue} points!`,
                      points: pointValue,
                    });
                    setTimeout(() => setShowPointsMessage(null), 3000);
                  }
                } else {
                  const { error: insertError } = await supabase
                    .from("points")
                    .insert({
                      user_id: userId,
                      points: pointValue,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    });
                  if (insertError) {
                    console.error("Error inserting points:", insertError.message);
                  } else {
                    console.log(`Added ${pointValue} points for user ${userId}`);
                    setShowPointsMessage({
                      message: `Earned ${pointValue} points!`,
                      points: pointValue,
                    });
                    setTimeout(() => setShowPointsMessage(null), 3000);
                  }
                }
              }
            }
          }
        }
      }

      setCompletedIds(completedIds);
      setResetTimers(timers);
      setProgressData(progress);
      setActivities(allActivities.filter((a) => !completedIds.includes(a.id)));
      setCompletedActivities(allActivities.filter((a) => completedIds.includes(a.id)));
    };

    fetchActivities();
  }, [userId]);

  // Update timers every second and handle resets
  useEffect(() => {
    if (Object.keys(resetTimers).length === 0) return;

    const interval = setInterval(() => {
      setResetTimers((prev) => {
        const now = new Date();
        let updatedTimers = { ...prev };
        let activitiesToReset = [];

        for (const [activityId, timer] of Object.entries(updatedTimers)) {
          const completedAt = new Date(timer.completed_at);
          const resetMs = parseResetDuration(timer.reset_duration);
          if (!resetMs) continue;

          const elapsedMs = now - completedAt;
          const remainingMs = resetMs - elapsedMs;
          if (remainingMs <= 0) {
            activitiesToReset.push(parseInt(activityId, 10));
            delete updatedTimers[activityId];
          } else {
            updatedTimers[activityId] = { ...timer, remainingMs };
          }
        }

        if (activitiesToReset.length > 0) {
          const resetActivities = async () => {
            for (const activityId of activitiesToReset) {
              const { error: deleteError } = await supabase
                .from("user_activities")
                .delete()
                .eq("user_id", userId)
                .eq("activity_id", activityId);
              if (deleteError) {
                console.error(`Error resetting activity ${activityId}:`, deleteError.message);
              } else {
                console.log(`Reset activity ${activityId} for user ${userId}`);
              }
            }

            setCompletedIds((prev) => prev.filter((id) => !activitiesToReset.includes(id)));
            setActivities((prev) => [
              ...prev,
              ...completedActivities.filter((a) => activitiesToReset.includes(a.id)),
            ]);
            setCompletedActivities((prev) => prev.filter((a) => !activitiesToReset.includes(a.id)));
          };

          resetActivities();
        }

        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resetTimers, userId, completedActivities]);

  return (
    <div className="profile-page">
      <Navbar />
      <h2>Activities</h2>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          className="edit-profile-btn"
          style={{
            backgroundColor: activeTab === "available" ? "#00a896" : "#444",
          }}
          onClick={() => setActiveTab("available")}
        >
          Available
        </button>
        <button
          className="edit-profile-btn"
          style={{
            backgroundColor: activeTab === "completed" ? "#00a896" : "#444",
          }}
          onClick={() => setActiveTab("completed")}
        >
          Completed
        </button>
      </div>

      {showPointsMessage && (
        <div className="toast-popup">
          {showPointsMessage.message}
        </div>
      )}

      <div className="activities-section">
        {activeTab === "available" && activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="activity-card">
              <img
                src={activity.activity_picture || "/images/default-activity.png"}
                alt={activity.activity_name}
                className="achievement-image"
              />
              <div className="activity-info">
                <h4>{activity.activity_name}</h4>
                <p>{activity.activity_description}</p>
                <p className="points-info">Points: {activity.point_value || 10}</p>
                {progressData[activity.id] && (
                  <p className="progress-counter">
                    Progress: {progressData[activity.id].current}/{progressData[activity.id].total}{" "}
                    {progressData[activity.id].total === 1
                      ? activity.requirement_type === "likes"
                        ? "like"
                        : "comment"
                      : activity.requirement_type === "likes"
                      ? "likes"
                      : "comments"}
                  </p>
                )}
                <small>Activity ID: {activity.id}</small>
              </div>
            </div>
          ))
        ) : activeTab === "completed" && completedActivities.length > 0 ? (
          completedActivities.map((activity) => (
            <div key={activity.id} className="activity-card">
              <img
                src={activity.activity_picture || "/images/default-activity.png"}
                alt={activity.activity_name}
                className="achievement-image"
              />
              <div className="activity-info">
                <h4>{activity.activity_name}</h4>
                <p>{activity.activity_description}</p>
                <p className="points-info">Points: {activity.point_value || 10}</p>
                {resetTimers[activity.id] ? (
                  <p className="reset-timer">
                    {formatTimeRemaining(resetTimers[activity.id].remainingMs)}
                  </p>
                ) : (
                  <p className="reset-timer">No reset</p>
                )}
                <small>Activity ID: {activity.id}</small>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "white" }}>
            {activeTab === "available" ? "No available activities." : "No completed activities."}
          </p>
        )}
      </div>
    </div>
  );
}

export default Activities;