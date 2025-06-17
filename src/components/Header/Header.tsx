import {Link, useNavigate} from "react-router-dom";

export default function Header(){
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <>
            <div className={"flex justify-between items-center bg-gray-700 p-2"}>
                <div className="flex items-center">
                    <Link to="/" className={"text-4xl font-bold text-white ml-32 mr-4"}>
                        E
                    </Link>
                    <Link to="/" className={"text-2xl font-bold text-white ml-4 hover:text-gray-200 transition duration-150"}>
                        Home
                    </Link>
                    <Link to="/communities" className={"text-2xl font-bold text-white ml-4 hover:text-gray-200 transition duration-150"}>
                        Communities
                    </Link>
                </div>
                <div className={"flex justify-between items-center bg-gray-700 p-6"}>
                    {username && (
                        <>
                            <button 
                                className={"text-2xl font-bold text-white ml-4 mr-4 bg-blue-700 p-2 rounded-lg hover:bg-blue-800 cursor-pointer transition duration-150 ease-in"} 
                                onClick={()=>navigate("/create-post")}
                            >
                                Create post
                            </button>
                            <button 
                                onClick={handleLogout}
                                className={"text-2xl font-bold text-white ml-4 mr-4 bg-red-600 p-2 rounded-lg hover:bg-red-700 cursor-pointer transition duration-150 ease-in"}
                            >
                                Logout
                            </button>
                        </>
                    )}
                    <div className={"flex items-center space-x-4 bg-gray-700 p-1"}>
                        {!username ? (
                            <Link to="/login" className={"text-2xl font-bold text-white ml-4 mr-2 hover:text-gray-200 transition duration-150"}>
                                Login
                            </Link>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link 
                                    to={`/user/${userId}`}
                                    className="flex items-center space-x-2 hover:opacity-80 transition duration-150"
                                >
                                    <span className="text-xl font-medium text-white">{username}</span>
                                    <img 
                                        src={"lorem_pfp.jpg"} 
                                        alt={username} 
                                        className="rounded-full h-[40px] w-[40px] ring-2 ring-blue-500 hover:ring-blue-400 transition duration-150" 
                                    />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}