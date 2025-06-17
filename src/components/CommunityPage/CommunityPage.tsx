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
}

interface ICommunity {
    id: string;
    name: string;
    description: string;
    creatorId: string;
}

export default function CommunityPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [community, setCommunity] = useState<ICommunity | null>(null);
    const [posts, setPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const currentUserId = parseInt(localStorage.getItem("userId") || "0");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [communityResponse, postsResponse] = await Promise.all([
                    axios.get(`http://localhost:8080/api/communities/${id}`),
                    axios.get(`http://localhost:8080/api/communities/${id}/posts`)
                ]);
                setCommunity(communityResponse.data);
                setPosts(postsResponse.data);
            } catch (error) {
                console.error("Failed to fetch community data:", error);
                setError("Failed to load community. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleDeleteCommunity = async () => {
        if (!window.confirm("Are you sure you want to delete this community? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        setError("");

        try {
            const response = await axios.delete(`http://localhost:8080/api/communities/${id}`);
            if (response.status === 200) {
                navigate("/communities");
            }
        } catch (error) {
            console.error("Failed to delete community:", error);
            setError("Failed to delete community. Please try again.");
            setIsDeleting(false);
        }
    };

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

    if (!community) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                <Header />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Community Not Found</h2>
                        <p className="text-gray-600 mb-4">The community you're looking for doesn't exist or has been removed.</p>
                        <button
                            onClick={() => navigate("/communities")}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Return to Communities
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isCreator = currentUserId === parseInt(community.creatorId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            <Header />
            
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Community Header */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">r/{community.name}</h1>
                                <p className="text-sm text-gray-500 mt-1">Created by {community.creatorId}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                {isCreator && (
                                    <button
                                        onClick={handleDeleteCommunity}
                                        disabled={isDeleting}
                                        className={`px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 ${
                                            isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete Community'}
                                    </button>
                                )}
                                {localStorage.getItem("token") && (
                                    <button
                                        onClick={() => navigate("/create-post")}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                                    >
                                        Create Post
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-600">{community.description}</p>
                    </div>
                </div>

                {/* Posts List */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {posts.length > 0 ? (
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <article 
                                key={post.id} 
                                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-200 hover:scale-[1.02] hover:shadow-xl"
                            >
                                <div className="p-6">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <img 
                                            src="../lorem_pfp.jpg" 
                                            alt={post.authorUsername} 
                                            className="w-10 h-10 rounded-full ring-2 ring-blue-500"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{post.authorUsername}</p>
                                            <p className="text-xs text-gray-500">{formatDate(post.creationTime)}</p>
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

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center space-x-2 text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm font-medium">
                                                {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
                                            </span>
                                        </div>
                                        <Link 
                                            to={`/post/${post.id}`}
                                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                                        >
                                            <span>Read more</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No posts yet</h3>
                        <p className="text-gray-500 mb-4">Be the first to create a post in this community!</p>
                        {localStorage.getItem("token") && (
                            <button
                                onClick={() => navigate("/create-post")}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                            >
                                Create Post
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 