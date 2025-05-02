import { useState, useEffect } from "react";
import supabase from "./supabaseClient";
import "./Profile.css";
import Navbar from "./components/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "./components/HeartButton.css";


function Profile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [climbLogs, setClimbLogs] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [climbLogComments, setClimbLogComments] = useState({});
  const [newClimbLogComment, setNewClimbLogComment] = useState({});
  const [expandedClimbLogComments, setExpandedClimbLogComments] = useState({});
  const [activeTab, setActiveTab] = useState("posts");
  const [likedPosts, setLikedPosts] = useState({});
  const [likedClimbLogs, setLikedClimbLogs] = useState({});
  const [postLikes, setPostLikes] = useState([]);
  const [climbLogLikes, setClimbLogLikes] = useState([]); 



  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(profileData);

      const { data: postData } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setPosts(postData || []);

      const { data: climbData } = await supabase
        .from("climb_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setClimbLogs(climbData || []);

      const { data: postLikesData } = await supabase.from("post_likes").select("*");
      setPostLikes(postLikesData || []);

      if (user) {
        // Fetch liked posts
        const { data: likedPostData } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", user.id);
        const likedPostIds = likedPostData.map(item => item.post_id);
        const likedPostState = {};
        likedPostIds.forEach(postId => {
          likedPostState[postId] = true;
        });
        setLikedPosts(likedPostState);

        // Fetch liked climb logs
        const { data: likedClimbLogData } = await supabase
          .from("climb_log_likes")
          .select("climb_log_id")
          .eq("user_id", user.id);
        const likedClimbLogIds = likedClimbLogData.map(item => item.climb_log_id);
        const likedClimbLogState = {};
        likedClimbLogIds.forEach(climbLogId => {
          likedClimbLogState[climbLogId] = true;
        });
        setLikedClimbLogs(likedClimbLogState);
      }

      // Fetch all climb log likes
      const { data: climbLogLikesData, error: climbLogLikesError } = await supabase
      .from("climb_log_likes")
      .select("*");

      if (climbLogLikesError) {
      console.error("Error fetching climb log likes:", climbLogLikesError);
      } else {
      setClimbLogLikes(climbLogLikesData || []);
      }


      const fetchComments = async (posts) => {
        const postIds = posts.map(post => post.id);
        const { data: commentData } = await supabase
          .from("comments")
          .select(`
            id, post_id, user_id, content, created_at,
            profiles ( username )
          `)
          .in("post_id", postIds)
          .order("created_at", { ascending: true });

        const grouped = {};
        commentData?.forEach(comment => {
          if (!grouped[comment.post_id]) grouped[comment.post_id] = [];
          grouped[comment.post_id].push(comment);
        });
        setComments(grouped);
      };

      const fetchClimbLogComments = async (climbLogs) => {
        const climbLogIds = climbLogs.map(log => log.id);
        const { data: commentData } = await supabase
          .from("climb_log_comments")
          .select(`
            id, climb_log_id, user_id, content, created_at,
            profiles ( username )
          `)
          .in("climb_log_id", climbLogIds)
          .order("created_at", { ascending: true });

        const grouped = {};
        commentData?.forEach(comment => {
          if (!grouped[comment.climb_log_id]) grouped[comment.climb_log_id] = [];
          grouped[comment.climb_log_id].push(comment);
        });
        setClimbLogComments(grouped);
      };

      fetchComments(postData || []);
      fetchClimbLogComments(climbData || []);

      const { data: achievementData } = await supabase
        .from("user_achievement")
        .select(`
          id,
          created_at,
          achievements (
            id,
            achievement_name,
            description,
            achievement_picture
          ),
          show_table
        `)
        .eq("user_id", userId);
      setAchievements(achievementData.filter(a => a.show_table) || []);

      const { data: activitiesData } = await supabase
        .from("user_activities")
        .select(`
          id,
          created_at,
          activities (
            id,
            activity_name,
            activity_description
          ),
          show_table
        `)
        .eq("user_id", userId);
      setActivities(activitiesData.filter(a => a.show_table) || []);

      const { data: followersData } = await supabase
        .from("follows")
        .select(`
          follower_id,
          profiles:follower_id (username, id)
        `)
        .eq("followed_id", userId);
      setFollowers(followersData.map(f => f.profiles) || []);

      const { data: followingData } = await supabase
        .from("follows")
        .select(`
          followed_id,
          profiles:followed_id (username, id)
        `)
        .eq("follower_id", userId);
      setFollowing(followingData.map(f => f.profiles) || []);
    };

    fetchProfile();
  }, [userId]);

  const handleCommentChange = (postId, value) => {
    setNewComment(prev => ({ ...prev, [postId]: value }));
  };

  const handleClimbLogCommentChange = (climbLogId, value) => {
    setNewClimbLogComment(prev => ({ ...prev, [climbLogId]: value }));
  };

  const handlePostComment = async (postId) => {
    if (!newComment[postId]?.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("comments").insert([{
      post_id: postId,
      user_id: user.id,
      content: newComment[postId],
    }]);

    if (!error) {
      const { data: updatedComments } = await supabase
        .from("comments")
        .select(`id, post_id, user_id, content, created_at, profiles (username)`)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      setComments(prev => ({
        ...prev,
        [postId]: updatedComments
      }));
      setNewComment(prev => ({ ...prev, [postId]: "" }));
    }
  };

  const handlePostClimbLogComment = async (climbLogId) => {
    if (!newClimbLogComment[climbLogId]?.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("climb_log_comments").insert([{
      climb_log_id: climbLogId,
      user_id: user.id,
      content: newClimbLogComment[climbLogId],
    }]);

    if (!error) {
      const { data: updatedComments } = await supabase
        .from("climb_log_comments")
        .select(`id, climb_log_id, user_id, content, created_at, profiles (username)`)
        .eq("climb_log_id", climbLogId)
        .order("created_at", { ascending: true });

      setClimbLogComments(prev => ({
        ...prev,
        [climbLogId]: updatedComments
      }));
      setNewClimbLogComment(prev => ({ ...prev, [climbLogId]: "" }));
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (!error) {
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].filter(comment => comment.id !== commentId)
      }));
    }
  };

  const handleDeleteClimbLogComment = async (commentId, climbLogId) => {
    const { error } = await supabase
      .from("climb_log_comments")
      .delete()
      .eq("id", commentId);

    if (!error) {
      setClimbLogComments(prev => ({
        ...prev,
        [climbLogId]: prev[climbLogId].filter(comment => comment.id !== commentId)
      }));
    }
  };

  const handleDeletePost = async (postId) => {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (!error) {
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } else {
      console.error("Error deleting post:", error);
    }
  };

  const handleLikeToggle = async (postId) => {
    const hasLiked = likedPosts[postId];
  
    if (hasLiked) {
      await supabase
        .from("post_likes")
        .delete()
        .match({ post_id: postId, user_id: currentUser.id });
    } else {
      await supabase
        .from("post_likes")
        .insert([{ post_id: postId, user_id: currentUser.id }]);
    }
  
    // After toggling, re-fetch postLikes
    const { data: updatedPostLikes, error } = await supabase
      .from("post_likes")
      .select("*");
  
    if (error) {
      console.error("Error fetching updated likes:", error);
      return;
    }
  
    setPostLikes(updatedPostLikes);
  
    setLikedPosts(prev => ({ ...prev, [postId]: !hasLiked }));
  };
  
  

  const handleClimbLogLikeToggle = async (climbLogId) => {
    const hasLiked = likedClimbLogs[climbLogId];
    console.log(`Toggling like for climb log ${climbLogId}, hasLiked: ${hasLiked}`); // Debug log
  
    if (hasLiked) {
      const { error } = await supabase
        .from("climb_log_likes")
        .delete()
        .match({ climb_log_id: climbLogId, user_id: currentUser.id });
      if (error) {
        console.error("Error unliking climb log:", error);
        return;
      }
      setClimbLogLikes((prev) =>
        prev.filter((like) => !(like.climb_log_id === climbLogId && like.user_id === currentUser.id))
      );
    } else {
      const { error, data } = await supabase
        .from("climb_log_likes")
        .insert([{ climb_log_id: climbLogId, user_id: currentUser.id }])
        .select()
        .single();
      if (error) {
        console.error("Error liking climb log:", error);
        return;
      }
      setClimbLogLikes((prev) => [...prev, data]);
    }
  
    setLikedClimbLogs((prev) => ({ ...prev, [climbLogId]: !hasLiked }));
  };
  

  if (!profile) {
    return (
      <div className="profile-page">
        <Navbar />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      <div className="cover-photo">
        <div className="profile-header">
          {profile.profile_picture ? (
            <img src={profile.profile_picture} alt="Profile" className="profile-avatar" />
          ) : (
            <div className="profile-avatar" style={{ backgroundColor: "#aaa" }}>No Image</div>
          )}
          <div className="profile-info">
            <h2>{profile.username || "Unnamed"}</h2>
            <p>Date Of Birth: {profile.date_of_birth || "Not set"}</p>
            {currentUser?.id === userId && (
              <button className="edit-profile-btn" onClick={() => navigate("/editprofile")}>Edit Profile</button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="left-column">
          <h3>Achievements</h3>
          {achievements.length > 0 ? achievements.map(({ id, achievements: ach, created_at }) => (
            <div key={id} className="achievement-card">
              <img src={ach.achievement_picture || "placeholder.jpg"} alt={ach.achievement_name} className="achievement-image" />
              <div>
                <h4>{ach.achievement_name}</h4>
                <p>{ach.description}</p>
                <small>Earned On: {new Date(created_at).toLocaleDateString()}</small>
              </div>
            </div>
          )) : <p>No achievements yet.</p>}

          <h3>Activities</h3>
          {activities.length > 0 ? activities.map(({ id, activities: act, created_at }) => (
            <div key={id} className="activity-card">
              <div>
                <h4>{act.activity_name}</h4>
                <p>{act.activity_description}</p>
                <small>Completed On: {new Date(created_at).toLocaleDateString()}</small>
              </div>
            </div>
          )) : <p>No activities yet.</p>}

          <h3>Followers</h3>
          {followers.length > 0 ? (
            <ul>
              {followers.map(follower => (
                <li key={follower.id}>
                  <a href={`/profile/${follower.id}`}>{follower.username}</a>
                </li>
              ))}
            </ul>
          ) : <p>No followers yet.</p>}

          <h3>Following</h3>
          {following.length > 0 ? (
            <ul>
              {following.map(followed => (
                <li key={followed.id}>
                  <a href={`/profile/${followed.id}`}>{followed.username}</a>
                </li>
              ))}
            </ul>
          ) : <p>Not following anyone yet.</p>}
        </div>

        <div className="right-column">
          <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
            <button onClick={() => setActiveTab("posts")} className={activeTab === "posts" ? "tab-button active" : "tab-button"}>Posts</button>
            <button onClick={() => setActiveTab("logs")} className={activeTab === "logs" ? "tab-button active" : "tab-button"}>Climb Logs</button>
          </div>

          {activeTab === "posts" ? (
            <>
              <h3>Posts</h3>
              {posts.map((post) => (
                <div key={post.id} className="post">
                  <img src={post.image_url} alt="Post" className="post-image" />
                  <div className="caption-box">
                    <p className="caption">{post.caption}</p>
                  </div>
                  <div className="actions">
                  <button
                    onClick={() => handleLikeToggle(post.id)}
                    className="heart-button"
                  >
                    {likedPosts[post.id] ? <FaHeart color="white" /> : <FaRegHeart color="gray" />}
                    <span>({postLikes.filter(like => like.post_id === post.id).length})</span>
                  </button>

                    {currentUser?.id === post.user_id && (
                      <button className="delete-button" onClick={() => handleDeletePost(post.id)}>Delete</button>
                    )}
                  </div>
                  <div className="comments-section">
                    <h4>Comments</h4>
                    {comments[post.id]?.length > 0 ? (
                      <>
                        {(expandedComments[post.id] ? comments[post.id] : comments[post.id].slice(0, 3)).map(comment => (
                          <div key={comment.id} className="comment">
                            <div className="comment-content">
                              <strong>{comment.profiles?.username || "Unknown User"}:</strong> {comment.content}
                            </div>
                            {comment.user_id === currentUser?.id && (
                              <button className="comment-delete-icon" onClick={() => handleDeleteComment(comment.id, post.id)}>✕</button>
                            )}
                          </div>
                        ))}
                        {comments[post.id].length > 3 && (
                          <button className="view-more-btn" onClick={() =>
                            setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))
                          }>
                            {expandedComments[post.id] ? "View Less" : "View More"}
                          </button>
                        )}
                      </>
                    ) : <p className="comment">No comments yet.</p>}
                    <div className="comment-input-group">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment[post.id] || ""}
                        onChange={(e) => handleCommentChange(post.id, e.target.value)}
                      />
                      <button onClick={() => handlePostComment(post.id)}>Comment</button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <h3>Climb Logs</h3>
              {climbLogs.length === 0 ? (
                <p className="caption">No climbs clocked yet.</p>
              ) : (
                climbLogs.map(log => (
                  <div key={log.id} className="post">
                    {log.photo_url && (
                      <img src={log.photo_url} alt="Climb" className="post-image" />
                    )}
                    <div className="caption-box">
                      <p className="caption"><strong>Crag ID:</strong> {log.crag_id}</p>
                      <p className="caption"><strong>Attempt Type:</strong> {log.attempt_type}</p>
                      <p className="caption"><strong>Notes:</strong> {log.notes || "No notes provided."}</p>
                      <p className="caption"><strong>Date:</strong> {new Date(log.created_at).toLocaleString()}</p>
                    </div>
                    <div className="actions">
                    <button
                      onClick={() => handleClimbLogLikeToggle(log.id)}
                      className="heart-button"
                    >
                      {likedClimbLogs[log.id] ? <FaHeart color="white" /> : <FaRegHeart color="gray" />}
                      <span>({climbLogLikes.filter((like) => like.climb_log_id === log.id).length})</span>
                    </button>

                    </div>
                    <div className="comments-section">
                      <h4>Comments</h4>
                      {climbLogComments[log.id]?.length > 0 ? (
                        <>
                          {(expandedClimbLogComments[log.id] ? climbLogComments[log.id] : climbLogComments[log.id].slice(0, 3)).map(comment => (
                            <div key={comment.id} className="comment">
                              <div className="comment-content">
                                <strong>{comment.profiles?.username || "Unknown User"}:</strong> {comment.content}
                              </div>
                              {comment.user_id === currentUser?.id && (
                                <button className="comment-delete-icon" onClick={() => handleDeleteClimbLogComment(comment.id, log.id)}>✕</button>
                              )}
                            </div>
                          ))}
                          {climbLogComments[log.id].length > 3 && (
                            <button className="view-more-btn" onClick={() =>
                              setExpandedClimbLogComments(prev => ({ ...prev, [log.id]: !prev[log.id] }))
                            }>
                              {expandedClimbLogComments[log.id] ? "View Less" : "View More"}
                            </button>
                          )}
                        </>
                      ) : <p className="comment">No comments yet.</p>}
                      <div className="comment-input-group">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={newClimbLogComment[log.id] || ""}
                          onChange={(e) => handleClimbLogCommentChange(log.id, e.target.value)}
                        />
                        <button onClick={() => handlePostClimbLogComment(log.id)}>Comment</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;