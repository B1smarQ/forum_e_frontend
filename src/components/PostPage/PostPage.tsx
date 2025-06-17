import Header from "../Header/Header.tsx";
import {useEffect, useState} from "react";
import axios from "axios";
import {useParams, useNavigate} from "react-router-dom";

interface IPost {
    title: string;
    body: string;
    authorUsername: string;
    authorId: number;
    creationTime: string;
    commentCount: number;
}

interface IComment {
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

        try {
            const response = await axios.post(`http://localhost:8080/api/posts/${id}/comments`, {
                replyTo: parseInt(id || "0"),
                body: commentText.trim(),
                authorId: parseInt(localStorage.getItem("userId") || "1"),
                creationTime: new Date().toISOString(),
                authorUsername: localStorage.getItem("username")
            });

            if (response.status === 201) {
                setCommentText("");
                // Refresh comments
                const commentsResponse = await axios.get(`http://localhost:8080/api/posts/${id}/comments`);
                setComments(commentsResponse.data);
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
            const response = await axios.delete(`http://localhost:8080/api/posts/${id}`);
            if (response.status === 200) {
                navigate("/");
            }
        } catch (error) {
            console.error("Failed to delete post:", error);
            setError("Failed to delete post. Please try again.");
        }
    };

    const handleDeleteComment = (commentIndex: number) => {
        // Placeholder for comment deletion
        console.log("Delete comment clicked for index:", commentIndex);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postResponse, commentsResponse] = await Promise.all([
                    axios.get(`http://localhost:8080/api/posts/${id}`),
                    axios.get(`http://localhost:8080/api/posts/${id}/comments`)
                ]);
                setPost(postResponse.data);
                console.log(postResponse.data);
                setComments(commentsResponse.data);
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
                                <img 
                                    src="../../public/lorem_pfp.jpg" 
                                    alt={post.authorUsername} 
                                    className="w-12 h-12 rounded-full ring-2 ring-blue-500"
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{post.authorUsername}</p>
                                    <p className="text-xs text-gray-500">{formatDate(post.creationTime)}</p>
                                </div>
                            </div>
                            {parseInt(localStorage.getItem("userId") || "0") === post.authorId && (
                                <button
                                    onClick={handleDeletePost}
                                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition duration-200"
                                >
                                    Delete Post
                                </button>
                            )}
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
                                        className={`px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ${
                                            (isSubmitting || !commentText.trim()) ? 'opacity-50 cursor-not-allowed' : ''
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
                                comments.map((comment, index) => (
                                    <div 
                                        key={index} 
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
                                                {currentUsername === comment.authorUsername && (
                                                    <button
                                                        onClick={() => handleDeleteComment(index)}
                                                        className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition duration-200"
                                                    >
                                                        Delete
                                                    </button>
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
        </div>
    );
}