import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const chatAPI = {
    // Get all chats
    getChats: async (skip = 0, limit = 50) => {
        const response = await api.get(`/api/chats?skip=${skip}&limit=${limit}`);
        return response.data;
    },

    // Get specific chat with messages
    getChat: async (chatId) => {
        const response = await api.get(`/api/chats/${chatId}`);
        return response.data;
    },

    // Create new chat
    createChat: async (chatData) => {
        const response = await api.post('/api/chats/', chatData);
        return response.data;
    },

    // Delete chat
    deleteChat: async (chatId) => {
        const response = await api.delete(`/api/chats/${chatId}`);
        return response.data;
    },

    // Get messages for a chat
    getMessages: async (chatId) => {
        const response = await api.get(`/api/chats/${chatId}/messages`);
        return response.data;
    },

    // Send message to AI (non-streaming)
    sendMessage: async (chatId, messageData) => {
        const response = await api.post(`/api/chats/${chatId}/messages`, messageData);
        return response.data;
    },

    // Send message to AI with streaming
    sendMessageStream: async (chatId, messageData, onChunk, onComplete, onError) => {
        try {
            console.log('Starting streaming request...');
            const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}/messages/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Streaming response received, starting to read...');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    console.log('Stream complete');
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // Process complete lines
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine && trimmedLine.startsWith('data: ')) {
                        try {
                            const jsonStr = trimmedLine.slice(6);
                            const data = JSON.parse(jsonStr);
                            console.log('Stream data:', data);

                            if (data.content) {
                                // This is a content chunk
                                console.log('Chunk received:', data.content);
                                if (onChunk && data.content) {
                                    onChunk(data.content);
                                }
                            } else if (data.done) {
                                // Stream is complete
                                console.log('Stream complete');
                                if (onComplete) {
                                    // Call onComplete with the accumulated content
                                    onComplete({ done: true });
                                }
                                return;
                            } else if (data.error) {
                                // Error occurred
                                console.error('Stream error:', data.error);
                                if (onError) {
                                    onError(data.error);
                                }
                                return;
                            }
                        } catch (e) {
                            console.error('Error parsing stream data:', e, 'Line:', trimmedLine);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Streaming error:', error);
            if (onError) {
                onError(error.message);
            }
        }
    },
};

export default api; 