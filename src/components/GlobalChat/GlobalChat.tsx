import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

interface IMessage {
    ID: number;
    Sender: string;
    Content: string;
    Timestamp: string;
}

export default function GlobalChat() {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState('');
    const ws = useRef<WebSocket | null>(null);
    const username = localStorage.getItem('username') || '';
    const isConnecting = useRef(false);

    useEffect(() => {
        // Initialize WebSocket connection
        const initializeWebSocket = async () => {
            // Prevent multiple connection attempts
            if (isConnecting.current || ws.current?.readyState === WebSocket.OPEN) {
                return;
            }

            isConnecting.current = true;

            try {
                // Close existing connection if any
                if (ws.current) {
                    ws.current.close();
                    ws.current = null;
                }

                // Connect to WebSocket
                ws.current = new WebSocket('ws://localhost:8082/ws');
                
                ws.current.onopen = () => {
                    setIsConnected(true);
                    setError('');
                    isConnecting.current = false;
                };

                ws.current.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        setMessages(prev => {
                            const messageExists = prev.some(m => m.ID === message.ID);
                            if (messageExists) {
                                return prev;
                            }
                            return [...prev, message];
                        });
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                };

                ws.current.onclose = () => {
                    setIsConnected(false);
                    setError('Connection lost. Reconnecting...');
                    isConnecting.current = false;
                    // Attempt to reconnect after 3 seconds
                    setTimeout(initializeWebSocket, 3000);
                };

                ws.current.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setError('Connection error. Please try again later.');
                    isConnecting.current = false;
                };
            } catch (error) {
                console.error('Failed to initialize chat:', error);
                setError('Failed to initialize chat. Please try again later.');
                isConnecting.current = false;
            }
        };

        initializeWebSocket();

        // Cleanup function
        return () => {
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
            isConnecting.current = false;
        };
    }, []); // Empty dependency array to ensure it only runs once

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !username) return;

        try {
            const response = await axios.post('http://localhost:8082/send', {
                content: newMessage.trim(),
                sender: username
            });

            setNewMessage('');
            // Message will be added to the list through WebSocket
        } catch (error) {
            console.error('Failed to send message:', error);
            setError('Failed to send message. Please try again.');
        }
    };

    const formatTime = (timeString: string) => {
        try {
            const date = new Date(timeString);
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Invalid time';
            }
            return new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (error) {
            console.error('Error formatting time:', error);
            return 'Invalid time';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Global Chat</h2>
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm text-gray-600">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="px-6 py-2 bg-red-50 border-b border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                    // Validate message object
                    if (!message || typeof message !== 'object') {
                        console.error('Invalid message object:', message);
                        return null;
                    }

                    return (
                        <div 
                            key={message.ID || Math.random().toString()}
                            className={`flex ${message.Sender === username ? 'justify-end' : 'justify-start'}`}
                        >
                            <div 
                                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                    message.Sender === username 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-100 text-gray-900'
                                }`}
                            >
                                {message.Sender !== username && (
                                    <p className="text-xs font-medium text-gray-500 mb-1">
                                        {message.Sender || 'Unknown User'}
                                    </p>
                                )}
                                <p className="text-sm">{message.Content || 'Empty message'}</p>
                                <p className={`text-xs mt-1 ${
                                    message.Sender === username 
                                        ? 'text-blue-100' 
                                        : 'text-gray-500'
                                }`}>
                                    {formatTime(message.Timestamp)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-4">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!isConnected}
                    />
                    <button
                        type="submit"
                        disabled={!isConnected || !newMessage.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
} 