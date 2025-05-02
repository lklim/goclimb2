import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "./supabaseClient";
import Navbar from "./components/Navbar";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "./components/HeartButton.css";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newComment, setNewComment] = useState({});
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [sortOption, setSortOption] = useState("recent");
  const [follows, setFollows] = useState([]);
  const [filter, setFilter] = useState("All");
  const [postLikes, setPostLikes] = useState([]);
  const [climbLogs, setClimbLogs] = useState([]);
  const [climbLogLikes, setClimbLogLikes] = useState([]);
  const [climbLogComments, setClimbLogComments] = useState({});
  const [newClimbLogComment, setNewClimbLogComment] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [expandedClimbLogComments, setExpandedClimbLogComments] = useState({});
  const [tab, setTab] = useState("Community");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [profiles, setProfiles] = useState([]);

  const fetchPostLikes = async () => {
    try {
      const { data, error } = await supabase.from("post_likes").select("*");
      if (error) {
        console.error("Error fetching post likes:", error);
        return [];
      }
      console.log("Fetched post likes:", data);
      return data || [];
    } catch (err) {
      console.error("Unexpected error fetching post likes:", err);
      return [];
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, profile_picture");
      if (error) {
        console.error("Error fetching profiles:", error);
        return [];
      }
      console.log("Fetched profiles:", data);
      return data || [];
    } catch (err) {
      console.error("Unexpected error fetching profiles:", err);
      return [];
    }
  };

  const fetchPosts = async (fetchForFollowing = false, likesData) => {
    try {
      let query = supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (username, profile_picture),
          comments:comments (
            content,
            user_id,
            profiles:user_id (username)
          )
        `)
        .order("created_at", { ascending: false });

      if (fetchForFollowing && currentUser) {
        const followedIds = follows.map((f) => f.followed_id);
        followedIds.push(currentUser.id);
        query = query.in("user_id", followedIds.length ? followedIds : [currentUser.id]);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
        return;
      }

      const updatedPosts = (data || []).map((post) => {
        const isFollowing = follows.some((f) => f.followed_id === post.user_id);
        const likeCount = likesData.filter((like) => like.post_id === post.id).length;
        console.log(
          `Post ID: ${post.id}, User ID: ${post.user_id}, isFollowing: ${isFollowing}, Likes: ${likeCount}, Comments: ${post.comments?.length || 0}`
        );
        return {
          ...post,
          comments: post.comments || [],
          isFollowing,
          likes: likeCount,
        };
      });

      setPosts(updatedPosts);
    } catch (err) {
      console.error("Unexpected error fetching posts:", err);
      setPosts([]);
    }
  };

  const fetchClimbLogs = async (fetchForFollowing = false) => {
    try {
      let query = supabase
        .from("climb_logs")
        .select("*, profiles(username, profile_picture)")
        .order("created_at", { ascending: false });

      if (fetchForFollowing && currentUser) {
        const followedIds = follows.map((f) => f.followed_id);
        followedIds.push(currentUser.id);
        query = query.in("user_id", followedIds.length ? followedIds : [currentUser.id]);
      }

      const { data: logs, error: logsError } = await query;

      if (logsError) {
        console.error("Error fetching climb logs:", logsError);
        setClimbLogs([]);
        return;
      }

      const { data: likes, error: likesError } = await supabase
        .from("climb_log_likes")
        .select("*");

      if (likesError) {
        console.error("Error fetching climb log likes:", likesError);
        setClimbLogLikes([]);
        return;
      }

      const { data: commentsData, error: commentsError } = await supabase
        .from("climb_log_comments")
        .select("*, profiles(username)")
        .order("created_at", { ascending: true });

      if (commentsError) {
        console.error("Error fetching climb log comments:", commentsError);
        setClimbLogComments({});
        return;
      }

      const groupedComments = {};
      commentsData?.forEach((comment) => {
        if (!groupedComments[comment.climb_log_id]) {
          groupedComments[comment.climb_log_id] = [];
        }
        groupedComments[comment.climb_log_id].push(comment);
      });

      const updatedLogs = (logs || []).map((log) => {
        const isFollowing = follows.some((f) => f.followed_id === log.user_id);
        console.log(
          `Climb Log ID: ${log.id}, User ID: ${log.user_id}, isFollowing: ${isFollowing}`
        );
        return {
          ...log,
          isFollowing,
        };
      });

      setClimbLogs(updatedLogs);
      setClimbLogLikes(likes || []);
      setClimbLogComments(groupedComments);
    } catch (err) {
      console.error("Unexpected error fetching climb logs:", err);
      setClimbLogs([]);
      setClimbLogLikes([]);
      setClimbLogComments({});
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
          return;
        }
        if (!data.user) {
          console.warn("No user found");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }

        setCurrentUser(profile);
      } catch (err) {
        console.error("Unexpected error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchLikesAndPosts = async () => {
      const likesData = await fetchPostLikes();
      setPostLikes(likesData); // <--- Update the global postLikes state FIRST
    };
  
    if (currentUser) {
      fetchLikesAndPosts();
    }
  }, [currentUser]);
  
  useEffect(() => {
    const fetchEverythingElse = async () => {
      const profilesData = await fetchProfiles();
      setProfiles(profilesData);
  
      await fetchClimbLogs(tab === "Following");
      await fetchPosts(tab === "Following", postLikes); // use correct postLikes
    };
  
    if (currentUser && postLikes.length > 0) {
      fetchEverythingElse();
    }
  }, [tab, follows, currentUser, postLikes.length]);
  

  useEffect(() => {
    const fetchFollows = async () => {
      if (!currentUser) return;

      try {
        const { data, error } = await supabase
          .from("follows")
          .select("*")
          .eq("follower_id", currentUser.id);

        if (error) {
          console.error("Error fetching follows:", error);
          setFollows([]);
        } else {
          setFollows(data || []);
          console.log("Fetched follows:", data);
        }
      } catch (err) {
        console.error("Unexpected error fetching follows:", err);
        setFollows([]);
      }
    };

    if (currentUser) {
      fetchFollows();
    }
  }, [currentUser]);

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchSuggestions([]);
      return;
    }

    const filteredSuggestions = profiles
      .filter((profile) =>
        profile.username.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5); // Limit to 5 suggestions
    setSearchSuggestions(filteredSuggestions);
  };

  const handleSuggestionClick = (profile) => {
    setSearchQuery(profile.username);
    setSelectedUserId(profile.id);
    setSearchSuggestions([]);
  };

  const handleSearchSubmit = () => {
    const matchedProfile = profiles.find(
      (profile) => profile.username.toLowerCase() === searchQuery.toLowerCase()
    );
    if (matchedProfile) {
      setSelectedUserId(matchedProfile.id);
    } else {
      setSelectedUserId(null);
      alert("No user found with that username.");
    }
    setSearchSuggestions([]);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedUserId(null);
    setSearchSuggestions([]);
  };

  const handleClimbLogLike = async (logId) => {
    if (!currentUser?.id) return;

    try {
      const myLike = climbLogLikes.find(
        (like) => like.climb_log_id === logId && like.user_id === currentUser.id
      );

      if (myLike) {
        const { error } = await supabase
          .from("climb_log_likes")
          .delete()
          .eq("id", myLike.id)
          .eq("user_id", currentUser.id);

        if (error) throw error;

        setClimbLogLikes((prev) =>
          prev.filter((like) => like.id !== myLike.id)
        );
      } else {
        const { data, error } = await supabase
          .from("climb_log_likes")
          .insert({
            user_id: currentUser.id,
            climb_log_id: logId,
          })
          .select()
          .single();

        if (error) throw error;

        setClimbLogLikes((prev) => [...prev, data]);
      }
    } catch (err) {
      console.error("Error toggling climb log like:", err.message || err);
    }
  };

  const handleClimbLogComment = async (logId) => {
    const content = newClimbLogComment[logId]?.trim();
    if (!content || !currentUser?.id) return;

    try {
      const { error } = await supabase
        .from("climb_log_comments")
        .insert({
          user_id: currentUser.id,
          climb_log_id: logId,
          content,
        });

      if (error) throw error;

      setNewClimbLogComment((prev) => ({ ...prev, [logId]: "" }));

      const { data: updated, error: fetchError } = await supabase
        .from("climb_log_comments")
        .select("*, profiles(username)")
        .eq("climb_log_id", logId)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      setClimbLogComments((prev) => ({
        ...prev,
        [logId]: updated,
      }));
    } catch (err) {
      console.error("Error adding climb log comment:", err.message || err);
    }
  };

  const handleFollowToggle = async (followedId) => {
    if (!currentUser?.id) return;

    try {
      const existingFollow = follows.find((f) => f.followed_id === followedId);

      if (existingFollow) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("id", existingFollow.id);

        if (error) throw error;

        setFollows((prev) => prev.filter((f) => f.id !== existingFollow.id));
      } else {
        const { data, error } = await supabase
          .from("follows")
          .insert([{ follower_id: currentUser.id, followed_id: followedId }])
          .select()
          .single();

        if (error) throw error;

        setFollows((prev) => [...prev, data]);
      }
    } catch (err) {
      console.error("Error toggling follow:", err.message || err);
    }
  };

  const handleLike = async (postId) => {
    if (!currentUser?.id) return;
  
    try {
      const myLike = postLikes.find(
        (like) => like.post_id === postId && like.user_id === currentUser.id
      );
  
      if (myLike) {
        // UNLIKE
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("id", myLike.id);
  
        if (error) throw error;
      } else {
        // LIKE
        const { error } = await supabase
          .from("post_likes")
          .insert({
            post_id: postId,
            user_id: currentUser.id,
          });
  
        if (error) throw error;
      }
  
      // 🔥 AFTER updating, re-fetch likes
      const { data: updatedLikes, error: fetchError } = await supabase
        .from("post_likes")
        .select("*");
  
      if (fetchError) throw fetchError;
  
      setPostLikes(updatedLikes);
  
    } catch (err) {
      console.error("Error toggling post like:", err.message || err);
    }
  };
  

  const handleAddComment = async (postId) => {
    const content = newComment[postId]?.trim();
    if (!content || !currentUser?.id) return;

    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: currentUser.id,
        content,
      });

      if (error) throw error;

      setNewComment((prev) => ({ ...prev, [postId]: "" }));

      const { data: updatedComments, error: fetchError } = await supabase
        .from("comments")
        .select("content, user_id, profiles:user_id (username)")
        .eq("post_id", postId);

      if (fetchError) throw fetchError;

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, comments: updatedComments || [] } : post
        )
      );
    } catch (err) {
      console.error("Error adding comment:", err.message || err);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err.message || err);
    }
  };

  const handleDeleteClimbLog = async (logId) => {
    try {
      const { error } = await supabase.from("climb_logs").delete().eq("id", logId);
      if (error) throw error;
      setClimbLogs((prev) => prev.filter((log) => log.id !== logId));
    } catch (err) {
      console.error("Error deleting climb log:", err.message || err);
    }
  };

  const handlePostSubmit = async () => {
    if (!currentUser || !currentUser.id) {
      alert("You must be logged in to post.");
      return;
    }

    if (!caption.trim() || !image) {
      alert("Please provide both an image and a caption.");
      return;
    }

    try {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, image, {
          cacheControl: "3600",
          upsert: false,
          contentType: image.type,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from("post-images")
        .getPublicUrl(uploadData.path);

      if (publicUrlError || !publicUrlData.publicUrl) {
        throw new Error("Failed to get image URL.");
      }

      const { error: insertError } = await supabase.from("posts").insert([
        {
          user_id: currentUser.id,
          image_url: publicUrlData.publicUrl,
          caption: caption,
          likes: 0,
        },
      ]);

      if (insertError) throw insertError;

      setCaption("");
      setImage(null);
      const likesData = await fetchPostLikes();
      await fetchPosts(tab === "Following", likesData);
    } catch (err) {
      console.error("Error creating post:", err.message || err);
      alert("Failed to create post.");
    }
  };

  const handleUsernameClick = (userId, event) => {
    event.stopPropagation();
    event.preventDefault();
    console.log(`Navigating to /profile/${userId}`);
    navigate(`/profile/${userId}`, { state: { from: "home" }, replace: false });
  };

  const sortedPosts = [...posts]
    .filter((post) => !selectedUserId || post.user_id === selectedUserId)
    .sort((a, b) => {
      console.log(`Sorting posts with sortOption: ${sortOption}`);
      const aLikes = postLikes.filter((like) => like.post_id === a.id).length;
      const bLikes = postLikes.filter((like) => like.post_id === b.id).length;
      const aComments = a.comments?.length || 0;
      const bComments = b.comments?.length || 0;

      console.log(
        `Post A (ID: ${a.id}): Likes=${aLikes}, Comments=${aComments}, Created=${a.created_at}`
      );
      console.log(
        `Post B (ID: ${b.id}): Likes=${bLikes}, Comments=${bComments}, Created=${b.created_at}`
      );

      switch (sortOption) {
        case "mostLikes":
          return bLikes - aLikes;
        case "leastLikes":
          return aLikes - bLikes;
        case "mostComments":
          return bComments - aComments;
        case "leastComments":
          return aComments - bComments;
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  const sortedClimbLogs = [...climbLogs]
    .filter((log) => !selectedUserId || log.user_id === selectedUserId)
    .sort((a, b) => {
      console.log(`Sorting climb logs with sortOption: ${sortOption}`);
      const aLikes = climbLogLikes.filter((like) => like.climb_log_id === a.id).length;
      const bLikes = climbLogLikes.filter((like) => like.climb_log_id === b.id).length;
      const aComments = climbLogComments[a.id]?.length || 0;
      const bComments = climbLogComments[b.id]?.length || 0;

      switch (sortOption) {
        case "mostLikes":
          return bLikes - aLikes;
        case "leastLikes":
          return aLikes - bLikes;
        case "mostComments":
          return bComments - aComments;
        case "leastComments":
          return aComments - bComments;
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  const combinedFeed = [
    ...posts.map((p) => ({ ...p, type: "post" })),
    ...climbLogs.map((c) => ({ ...c, type: "climb_log" })),
  ]
    .filter((item) => !selectedUserId || item.user_id === selectedUserId)
    .sort((a, b) => {
      console.log(`Sorting combined feed with sortOption: ${sortOption}`);
      const aLikes =
        a.type === "post"
          ? postLikes.filter((like) => like.post_id === a.id).length
          : climbLogLikes.filter((like) => like.climb_log_id === a.id).length;
      const bLikes =
        b.type === "post"
          ? postLikes.filter((like) => like.post_id === b.id).length
          : climbLogLikes.filter((like) => like.climb_log_id === b.id).length;
      const aComments =
        a.type === "post" ? a.comments?.length || 0 : climbLogComments[a.id]?.length || 0;
      const bComments =
        b.type === "post" ? b.comments?.length || 0 : climbLogComments[b.id]?.length || 0;

      console.log(
        `Item A (ID: ${a.id}, Type: ${a.type}): Likes=${aLikes}, Comments=${aComments}, Created=${a.created_at}`
      );
      console.log(
        `Item B (ID: ${b.id}, Type: ${b.type}): Likes=${bLikes}, Comments=${bComments}, Created=${b.created_at}`
      );

      switch (sortOption) {
        case "mostLikes":
          return bLikes - aLikes;
        case "leastLikes":
          return aLikes - bLikes;
        case "mostComments":
          return bComments - aComments;
        case "leastComments":
          return aComments - bComments;
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  return (
    <>
      <Navbar />
      <div className="home-feed">
        <div className="create-post-section">
        <h2 data-testid="test001">Create a Post</h2>
          <div className="create-post-box">
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="create-image-input"
            />
            <textarea
              placeholder="Enter your caption here..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="create-caption-input"
            />
            <button onClick={handlePostSubmit} className="create-post-button">
              Post
            </button>
          </div>
        </div>

        <div className="tabs-section">
          <button
            className={`tab-button ${tab === "Following" ? "active" : ""}`}
            onClick={() => {
              setTab("Following");
              handleClearSearch();
            }}
          >
            Following
          </button>
          <button
            className={`tab-button ${tab === "Community" ? "active" : ""}`}
            onClick={() => setTab("Community")}
          >
            Community
          </button>
        </div>

        <div className="posts-header">
          <h2>{tab === "Following" ? "Following Feed" : "Community Feed"}</h2>
          <div className="sort-filter-wrapper">
            {tab === "Community" && (
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search for users..."
                  value={searchQuery}
                  onChange={handleSearchInput}
                  className="search-input"
                />
                <button onClick={handleSearchSubmit} className="search-button">
                  Search
                </button>
                {selectedUserId && (
                  <button onClick={handleClearSearch} className="clear-search-button">
                    Clear
                  </button>
                )}
                {searchSuggestions.length > 0 && (
                  <ul className="search-suggestions">
                    {searchSuggestions.map((profile) => (
                      <li
                        key={profile.id}
                        onClick={() => handleSuggestionClick(profile)}
                        className="suggestion-item"
                      >
                        <img
                          src={
                            profile.profile_picture || "https://via.placeholder.com/30"
                          }
                          alt="Profile"
                          className="suggestion-picture"
                        />
                        {profile.username}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="sort-dropdown">
              <label>Sort by:</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="mostLikes">Most Likes</option>
                <option value="leastLikes">Least Likes</option>
                <option value="mostComments">Most Comments</option>
                <option value="leastComments">Least Comments</option>
              </select>
            </div>
            <div className="filter-dropdown">
              <label>Filter by:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Posts">Posts</option>
                <option value="Logs">Climb Logs</option>
              </select>
            </div>
          </div>
        </div>

        {(filter === "All" || filter === "Posts") && sortedPosts.length === 0 && sortedClimbLogs.length === 0 && (
          <p>No posts or climb logs found{selectedUserId ? " for this user" : ""}.</p>
        )}

        <div className="posts-container">
          {filter === "Posts" &&
            sortedPosts.map((post) => (
              <div key={post.id} className="post">
                <div className="post-header">
                  <img
                    src={
                      post.profiles?.profile_picture ||
                      "https://via.placeholder.com/40"
                    }
                    alt="Profile"
                    className="profile-picture"
                  />
                  <span
                    className="poster-username"
                    onClick={(e) => handleUsernameClick(post.user_id, e)}
                    style={{
                      cursor: "pointer",
                      textDecoration: "underline",
                      marginRight: "10px",
                    }}
                  >
                    {post.profiles?.username || "Unknown"}
                  </span>
                  {post.user_id !== currentUser?.id && (
                    <button
                      className={`follow-button ${
                        post.isFollowing ? "following" : ""
                      }`}
                      onClick={() => handleFollowToggle(post.user_id)}
                    >
                      {post.isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
                <img src={post.image_url} alt="Post" className="post-image" />
                <div className="caption-box">
                  <p className="caption">{post.caption}</p>
                </div>
                <div className="actions">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="heart-button"
                  >
                    {postLikes.find(
                      (like) =>
                        like.post_id === post.id &&
                        like.user_id === currentUser?.id
                    ) ? (
                      <FaHeart color="white" />
                    ) : (
                      <FaRegHeart color="gray" />
                    )}
                    <span>
                      ({postLikes.filter((like) => like.post_id === post.id).length})
                    </span>
                  </button>
                  {currentUser?.id === post.user_id && (
                    <button
                      className="delete-button"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      Delete Post ⛌
                    </button>
                  )}
                </div>
                <div className="comments-section">
                  <h4>Comments:</h4>
                  {(post.comments || [])
                    .slice(0, expandedComments[post.id] ? post.comments.length : 3)
                    .map((comment, index) => (
                      <p key={index} className="comment">
                        <strong>{comment.profiles?.username || "Anonymous"}:</strong>{" "}
                        {comment.content}
                      </p>
                    ))}
                  {post.comments?.length > 3 && (
                    <button
                      onClick={() =>
                        setExpandedComments((prev) => ({
                          ...prev,
                          [post.id]: !prev[post.id],
                        }))
                      }
                      className="view-more-comments"
                    >
                      {expandedComments[post.id] ? "View Less" : "View More"}
                    </button>
                  )}
                  <div className="comment-input">
                    <input
                      type="text"
                      value={newComment[post.id] || ""}
                      onChange={(e) =>
                        setNewComment({
                          ...newComment,
                          [post.id]: e.target.value,
                        })
                      }
                      placeholder="Add a comment..."
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="comment-submit"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            ))}

          {filter === "Logs" &&
            sortedClimbLogs.map((log) => {
              const logLikes = climbLogLikes.filter(
                (like) => like.climb_log_id === log.id
              );
              const userLiked = logLikes.find(
                (like) => like.user_id === currentUser?.id
              );
              const comments = climbLogComments[log.id] || [];

              return (
                <div key={log.id} className="post">
                  <div className="post-header">
                    <img
                      src={
                        log.profiles?.profile_picture ||
                        "https://via.placeholder.com/40"
                      }
                      alt="Profile"
                      className="profile-picture"
                    />
                    <span
                      className="poster-username"
                      onClick={(e) => handleUsernameClick(log.user_id, e)}
                      style={{
                        cursor: "pointer",
                        textDecoration: "underline",
                        marginRight: "10px",
                      }}
                    >
                      {log.profiles?.username || "Unknown"}
                    </span>
                    {log.user_id !== currentUser?.id && (
                      <button
                        className={`follow-button ${
                          log.isFollowing ? "following" : ""
                        }`}
                        onClick={() => handleFollowToggle(log.user_id)}
                      >
                        {log.isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                  {log.photo_url && (
                    <img
                      src={log.photo_url}
                      alt="Climb Log"
                      className="post-image"
                    />
                  )}
                  <div className="caption-box">
                    <p className="caption">
                      <strong>Attempt Type:</strong> {log.attempt_type}
                    </p>
                    <p className="caption">
                      <strong>Notes:</strong> {log.notes || "No notes"}
                    </p>
                    <p className="caption">
                      <small>{new Date(log.created_at).toLocaleString()}</small>
                    </p>
                  </div>
                  <div className="actions">
                    <button
                      onClick={() => handleClimbLogLike(log.id)}
                      className={`heart-button ${userLiked ? "pop" : ""}`}
                    >
                      {userLiked ? (
                        <FaHeart color="white" />
                      ) : (
                        <FaRegHeart color="gray" />
                      )}
                      <span>({logLikes.length})</span>
                    </button>
                    {currentUser?.id === log.user_id && (
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteClimbLog(log.id)}
                      >
                        Delete Log ⛌
                      </button>
                    )}
                  </div>
                  <div className="comments-section">
                    <h4>Comments:</h4>
                    {comments.length > 0 ? (
                      <>
                        {(expandedClimbLogComments[log.id]
                          ? comments
                          : comments.slice(0, 3)
                        ).map((comment) => (
                          <p key={comment.id} className="comment">
                            <strong>{comment.profiles?.username || "User"}:</strong>{" "}
                            {comment.content}
                          </p>
                        ))}
                        {comments.length > 3 && (
                          <button
                            onClick={() =>
                              setExpandedClimbLogComments((prev) => ({
                                ...prev,
                                [log.id]: !prev[log.id],
                              }))
                            }
                            className="view-more-comments"
                          >
                            {expandedClimbLogComments[log.id]
                              ? "View Less"
                              : "View More"}
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="comment">No comments yet.</p>
                    )}
                    <div className="comment-input">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newClimbLogComment[log.id] || ""}
                        onChange={(e) =>
                          setNewClimbLogComment((prev) => ({
                            ...prev,
                            [log.id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        onClick={() => handleClimbLogComment(log.id)}
                        className="comment-submit"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

          {filter === "All" &&
            combinedFeed.map((item) => {
              if (item.type === "post") {
                const post = item;
                return (
                  <div key={`post-${post.id}`} className="post">
                    <div className="post-header">
                      <img
                        src={
                          post.profiles?.profile_picture ||
                          "https://via.placeholder.com/40"
                        }
                        alt="Profile"
                        className="profile-picture"
                      />
                      <span
                        className="poster-username"
                        onClick={(e) => handleUsernameClick(post.user_id, e)}
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                          marginRight: "10px",
                        }}
                      >
                        {post.profiles?.username || "Unknown"}
                      </span>
                      {post.user_id !== currentUser?.id && (
                        <button
                          className={`follow-button ${
                            post.isFollowing ? "following" : ""
                          }`}
                          onClick={() => handleFollowToggle(post.user_id)}
                        >
                          {post.isFollowing ? "Following" : "Follow"}
                        </button>
                      )}
                    </div>
                    <img src={post.image_url} alt="Post" className="post-image" />
                    <div className="caption-box">
                      <p className="caption">{post.caption}</p>
                    </div>
                    <div className="actions">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="heart-button"
                      >
                        {postLikes.find(
                          (like) =>
                            like.post_id === post.id &&
                            like.user_id === currentUser?.id
                        ) ? (
                          <FaHeart color="white" />
                        ) : (
                          <FaRegHeart color="gray" />
                        )}
                        <span>
                          (
                          {postLikes.filter((like) => like.post_id === post.id)
                            .length}
                          )
                        </span>
                      </button>
                      {currentUser?.id === post.user_id && (
                        <button
                          className="delete-button"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          Delete Post ⛌
                        </button>
                      )}
                    </div>
                    <div className="comments-section">
                      <h4>Comments:</h4>
                      {(post.comments || [])
                        .slice(
                          0,
                          expandedComments[post.id] ? post.comments.length : 3
                        )
                        .map((comment, index) => (
                          <p key={index} className="comment">
                            <strong>
                              {comment.profiles?.username || "Anonymous"}:
                            </strong>{" "}
                            {comment.content}
                          </p>
                        ))}
                      {post.comments?.length > 3 && (
                        <button
                          onClick={() =>
                            setExpandedComments((prev) => ({
                              ...prev,
                              [post.id]: !prev[post.id],
                            }))
                          }
                          className="view-more-comments"
                        >
                          {expandedComments[post.id] ? "View Less" : "View More"}
                        </button>
                      )}
                      <div className="comment-input">
                        <input
                          type="text"
                          value={newComment[post.id] || ""}
                          onChange={(e) =>
                            setNewComment({
                              ...newComment,
                              [post.id]: e.target.value,
                            })
                          }
                          placeholder="Add a comment..."
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="comment-submit"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } else if (item.type === "climb_log") {
                const log = item;
                const logLikes = climbLogLikes.filter(
                  (like) => like.climb_log_id === log.id
                );
                const userLiked = logLikes.find(
                  (like) => like.user_id === currentUser?.id
                );
                const comments = climbLogComments[log.id] || [];

                return (
                  <div key={`log-${log.id}`} className="post">
                    <div className="post-header">
                      <img
                        src={
                          log.profiles?.profile_picture ||
                          "https://via.placeholder.com/40"
                        }
                        alt="Profile"
                        className="profile-picture"
                      />
                      <span
                        className="poster-username"
                        onClick={(e) => handleUsernameClick(log.user_id, e)}
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                          marginRight: "10px",
                        }}
                      >
                        {log.profiles?.username || "Unknown"}
                      </span>
                      {log.user_id !== currentUser?.id && (
                        <button
                          className={`follow-button ${
                            log.isFollowing ? "following" : ""
                          }`}
                          onClick={() => handleFollowToggle(log.user_id)}
                        >
                          {log.isFollowing ? "Following" : "Follow"}
                        </button>
                      )}
                    </div>
                    {log.photo_url && (
                      <img
                        src={log.photo_url}
                        alt="Climb Log"
                        className="post-image"
                      />
                    )}
                    <div className="caption-box">
                      <p className="caption">
                        <strong>Attempt Type:</strong> {log.attempt_type}
                      </p>
                      <p className="caption">
                        <strong>Notes:</strong> {log.notes || "No notes"}
                      </p>
                      <p className="caption">
                        <small>{new Date(log.created_at).toLocaleString()}</small>
                      </p>
                    </div>
                    <div className="actions">
                      <button
                        onClick={() => handleClimbLogLike(log.id)}
                        className={`heart-button ${userLiked ? "pop" : ""}`}
                      >
                        {userLiked ? (
                          <FaHeart color="white" />
                        ) : (
                          <FaRegHeart color="gray" />
                        )}
                        <span>({logLikes.length})</span>
                      </button>
                      {currentUser?.id === log.user_id && (
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteClimbLog(log.id)}
                        >
                          Delete Log ⛌
                        </button>
                      )}
                    </div>
                    <div className="comments-section">
                      <h4>Comments:</h4>
                      {comments.length > 0 ? (
                        <>
                          {(expandedClimbLogComments[log.id]
                            ? comments
                            : comments.slice(0, 3)
                          ).map((comment) => (
                            <p key={comment.id} className="comment">
                              <strong>
                                {comment.profiles?.username || "User"}:
                              </strong>{" "}
                              {comment.content}
                            </p>
                          ))}
                          {comments.length > 3 && (
                            <button
                              onClick={() =>
                                setExpandedClimbLogComments((prev) => ({
                                  ...prev,
                                  [log.id]: !prev[log.id],
                                }))
                              }
                              className="view-more-comments"
                            >
                              {expandedClimbLogComments[log.id]
                                ? "View Less"
                                : "View More"}
                            </button>
                          )}
                        </>
                      ) : (
                        <p className="comment">No comments yet.</p>
                      )}
                      <div className="comment-input">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={newClimbLogComment[log.id] || ""}
                          onChange={(e) =>
                            setNewClimbLogComment((prev) => ({
                              ...prev,
                              [log.id]: e.target.value,
                            }))
                          }
                        />
                        <button
                          onClick={() => handleClimbLogComment(log.id)}
                          className="comment-submit"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}
        </div>
      </div>
    </>
  );
}

export default Home;