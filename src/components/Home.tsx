import Header from "./Header/Header.tsx";
import {useEffect, useState} from "react";
import axios from "axios"
import {Link, useNavigate} from "react-router-dom";
import GlobalChat from "./GlobalChat/GlobalChat.tsx";

interface Post {
    id: number;
    title: string;
    body: string;
    authorUsername: string;
    creationTime: string;
    commentCount: number;
}

export default function Home() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/posts");
                setPosts(response.data);
            } catch (error) {
                console.error("Failed to fetch posts:", error);
                setError("Failed to load posts. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            <Header />
            
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : posts.length > 0 ? (
                            <div className="space-y-6">
                                {posts.map((post: Post) => (
                                    <article 
                                        key={post.id} 
                                        className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-200 hover:scale-[1.02] hover:shadow-xl"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-center space-x-4 mb-4">
                                                <img 
                                                    src="lorem_pfp.jpg" 
                                                    alt={post.authorUsername} 
                                                    className="w-10 h-10 rounded-full ring-2 ring-blue-500"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{post.authorUsername}</p>
                                                    <p className="text-xs text-gray-500">{formatDate(post.creationTime)}</p>
                                                </div>
                                            </div>
                                            
                                            <Link 
                                                to={`post/${post.id}`}
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
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Posts Yet</h2>
                                <p className="text-gray-600 mb-4">Be the first to create a post!</p>
                                {localStorage.getItem("token") && (
                                    <button
                                        onClick={() => navigate("/create-post")}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Create Post
                                    </button>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Chat Sidebar */}
                    <div className="lg:col-span-1">
                        {localStorage.getItem("token") ? (
                            <GlobalChat />
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Join the Conversation</h2>
                                <p className="text-gray-600 mb-4">Sign in to participate in the global chat</p>
                                <Link 
                                    to="/login"
                                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                                >
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
