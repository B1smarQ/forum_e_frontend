import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Client } from '@stomp/stompjs';

interface IMessage {
  ID: number;
  sender: string;
  content: string;
  timestamp: string; // ISO 8601 with timezone, e.g., '2025-06-20T08:28:36.795+00:00'
}

export default function GlobalChat() {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const clientRef = useRef(null);
  const ws = useRef<WebSocket | null>(null);
  const username = localStorage.getItem('username') || '';
  const isConnecting = useRef(false);

  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 3000,
      onConnect: () => {
        setIsConnected(true);
        setError('');
        client.subscribe('/topic/messages', (message) => {
          try {
            const msg = JSON.parse(message.body);
            console.log(msg)
            setMessages(prev => [...prev, msg]);
          } catch (e) {
            console.error('Error parsing message:', e);
          }
        });
      },
      onStompError: (frame) => {
        setError('STOMP error: ' + frame.headers['message']);
      },
      onWebSocketError: (event) => {
        setError('WebSocket error');
      },
      onDisconnect: () => {
        setIsConnected(false);
        setError('Disconnected');
      }
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !username) return;

    try {
      clientRef.current.publish({
        destination: '/app/chat', // if you have a @MessageMapping("/chat") on the backend
        body: JSON.stringify({ content: newMessage, sender: username })
      });

      setNewMessage('');
      // Message will be added to the list through WebSocket
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const formatTime = (timeString: string) => {
    // Accepts ISO 8601 with timezone, e.g., '2025-06-20T08:28:36.795+00:00'
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
              className={`flex ${message.sender === username ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${message.sender === username
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
                  }`}
              >
                {message.sender !== username && (
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    {message.sender || 'Unknown User'}
                  </p>
                )}
                <p className="text-sm">{message.content || 'Empty message'}</p>
                <p className={`text-xs mt-1 ${message.sender === username
                  ? 'text-blue-100'
                  : 'text-gray-500'
                  }`}>
                  {formatTime(message.timestamp)}
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
