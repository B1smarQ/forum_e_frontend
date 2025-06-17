import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../Header/Header.tsx";
import { useNavigate } from "react-router-dom";

interface ICommunity {
    id: string;
    creatorId: string;
    description: string;
    name: string;
}

export default function CommunitiesPage() {
    const [communities, setCommunities] = useState<ICommunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/communities");
                setCommunities(response.data);
            } catch (error) {
                console.error("Failed to fetch communities:", error);
                setError("Failed to load communities. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchCommunities();
    }, []);

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
            
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Communities</h1>
                    {localStorage.getItem("token") && (
                        <button
                            onClick={() => navigate("/create-community")}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                        >
                            Create Community
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {communities.length > 0 ? (
                        communities.map((community, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-200 transform hover:-translate-y-1"
                            >
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                                        r/{community.name}
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        {community.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">
                                            Created by {community.creatorId}
                                        </span>
                                        <button
                                            onClick={() => navigate(`/community/${community.id}`)}
                                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                        >
                                            View Community
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 bg-white rounded-xl shadow-lg p-8 text-center">
                            <p className="text-gray-600">No communities found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 