import React, { useState } from 'react';
import { MessageSquare, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const ChatList = ({
    chats,
    currentChatId,
    onChatSelect,
    onNewChat,
    onDeleteChat
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const chatsPerPage = 10;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Sort chats by updated_at (most recent first), fallback to created_at
    const sortedChats = [...chats].sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at);
        const dateB = new Date(b.updated_at || b.created_at);
        return dateB - dateA;
    });

    // Calculate pagination
    const totalPages = Math.ceil(sortedChats.length / chatsPerPage);
    const startIndex = (currentPage - 1) * chatsPerPage;
    const endIndex = startIndex + chatsPerPage;
    const currentChats = sortedChats.slice(startIndex, endIndex);

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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
                {chats.length === 0 ? (
                    <div className="empty-state">
                        <MessageSquare size={48} />
                        <p>No chats yet</p>
                        <p>Start a new conversation!</p>
                    </div>
                ) : (
                    <>
                        {currentChats.map((chat) => (
                            <div
                                key={chat.id}
                                className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
                                onClick={() => onChatSelect(chat.id)}
                            >
                                <div className="chat-item-content">
                                    <div className="chat-title">{chat.title}</div>
                                    <div className="chat-meta">
                                        <span className="chat-provider">{chat.model_provider}</span>
                                        <span className="chat-time">{formatTime(chat.updated_at || chat.created_at)}</span>
                                        <span className="chat-date">{formatDate(chat.updated_at || chat.created_at)}</span>
                                    </div>
                                    <div className="chat-message-count">
                                        {chat.message_count} messages
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