import React, { useState, useEffect, useMemo } from 'react';
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
    const [thinkMode, setThinkMode] = useState(false);
    const [deepResearchMode, setDeepResearchMode] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
    const [isStreaming, setIsStreaming] = useState(false); // Add streaming flag
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Load chats on component mount
    useEffect(() => {
        loadChats();
    }, []);

    // Load messages when current chat changes
    useEffect(() => {
        if (currentChat && currentChat.id) {
            // Don't reload messages if we're currently streaming
            if (isStreaming) {
                return;
            }
            loadMessages(currentChat.id);
        } else {
            setMessages([]);
        }
    }, [currentChat, isStreaming]);

    const loadChats = async (page = 1) => {
        try {
            const skip = (page - 1) * 50; // 50 chats per page
            const chatsData = await chatAPI.getChats(skip, 50);
            // Handle both array and object response formats
            const chatsArray = Array.isArray(chatsData) ? chatsData : (chatsData?.chats || []);
            setChats(chatsArray);

            // Calculate total pages
            if (chatsData?.total) {
                const total = chatsData.total;
                const calculatedTotalPages = Math.ceil(total / 50);
                setTotalPages(calculatedTotalPages);
                setCurrentPage(page);
            }
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
            // Load messages for the selected chat
            await loadMessages(chatId);
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
        setIsStreaming(true); // Set streaming flag

        try {
            let chatId = currentChat && currentChat.id ? currentChat.id : null;

            // If no chat exists, create one first
            if (!chatId) {
                try {
                    // Determine provider based on selected model
                    const availableModels = [
                        { id: 'gpt-3.5-turbo', provider: 'openai' },
                        { id: 'gpt-4', provider: 'openai' },
                        { id: 'gpt-4-turbo', provider: 'openai' },
                        { id: 'grok-4-0709', provider: 'xai' },
                        { id: 'grok-3', provider: 'xai' }
                    ];
                    const modelInfo = availableModels.find(m => m.id === selectedModel);
                    const provider = modelInfo ? modelInfo.provider : 'openai';

                    const newChat = await chatAPI.createChat({
                        title: 'New Chat',
                        model_provider: provider,
                        model_name: selectedModel
                    });
                    chatId = newChat.id;
                    setCurrentChat(newChat);
                } catch (createError) {
                    console.error('Failed to create chat:', createError);
                    setError('Failed to create new chat');
                    setIsLoading(false);
                    return;
                }
            }

            // Determine provider based on selected model
            const availableModels = [
                { id: 'gpt-3.5-turbo', provider: 'openai' },
                { id: 'gpt-4', provider: 'openai' },
                { id: 'gpt-4-turbo', provider: 'openai' },
                { id: 'grok-4-0709', provider: 'xai' },
                { id: 'grok-3', provider: 'xai' }
            ];

            const modelInfo = availableModels.find(m => m.id === selectedModel);
            const provider = modelInfo ? modelInfo.provider : 'openai';

            // Create message data with all required parameters
            const messagePayload = {
                content: messageData,
                model_provider: provider,
                model_name: selectedModel,
                think_mode: thinkMode,
                deep_research_mode: deepResearchMode
            };

            // Create a temporary user message
            const tempUserMessage = {
                id: Date.now(), // Temporary ID
                role: 'user',
                content: messageData,
                created_at: new Date().toISOString(),
            };

            // Create a temporary streaming message
            const tempStreamingMessage = {
                id: Date.now() + 1, // Temporary ID
                role: 'assistant',
                content: '',
                created_at: new Date().toISOString(),
                isStreaming: true,
                isStreamingMessage: true // Additional identifier
            };

            // Add both messages immediately
            setMessages(prevMessages => [...prevMessages, tempUserMessage, tempStreamingMessage]);

            // Use streaming API with better error handling
            try {
                await chatAPI.sendMessageStream(
                    chatId,
                    messagePayload,
                    // onChunk - handle each chunk
                    (chunk) => {
                        setMessages(prevMessages => {
                            const updatedMessages = prevMessages.map(msg => {
                                if (msg.isStreamingMessage) {
                                    return { ...msg, content: msg.content + chunk };
                                }
                                return msg;
                            });
                            return updatedMessages;
                        });
                    },
                    // onComplete - handle completion
                    (completeMessage) => {
                        // Replace the streaming message with the complete message
                        setMessages(prevMessages => {
                            const updatedMessages = prevMessages.map(msg => {
                                if (msg.isStreamingMessage) {
                                    return {
                                        ...msg,
                                        isStreaming: false,
                                        // Use the accumulated content from streaming
                                        content: msg.content,
                                        // Keep the existing ID
                                        id: msg.id
                                    };
                                }
                                return msg;
                            });
                            return updatedMessages;
                        });

                        // Reload chats to update the list with new chats
                        loadChats();
                    },
                    // onError - handle errors
                    (errorMessage) => {
                        console.error('Streaming error:', errorMessage);
                        setError(`Failed to send message: ${errorMessage}`);
                        // Remove the streaming message on error
                        setMessages(prevMessages =>
                            prevMessages.filter(msg => !msg.isStreamingMessage) // Changed from msg.isStreaming to msg.isStreamingMessage
                        );
                    }
                );
            } catch (streamError) {
                console.error('Streaming failed, falling back to regular endpoint:', streamError);

                // Fallback to regular endpoint
                const response = await chatAPI.sendMessage(chatId, messagePayload);

                // Replace the streaming message with the complete response
                setMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.isStreamingMessage ? response : msg // Changed from msg.isStreaming to msg.isStreamingMessage
                    )
                );

                // Don't reload chats here as it might trigger message reload
                // await loadChats();
            }

        } catch (err) {
            setError('Failed to send message');
            console.error('Error sending message:', err);
            // Remove the streaming message on error
            setMessages(prevMessages =>
                prevMessages.filter(msg => !msg.isStreamingMessage) // Changed from msg.isStreaming to msg.isStreamingMessage
            );
        } finally {
            setIsLoading(false);
            setIsStreaming(false); // Clear streaming flag
        }
    };

    const handlePageChange = (page) => {
        loadChats(page);
    };

    // Use messages directly (no need for allMessages calculation)
    const allMessages = messages;

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
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
                <ChatWindow
                    currentChat={currentChat}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    thinkMode={thinkMode}
                    setThinkMode={setThinkMode}
                    deepResearchMode={deepResearchMode}
                    setDeepResearchMode={setDeepResearchMode}
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                />
            </div>
        </div>
    );
}

export default App; 