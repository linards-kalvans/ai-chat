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
    getChats: async () => {
        const response = await api.get('/api/chats/');
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

    // Send message to AI
    sendMessage: async (chatId, messageData) => {
        const response = await api.post(`/api/chats/${chatId}/messages`, messageData);
        return response.data;
    },
};

export default api; 