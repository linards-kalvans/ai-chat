import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Brain, Search, Paperclip, Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import FileUpload from './FileUpload';

const ChatWindow = ({
    currentChat,
    messages,
    onSendMessage,
    isLoading,
    thinkMode,
    setThinkMode,
    deepResearchMode,
    setDeepResearchMode,
    selectedModel,
    setSelectedModel
}) => {
    const [inputValue, setInputValue] = useState('');
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [showModelSelector, setShowModelSelector] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleFileUploaded = (file) => {
        console.log('File uploaded:', file);
        // You can add a notification or update UI here
    };

    const handleFileDeleted = (fileId) => {
        console.log('File deleted:', fileId);
        // You can add a notification or update UI here
    };

    const availableModels = [
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
        { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
        { id: 'grok-4-0709', name: 'Grok-4 (July 2025)', provider: 'xai' },
        { id: 'grok-3', name: 'Grok-3', provider: 'xai' }
    ];

    return (
        <div className="chat-window">
            {/* Header */}
            <div className="chat-header">
                <h2 className="chat-title">
                    {currentChat ? currentChat.title : 'New Chat'}
                </h2>

                {/* Model Selector */}
                <div className="model-selector">
                    <button
                        className="model-selector-btn"
                        onClick={() => setShowModelSelector(!showModelSelector)}
                        title="Select AI Model"
                    >
                        <Settings className="w-4 h-4" />
                        <span>{availableModels.find(m => m.id === selectedModel)?.name || 'GPT-3.5 Turbo'}</span>
                    </button>

                    {showModelSelector && (
                        <div className="model-dropdown">
                            {availableModels.map((model) => (
                                <button
                                    key={model.id}
                                    className={`model-option ${selectedModel === model.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedModel(model.id);
                                        setShowModelSelector(false);
                                    }}
                                >
                                    {model.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mode Toggles */}
                <div className="mode-toggles">
                    <button
                        className={`mode-toggle ${thinkMode ? 'active' : ''}`}
                        onClick={() => setThinkMode(!thinkMode)}
                        title="Think Mode"
                    >
                        <Brain className="w-4 h-4" />
                        <span>Think</span>
                    </button>
                    <button
                        className={`mode-toggle ${deepResearchMode ? 'active' : ''}`}
                        onClick={() => setDeepResearchMode(!deepResearchMode)}
                        title="Deep Research Mode"
                    >
                        <Search className="w-4 h-4" />
                        <span>Research</span>
                    </button>
                </div>
            </div>

            {/* File Upload Section */}
            {showFileUpload && currentChat && (
                <div className="file-upload-section">
                    <FileUpload
                        chatId={currentChat.id}
                        onFileUploaded={handleFileUploaded}
                        onFileDeleted={handleFileDeleted}
                    />
                </div>
            )}

            {/* Messages */}
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <Bot className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-500">Start a conversation or upload files for context</p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={message.id}
                            className={`message ${message.role === 'user' ? 'user' : 'assistant'}`}
                        >
                            <div className="message-avatar">
                                {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>
                            <div className="message-content">
                                <div className="message-text">
                                    {message.role === 'assistant' ? (
                                        <div>
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    code: ({ node, inline, className, children, ...props }) => {
                                                        const match = /language-(\w+)/.exec(className || '');
                                                        return !inline ? (
                                                            <pre className="code-block">
                                                                <code className={className} {...props}>
                                                                    {children}
                                                                </code>
                                                            </pre>
                                                        ) : (
                                                            <code className="inline-code" {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    },
                                                    a: ({ children, href }) => (
                                                        <a href={href} target="_blank" rel="noopener noreferrer">
                                                            {children}
                                                        </a>
                                                    ),
                                                    blockquote: ({ children }) => (
                                                        <blockquote className="blockquote">
                                                            {children}
                                                        </blockquote>
                                                    ),
                                                    table: ({ children }) => (
                                                        <div className="table-container">
                                                            <table>{children}</table>
                                                        </div>
                                                    )
                                                }}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                            {message.isStreaming && <span className="typing-cursor">|</span>}
                                        </div>
                                    ) : (
                                        <div>
                                            {/* Simple text rendering for user messages */}
                                            <span>{message.content}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="message-time">
                                    {formatTime(message.created_at)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {isLoading && !messages.some(m => m.isStreaming) && (
                    <div className="message assistant">
                        <div className="message-avatar">
                            <Bot size={20} />
                        </div>
                        <div className="message-content">
                            <div className="message-text">
                                <span className="typing-cursor">|</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="input-area">
                <form onSubmit={handleSubmit} className="input-form">
                    <div className="input-container">
                        {/* File Upload Toggle */}
                        {currentChat && (
                            <button
                                type="button"
                                className={`file-upload-btn ${showFileUpload ? 'active' : ''}`}
                                onClick={() => setShowFileUpload(!showFileUpload)}
                                title="Upload files for context"
                            >
                                <Paperclip className="w-4 h-4" />
                            </button>
                        )}

                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type your message..."
                            className="message-input"
                            disabled={isLoading}
                        />

                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            className="send-button"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;