import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header.tsx";

interface ICommunity {
    id: string;
    name: string;
    description: string;
    creatorId: string;
}

export default function PostCreationPage() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [communities, setCommunities] = useState<ICommunity[]>([]);
    const [selectedCommunityId, setSelectedCommunityId] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/communities");
                setCommunities(response.data);
                if (response.data.length > 0) {
                    setSelectedCommunityId(response.data[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch communities:", error);
                setError("Failed to load communities. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchCommunities();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        if (!title.trim()) {
            setError("Title is required");
            setIsSubmitting(false);
            return;
        }

        if (!selectedCommunityId) {
            setError("Please select a community");
            setIsSubmitting(false);
            return;
        }

        try {
            const userId = parseInt(localStorage.getItem("userId") || "1");
            const postData = {
                title: title.trim(),
                body: body.trim(),
                authorId: userId,
                communityId: parseInt(selectedCommunityId),
                creationTime: new Date().toISOString()
            };

            const response = await axios.post("http://localhost:8080/api/posts", postData);
            console.log("Post created:", response.data);
            navigate(`/community/${selectedCommunityId}`); // Redirect to community page after successful creation
        } catch (error) {
            console.error("Failed to create post:", error);
            setError("Failed to create post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            <Header />
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
                        <p className="mt-2 text-sm text-gray-600">Share your thoughts with the community</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="community" className="block text-sm font-medium text-gray-700 mb-1">
                                Community <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="community"
                                value={selectedCommunityId}
                                onChange={(e) => setSelectedCommunityId(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                                required
                            >
                                <option value="">Select a community</option>
                                {communities.map((community) => (
                                    <option key={community.id} value={community.id}>
                                        r/{community.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter post title"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
                                Content
                            </label>
                            <textarea
                                id="body"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Write your post content here..."
                                rows={6}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 resize-none"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 transform hover:scale-[1.02] ${
                                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 