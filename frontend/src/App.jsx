import React, { useState, useEffect, useRef } from 'react';
import { Send, ExternalLink, Trash2, MessageCircle } from 'lucide-react';

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Storage utilities
  const STORAGE_KEY = 'metaGyankosh_chat_history';

  const saveChatHistory = (msgs) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  };

  const loadChatHistory = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load chat history:', error);
      return [];
    }
  };

  const clearChatHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
    }
  };

  // API call to backend
  const sendMessage = async (message, userId = 'user') => {
    try {
      const response = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: message,
          user_id: userId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.answer;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };

  // Load chat history on component mount
  useEffect(() => {
    const history = loadChatHistory();
    setMessages(history);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [currentMessage]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage('');

    // Add user message
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);

    // Set loading state
    setIsLoading(true);

    try {
      const response = await sendMessage(userMessage);
      
      // Add assistant response
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } catch (error) {
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      clearChatHistory();
    }
  };

  const resources = [
    { name: 'IITKGP ERP', url: 'https://erp.iitkgp.ac.in/' },
    { name: 'GitHub Repository', url: 'https://github.com/Bikram-ghuku/metaGyankosh' },
    { name: 'metaKGP Wiki', url: 'http://wiki.metakgp.org/' },
    { name: 'metaKGP', url: 'hhttps://metakgp.org/' }
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200">
      {/* Sidebar */}
      <div className="w-72 bg-gray-900 border-r border-gray-800 p-6 overflow-y-auto">
        {/* Logo */}
        <div className="text-2xl font-bold mb-8 text-indigo-400">
          metaGyankosh
        </div>

        {/* Resources */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Resources
          </h3>
          <div className="space-y-2">
            {resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-gray-800 hover:bg-gray-800 hover:border-indigo-500 transition-all duration-200 text-sm"
              >
                <span>{resource.name}</span>
                <ExternalLink className="w-4 h-4 text-gray-500" />
              </a>
            ))}
          </div>
        </div>

        {/* Clear History Button */}
        <button
          onClick={handleClearHistory}
          className="w-full flex items-center justify-center gap-2 p-3 border border-gray-800 rounded-lg hover:bg-gray-800 hover:text-red-400 transition-all duration-200 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Clear History
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-400" />
            Knowledge Assistant
          </h1>
        </div>

        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-6"
        >
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-16">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-700" />
              <p className="text-lg mb-2">Welcome to metaGyankosh</p>
              <p className="text-sm">Ask me anything to get started!</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-3xl ${message.type === 'user' ? 'ml-auto' : ''}`}
            >
              <div className="text-xs text-gray-500 mb-2">
                {message.type === 'user' ? 'You' : 'Assistant'}
              </div>
              <div
                className={`p-4 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-gray-800 border border-gray-700 rounded-bl-sm'
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {/* Loading message */}
          {isLoading && (
            <div className="max-w-3xl">
              <div className="text-xs text-gray-500 mb-2">Assistant</div>
              <div className="p-4 rounded-2xl bg-gray-800 border border-gray-700 rounded-bl-sm">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-gray-900 border-t border-gray-800 p-4">
          <div className="flex gap-3 w-full">
            <textarea
              ref={textareaRef}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 p-4 bg-gray-800 border border-gray-700 rounded-2xl text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500 transition-colors w-full resize-none overflow-hidden"
              rows={1}
              style={{ minHeight: '56px', maxHeight: '120px' }}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isLoading}
              className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-2xl font-semibold transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;