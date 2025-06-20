import Header from "../Header/Header.tsx";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

interface IPost {
  title: string;
  body: string;
  authorUsername: string;
  authorId: number;
  creationTime: string;
  commentCount: number;
}

interface IComment {
  id: number;
  body: string;
  creationTime: string;
  authorUsername: string;
}

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const currentUsername = localStorage.getItem("username") || "";

  const [post, setPost] = useState<IPost | null>(null);
  const [comments, setComments] = useState<IComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditCommentOpen, setIsEditCommentOpen] = useState(false);
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editCommentBody, setEditCommentBody] = useState("");
  const [isEditingComment, setIsEditingComment] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    setError("");
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(`http://localhost:8080/posts/${id}/comments`, {
        postId: parseInt(id || "0"),
        body: commentText.trim(),
        authorId: parseInt(localStorage.getItem("userId") || "1"),
        creationTime: new Date().toISOString(),
        authorUsername: localStorage.getItem("username")
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        setCommentText("");
        // Refresh comments
        const commentsResponse = await axios.get(`http://localhost:8080/posts/${id}/comments`);
        const mappedComments = commentsResponse.data.map((comment: any) => ({ ...comment, id: comment.commentId }));
        setComments(mappedComments);
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
      setError("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:8080/posts/${id}`,{headers:{"Authorization":`Bearer ${localStorage.getItem("token")}`}});
      if (response.status === 200) {
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      setError("Failed to delete post. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    setError("");
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(`http://localhost:8080/posts/${id}/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        // Refresh comments
        const commentsResponse = await axios.get(`http://localhost:8080/posts/${id}/comments`);
        const mappedComments = commentsResponse.data.map((comment: any) => ({ ...comment, id: comment.commentId }));
        setComments(mappedComments);
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setError("Failed to delete comment. Please try again.");
    }
  };

  const openEditPopup = () => {
    setEditTitle(post?.title || "");
    setEditBody(post?.body || "");
    setIsEditOpen(true);
  };

  const closeEditPopup = () => {
    setIsEditOpen(false);
    setEditTitle("");
    setEditBody("");
  };

  const handleEditPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `http://localhost:8080/posts/${id}`,
        {
          title: editTitle,
          body: editBody,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setPost((prev) => prev ? { ...prev, title: editTitle, body: editBody } : prev);
        closeEditPopup();
      }
    } catch (error) {
      console.error("Failed to edit post:", error);
      setError("Failed to edit post. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const openEditCommentPopup = (comment: IComment) => {
    setEditCommentId(comment.id);
    setEditCommentBody(comment.body);
    setIsEditCommentOpen(true);
  };

  const closeEditCommentPopup = () => {
    setIsEditCommentOpen(false);
    setEditCommentId(null);
    setEditCommentBody("");
  };

  const handleEditComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCommentId) return;
    setIsEditingComment(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `http://localhost:8080/posts/${id}/comments/${editCommentId}`,
        { body: editCommentBody },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setComments((prev) => prev.map((c) => c.id === editCommentId ? { ...c, body: editCommentBody } : c));
        closeEditCommentPopup();
      }
    } catch (error) {
      console.error("Failed to edit comment:", error);
      setError("Failed to edit comment. Please try again.");
    } finally {
      setIsEditingComment(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postResponse, commentsResponse] = await Promise.all([
          axios.get(`http://localhost:8080/posts/${id}`),
          axios.get(`http://localhost:8080/posts/${id}/comments`)
        ]);
        setPost(postResponse.data);
        console.log(postResponse.data);
        console.log(commentsResponse.data);
        
        const mappedComments = commentsResponse.data.map((comment: any) => ({ ...comment, id: comment.commentId }));
        setComments(mappedComments);
      } catch (error) {
        console.error("Failed to fetch post data:", error);
        setError("Failed to load post. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h2>
            <p className="text-gray-600 mb-4">The post you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Post Content */}
        <article className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Link to = {`/user/${post.authorId}`}>
                <img
                  src="../../public/lorem_pfp.jpg"
                  alt={post.authorUsername}
                  className="w-12 h-12 rounded-full ring-2 ring-blue-500"
                />
                </Link>
                <div>
                  <p className="text-sm font-medium text-gray-900">{post.authorUsername}</p>
                  <p className="text-xs text-gray-500">{formatDate(post.creationTime)}</p>
                </div>
              </div>
              {parseInt(localStorage.getItem("userId") || "0") === post.authorId || currentUsername === 'admin' ? (
                <div className="flex gap-2">
                  <button
                    onClick={openEditPopup}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition duration-200"
                  >
                    Edit Post
                  </button>
                  <button
                    onClick={handleDeletePost}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition duration-200"
                  >
                    Delete Post
                  </button>
                </div>
              ) : null}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <div className="prose max-w-none text-gray-600">
              {post.body}
            </div>
          </div>
        </article>

        {/* Comment Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            {isLoggedIn && (
              <form onSubmit={handleCommentSubmit} className="mb-8">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                <div className="mb-4">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 resize-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !commentText.trim()}
                    className={`px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ${(isSubmitting || !commentText.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <img
                      src="../../public/lorem_pfp.jpg"
                      alt={comment.authorUsername}
                      className="w-10 h-10 rounded-full ring-2 ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {comment.authorUsername}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.creationTime)}
                          </span>
                        </div>
                        {(currentUsername === comment.authorUsername || currentUsername === 'admin') && (
                          <>
                            <button
                              onClick={() => openEditCommentPopup(comment)}
                              className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition duration-200 mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition duration-200"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                      <p className="text-gray-600">{comment.body}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Edit Post Popup */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={closeEditPopup}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Edit Post</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <form onSubmit={handleEditPost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditPopup}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className={`px-6 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isEditing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Comment Popup */}
      {isEditCommentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={closeEditCommentPopup}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Edit Comment</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <form onSubmit={handleEditComment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={editCommentBody}
                  onChange={(e) => setEditCommentBody(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditCommentPopup}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditingComment}
                  className={`px-6 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ${isEditingComment ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isEditingComment ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
