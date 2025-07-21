import React, { useState } from 'react';
import { MessageSquare, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const ChatList = ({
    chats,
    currentChatId,
    onChatSelect,
    onNewChat,
    onDeleteChat,
    currentPage,
    totalPages,
    onPageChange
}) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatProvider = (provider) => {
        const providerMap = {
            'openai': 'OpenAI',
            'xai': 'xAI'
        };
        return providerMap[provider] || provider;
    };

    // Ensure chats is an array and handle different response formats
    const chatsArray = Array.isArray(chats) ? chats : (chats?.chats || []);

    const goToPage = (page) => {
        if (onPageChange) {
            onPageChange(page);
        }
    };

    const goToPreviousPage = () => {
        goToPage(currentPage - 1);
    };

    const goToNextPage = () => {
        goToPage(currentPage + 1);
    };

    return (
        <div className="chat-list">
            <div className="chat-list-header">
                <h2>Chats</h2>
                <button
                    className="new-chat-btn"
                    onClick={onNewChat}
                    title="New Chat"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="chat-list-content">
                {chatsArray.length === 0 ? (
                    <div className="empty-state">
                        <MessageSquare size={48} />
                        <p>No chats yet</p>
                        <p>Start a new conversation!</p>
                    </div>
                ) : (
                    <>
                        {chatsArray.map((chat) => (
                            <div
                                key={chat.id}
                                className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
                                onClick={() => onChatSelect(chat.id)}
                            >
                                <div className="chat-item-content">
                                    <div className="chat-title">{chat.title}</div>
                                    <div className="chat-meta">
                                        <span className="chat-provider">{formatProvider(chat.model_provider)}</span>
                                        <span className="chat-model">{chat.model_name}</span>
                                        <span className="chat-time">{formatTime(chat.updated_at || chat.created_at)}</span>
                                        <span className="chat-date">{formatDate(chat.updated_at || chat.created_at)}</span>
                                    </div>
                                    <div className="chat-message-count">
                                        {chat.message_count || 0} messages
                                    </div>
                                </div>
                                <button
                                    className="delete-chat-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteChat(chat.id);
                                    }}
                                    title="Delete Chat"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="chat-pagination">
                                <button
                                    className="pagination-btn"
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 1}
                                    title="Previous page"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="pagination-info">
                                    {currentPage} of {totalPages}
                                </span>
                                <button
                                    className="pagination-btn"
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    title="Next page"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatList; 