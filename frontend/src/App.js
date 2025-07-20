import React, { useState, useEffect } from 'react';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import { chatAPI } from './services/api';
import './App.css';

function App() {
    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load chats on component mount
    useEffect(() => {
        loadChats();
    }, []);

    // Load messages when current chat changes
    useEffect(() => {
        if (currentChat && currentChat.id) {
            loadMessages(currentChat.id);
        } else {
            setMessages([]);
        }
    }, [currentChat]);

    const loadChats = async () => {
        try {
            const chatsData = await chatAPI.getChats();
            setChats(chatsData);
        } catch (err) {
            setError('Failed to load chats');
            console.error('Error loading chats:', err);
        }
    };

    const loadMessages = async (chatId) => {
        try {
            const messagesData = await chatAPI.getMessages(chatId);
            setMessages(messagesData);
        } catch (err) {
            setError('Failed to load messages');
            console.error('Error loading messages:', err);
        }
    };

    const handleChatSelect = async (chatId) => {
        try {
            const chatData = await chatAPI.getChat(chatId);
            setCurrentChat(chatData);
        } catch (err) {
            setError('Failed to load chat');
            console.error('Error loading chat:', err);
        }
    };

    const handleNewChat = () => {
        // Create a temporary chat object for new chat interface
        setCurrentChat({
            id: null,
            title: 'New Chat',
            model_provider: 'openai',
            model_name: 'gpt-3.5-turbo'
        });
        setMessages([]);
    };

    const handleDeleteChat = async (chatId) => {
        try {
            await chatAPI.deleteChat(chatId);
            await loadChats();

            // If deleted chat was current, clear current chat
            if (currentChat && currentChat.id === chatId) {
                setCurrentChat(null);
                setMessages([]);
            }
        } catch (err) {
            setError('Failed to delete chat');
            console.error('Error deleting chat:', err);
        }
    };

    const handleSendMessage = async (messageData) => {
        setIsLoading(true);
        setError(null);

        try {
            const chatId = currentChat && currentChat.id ? currentChat.id : 0;
            const response = await chatAPI.sendMessage(chatId, messageData);

            // If this was a new chat, update current chat with the created chat data
            if (!currentChat || !currentChat.id) {
                setCurrentChat(response.chat);
            }

            // Append new messages to existing conversation
            setMessages(prevMessages => [...prevMessages, response.message, response.assistant_response]);

            // Reload chats to update the list, but maintain current chat selection
            await loadChats();

        } catch (err) {
            setError('Failed to send message');
            console.error('Error sending message:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app">
            {error && (
                <div className="error-banner">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            <div className="app-container">
                <ChatList
                    chats={chats}
                    currentChatId={currentChat?.id}
                    onChatSelect={handleChatSelect}
                    onNewChat={handleNewChat}
                    onDeleteChat={handleDeleteChat}
                />
                <ChatWindow
                    currentChat={currentChat}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}

export default App; 