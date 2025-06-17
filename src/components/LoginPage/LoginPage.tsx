import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [loginMethod, setLoginMethod] = useState<'username' | 'email'>('username');
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleLogin();
    }

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }

    const handleLogin = async () => {
        try {
            const payload = loginMethod === 'username' 
                ? { username, password }
                : { email, password };

            const response = await axios.post("http://localhost:8081/api/v1/auth/login", payload);
            console.log(response);
            if(response.status === 200){
                localStorage.setItem("username", response.data.user.username)
                localStorage.setItem("token", response.data.token)
                localStorage.setItem("userId", response.data.user.id)
                navigate("/")
            }
            // TODO: Handle successful login (e.g., store token, redirect)
        } catch (error) {
            console.error("Login failed:", error);
            //localStorage.setItem("username", username)
            //localStorage.setItem("token", "testToken")
            //navigate("/")
            // TODO: Handle login error (e.g., show error message)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                        <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
                    </div>

                    {/* Login Method Toggle */}
                    <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                        <button
                            type="button"
                            onClick={() => setLoginMethod('username')}
                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                                loginMethod === 'username'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Username
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginMethod('email')}
                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                                loginMethod === 'email'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Email
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {loginMethod === 'username' ? (
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                                    onChange={handleUsernameChange}
                                    value={username}
                                />
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                                    onChange={handleEmailChange}
                                    value={email}
                                />
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                                onChange={handlePasswordChange}
                                value={password}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                            <a href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                Forgot password?
                            </a>
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 transform hover:scale-[1.02]"
                        >
                            Sign In
                        </button>
                    </form>
                    
                    <p className="text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
} 