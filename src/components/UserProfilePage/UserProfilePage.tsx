import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header/Header.tsx";
import { Link } from "react-router-dom";

interface IPost {
    id: number;
    title: string;
    body: string;
    authorUsername: string;
    creationTime: string;
    commentCount: number;
    communityId: number;
    communityName: string;
}

interface IUserInfo {
    username: string;
    role: string;
    creationTime: string;
}

interface IUserComment {
    id: number;
    body: string;
    creationTime: string;
    postId: number;
    postTitle?: string;
}

export default function UserProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [posts, setPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const currentUserId = parseInt(localStorage.getItem("userId") || "0");
    const currentUsername = localStorage.getItem("username") || "";
    const isOwnProfile = currentUserId === parseInt(userId || "0");
    const profileUsername = isOwnProfile ? currentUsername : posts[0]?.authorUsername || "";
    const [userInfo, setUserInfo] = useState<IUserInfo | null>(null);
    const [userComments, setUserComments] = useState<IUserComment[]>([]);

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                const postsResponse = await axios.get(`http://localhost:8080/posts/user/${userId}`);
                console.log(postsResponse.data);
                
                setPosts(postsResponse.data);
            } catch (error) {
                console.error("Failed to fetch user posts:", error);
                setError("Failed to load user posts. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        const fetchUserInfo = async () => {
            try {
                const infoResponse = await axios.get(`http://localhost:8080/users/${userId}/info`);
                setUserInfo(infoResponse.data);
            } catch (error) {
                console.error("Failed to fetch user info:", error);
            }
        };
        const fetchUserComments = async () => {
            try {
                const commentsResponse = await axios.get(`http://localhost:8080/comments/user/${userId}`);
                setUserComments(commentsResponse.data);
            } catch (error) {
                console.error("Failed to fetch user comments:", error);
            }
        };
        fetchUserPosts();
        fetchUserInfo();
        fetchUserComments();
    }, [userId]);

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

    if (posts?.length === 0 && !isOwnProfile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                <Header />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
                        <p className="text-gray-600 mb-4">The user you're looking for doesn't exist or has been removed.</p>
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
                {/* User Profile Header */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                                <img 
                                    src="../lorem_pfp.jpg" 
                                    alt={profileUsername} 
                                    className="w-20 h-20 rounded-full ring-4 ring-blue-500"
                                />
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{userInfo?.username || profileUsername}</h1>
                                    {userInfo && (
                                        <>
                                            <p className="text-gray-600">Role: {userInfo.role}</p>
                                            <p className="text-gray-600">Joined: {formatDate(userInfo.creationTime)}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            {isOwnProfile && (
                                <button
                                    onClick={() => navigate("/create-post")}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                                >
                                    Create Post
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Posts List */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <div className="space-y-6">
                    {posts?.length > 0 ? (
                        posts.map((post) => (
                            <article 
                                key={post.id} 
                                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-200 hover:scale-[1.02] hover:shadow-xl"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <Link 
                                                to={`/community/${post.communityId}`}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                            >
                                                r/{post.communityName}
                                            </Link>
                                            <span className="text-gray-500">•</span>
                                            <span className="text-sm text-gray-500">{formatDate(post.creationTime)}</span>
                                        </div>
                                    </div>
                                    
                                    <Link 
                                        to={`/post/${post.id}`}
                                        className="block group"
                                    >
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                            {post.title}
                                        </h2>
                                        {post.body && (
                                            <p className="text-gray-600 line-clamp-3 mb-4">
                                                {post.body}
                                            </p>
                                        )}
                                    </Link>
                                    
                                    <div className="flex items-center text-sm text-gray-500">
                                        <span>{post.commentCount} comments</span>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {isOwnProfile ? "You haven't created any posts yet" : "No posts yet"}
                            </h2>
                            <p className="text-gray-600 mb-4">
                                {isOwnProfile 
                                    ? "Start sharing your thoughts with the community!"
                                    : "This user hasn't created any posts yet."}
                            </p>
                            {isOwnProfile && (
                                <button
                                    onClick={() => navigate("/create-post")}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Create your first post
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* User Comments Section */}
                <div className="mt-12">
                  <h2 className="text-2xl font-extrabold text-white mb-6 tracking-tight">Comments</h2>
                  {userComments.length > 0 ? (
                    <div className="space-y-4">
                      {userComments.map((comment) => (
                        <div key={comment.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
                          <div className="flex items-center mb-2">
                            <span className="text-xs text-gray-500 mr-2">{formatDate(comment.creationTime)}</span>
                            <Link to={`/post/${comment.postId}`} className="text-xs text-blue-600 hover:underline ml-2">
                              {comment.postTitle ? `on: ${comment.postTitle}` : `View Post`}
                            </Link>
                          </div>
                          <p className="text-gray-800 text-sm">{comment.body}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
                      No comments yet.
                    </div>
                  )}
                </div>
            </div>
        </div>
    );
} 