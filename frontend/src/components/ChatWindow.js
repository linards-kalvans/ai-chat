import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Brain, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatWindow = ({
    currentChat,
    messages,
    onSendMessage,
    isLoading
}) => {
    const [inputMessage, setInputMessage] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('openai');
    const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
    const [thinkingMode, setThinkingMode] = useState(false);
    const [deepResearchMode, setDeepResearchMode] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Update selected provider and model when currentChat changes
    useEffect(() => {
        if (currentChat) {
            setSelectedProvider(currentChat.model_provider || 'openai');
            setSelectedModel(currentChat.model_name || 'gpt-3.5-turbo');
        }
    }, [currentChat]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        // Build the message content based on selected modes
        let enhancedContent = inputMessage;

        if (thinkingMode) {
            enhancedContent = `[THINKING MODE] Please think through this step by step: ${inputMessage}`;
        }

        if (deepResearchMode) {
            enhancedContent = `[DEEP RESEARCH MODE] Please provide a comprehensive, well-researched response with detailed analysis: ${inputMessage}`;
        }

        if (thinkingMode && deepResearchMode) {
            enhancedContent = `[THINKING + DEEP RESEARCH MODE] Please think through this step by step and provide a comprehensive, well-researched response with detailed analysis: ${inputMessage}`;
        }

        const messageData = {
            content: enhancedContent,
            provider: selectedProvider,
            model: selectedModel,
            thinkingMode,
            deepResearchMode
        };

        await onSendMessage(messageData);
        setInputMessage('');
        // Reset modes after sending
        setThinkingMode(false);
        setDeepResearchMode(false);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getModelOptions = (provider) => {
        if (provider === 'openai') {
            return [
                { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
                { value: 'gpt-4', label: 'GPT-4' },
                { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' }
            ];
        } else if (provider === 'xai') {
            return [
                { value: 'grok-3', label: 'Grok-3 (Recommended)' },
                { value: 'grok-3-mini', label: 'Grok-3 Mini (Fast)' },
                { value: 'grok-4-0709', label: 'Grok-4 (Experimental)' }
            ];
        }
        return [];
    };

    // Show chat interface if we have a currentChat (including new chat with id: null)
    if (currentChat) {
        return (
            <div className="chat-window">
                <div className="chat-header">
                    <div className="chat-info">
                        <h3>{currentChat.title}</h3>
                        <span className="chat-model">
                            {currentChat.model_provider} - {currentChat.model_name}
                        </span>
                    </div>
                    <div className="model-selector">
                        <select
                            value={selectedProvider}
                            onChange={(e) => {
                                setSelectedProvider(e.target.value);
                                setSelectedModel(getModelOptions(e.target.value)[0]?.value || '');
                            }}
                        >
                            <option value="openai">OpenAI</option>
                            <option value="xai">xAI</option>
                        </select>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                        >
                            {getModelOptions(selectedProvider).map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="messages-container">
                    {messages.length === 0 ? (
                        <div className="empty-chat">
                            <Bot size={64} />
                            <h3>Start a conversation</h3>
                            <p>Send a message to begin chatting with {selectedProvider}!</p>
                        </div>
                    ) : (
                        messages.map((message) => (
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
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    // Custom styling for code blocks
                                                    code: ({ node, inline, className, children, ...props }) => {
                                                        const match = /language-(\w+)/.exec(className || '');
                                                        return !inline && match ? (
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
                                                    // Custom styling for tables
                                                    table: ({ children }) => (
                                                        <div className="table-container">
                                                            <table>{children}</table>
                                                        </div>
                                                    ),
                                                    // Custom styling for blockquotes
                                                    blockquote: ({ children }) => (
                                                        <blockquote className="blockquote">
                                                            {children}
                                                        </blockquote>
                                                    )
                                                }}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        ) : (
                                            message.content
                                        )}
                                    </div>
                                    <div className="message-time">
                                        {formatTime(message.created_at)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="message assistant">
                            <div className="message-avatar">
                                <Bot size={20} />
                            </div>
                            <div className="message-content">
                                <div className="message-text">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Thinking and Research Mode Toggles */}
                <div className="mode-toggles">
                    <button
                        type="button"
                        className={`mode-toggle ${thinkingMode ? 'active' : ''}`}
                        onClick={() => setThinkingMode(!thinkingMode)}
                        disabled={isLoading}
                        title="Enable thinking mode for step-by-step reasoning"
                    >
                        <Brain size={16} />
                        <span>Think</span>
                    </button>
                    <button
                        type="button"
                        className={`mode-toggle ${deepResearchMode ? 'active' : ''}`}
                        onClick={() => setDeepResearchMode(!deepResearchMode)}
                        disabled={isLoading}
                        title="Enable deep research mode for comprehensive analysis"
                    >
                        <Search size={16} />
                        <span>Deep Research</span>
                    </button>
                </div>

                <form className="message-input" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message..."
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={!inputMessage.trim() || isLoading}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        );
    }

    // Show welcome message when no chat is selected
    return (
        <div className="chat-window">
            <div className="no-chat-selected">
                <Bot size={64} />
                <h3>Welcome to AI Chat</h3>
                <p>Select a chat from the sidebar or start a new conversation!</p>
            </div>
        </div>
    );
};

export default ChatWindow; 