import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import Navbar from "../components/Navbar";
import AdminSidebar from "./AdminSidebar";
import "./AdminManagePosts.css";

function AdminManagePosts() {
  const [posts, setPosts] = useState([]);
  const [sortOption, setSortOption] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [newComment, setNewComment] = useState({});
  const [comments, setComments] = useState({});
  const [commentCount, setCommentCount] = useState({});
  const [visibleComments, setVisibleComments] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        caption,
        image_url,
        created_at,
        likes,
        user_id,
        profiles:user_id (username, profile_picture)
      `)
      .order("created_at", { ascending: false });

    if (!error) {
      setPosts(data);
      setTotalPosts(data.length);
    } else {
      console.error("Error fetching posts:", error.message);
    }
  };

  const fetchComments = async (postId, reset = false) => {
    const limit = 10;
    const currentCount = reset ? 0 : commentCount[postId] || 0;

    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        user_id,
        created_at,
        profiles:user_id (username)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .range(currentCount, currentCount + limit - 1);

    if (!error) {
      setComments((prev) => ({
        ...prev,
        [postId]: reset ? data : [...(prev[postId] || []), ...data],
      }));
      setCommentCount((prev) => ({
        ...prev,
        [postId]: currentCount + data.length,
      }));
      setVisibleComments((prev) => ({ ...prev, [postId]: true }));
    } else {
      console.error("Error fetching comments:", error);
    }
  };

  const handleToggleComments = (postId) => {
    setVisibleComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    const { error } = await supabase.from("posts").delete().eq("id", postToDelete);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete));
      setPostToDelete(null);
      setShowConfirm(false);
      setShowDeleteMessage(true);
      setTimeout(() => setShowDeleteMessage(false), 3000);
    } else {
      console.error("Failed to delete post:", error.message);
    }
  };

  const handleAddComment = async (postId) => {
    const content = newComment[postId];
    if (!content) return;

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: user.id,
      content,
    });

    if (!error) {
      setNewComment((prev) => ({ ...prev, [postId]: "" }));
      fetchComments(postId, true);
    } else {
      console.error("Error adding comment:", error);
    }
  };

  const handleSortChange = (value) => setSortOption(value);

  const filteredPosts = posts
    .filter((post) => {
      const username = post.profiles?.username?.toLowerCase() || "";
      const caption = post.caption?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return username.includes(query) || caption.includes(query);
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "mostLiked":
          return b.likes - a.likes;
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  return (
    <div className="admin-wrapper">
      <Navbar />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <h1>Manage Posts</h1>

          {/* Post Counts */}
          <div className="post-counts">
            <p>Total Posts: {totalPosts}</p>
            <p>Currently Displaying: {filteredPosts.length}</p>
          </div>

          {/* Toolbar */}
          <div className="post-toolbar">
            <input
              type="text"
              placeholder="Search by username or caption..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select value={sortOption} onChange={(e) => handleSortChange(e.target.value)}>
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest</option>
              <option value="mostLiked">Most Liked</option>
            </select>
          </div>

          {/* Posts */}
          <div className="post-grid">
            {filteredPosts.length === 0 && <p>No posts found.</p>}
            {filteredPosts.map((post) => (
              <div className="post-card" key={post.id}>
                <img src={post.image_url} alt="Post" className="post-image" />
                <div className="post-info">
                  <p><strong>User:</strong> {post.profiles?.username || "Unknown"}</p>
                  <p><strong>Caption:</strong> {post.caption}</p>
                  <p><strong>Likes:</strong> {post.likes}</p>
                  <p className="post-date">{new Date(post.created_at).toLocaleString()}</p>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      setPostToDelete(post.id);
                      setShowConfirm(true);
                    }}
                  >
                    Delete Post
                  </button>
                </div>

                <div className="admin-comments-section">
                  <h4>Comments:</h4>
                  {!visibleComments[post.id] ? (
                    <button onClick={() => fetchComments(post.id, true)}>Load Comments</button>
                  ) : (
                    <>
                      <div className="comment-list">
                        {(comments[post.id] || []).map((comment) => (
                          <p key={comment.id}>
                            <strong>{comment.profiles?.username || "Anonymous"}:</strong>{" "}
                            {comment.content}
                          </p>
                        ))}
                      </div>
                      <div className="comment-buttons">
                        <button onClick={() => fetchComments(post.id)}>Load More</button>
                        <button onClick={() => handleToggleComments(post.id)}>Hide Comments</button>
                      </div>
                    </>
                  )}

                  <div className="add-comment">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment[post.id] || ""}
                      onChange={(e) =>
                        setNewComment((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                    />
                    <button onClick={() => handleAddComment(post.id)}>Post</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Confirmation Modal */}
          {showConfirm && (
            <div className="modal-backdrop">
              <div className="modal">
                <h3>Confirm Deletion</h3>
                <p>Are you sure you want to delete this post?</p>
                <div className="modal-buttons">
                  <button className="confirm-btn" onClick={handleConfirmDelete}>
                    Yes, Delete
                  </button>
                  <button className="cancel-btn" onClick={() => setShowConfirm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast Message */}
          {showDeleteMessage && (
            <div className="toast-popup">Post deleted successfully!</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminManagePosts;
