import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { chatApi } from '@services/api';
import { Send, Bot, User, X, MessageCircle, Minimize2, CheckCircle } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FeatureFlag } from '@/config/features.config';

export default function AIChatbot() {
  const { hasAccess } = useFeatureAccess(FeatureFlag.AI_ASSISTANT);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [conversationId] = useState(() => `conv-${Date.now()}`);
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI financial assistant. I can help you:\n\n• Create transactions naturally (e.g., "I spent $50 on groceries")\n• Categorize your transactions automatically\n• Parse receipts and extract transaction details\n• Answer questions about your finances\n\nWhat would you like to do?',
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: suggestions } = useQuery({
    queryKey: ['chat-suggestions'],
    queryFn: chatApi.getSuggestions,
    enabled: isOpen && hasAccess,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: any) => chatApi.sendMessage(data),
    onSuccess: (response) => {
      const assistantMessage = {
        role: 'assistant',
        content: response.data.message,
        action: response.data.action,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
  });

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');

    await sendMessageMutation.mutateAsync({
      message,
      conversationId,
    });
  };

  const handleSuggestion = (suggestion: string) => {
    setMessage(suggestion);
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Don't render if user doesn't have access
  if (!hasAccess) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-110 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex w-96 flex-col rounded-lg bg-white shadow-2xl transition-all ${
            isMinimized ? 'h-14' : 'h-[600px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-lg bg-blue-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="rounded p-1 hover:bg-blue-700"
                aria-label={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 hover:bg-blue-700"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      {msg.action && (
                        <div className="mt-2 rounded border-t border-gray-200 pt-2">
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            <span>Action: {msg.action.action}</span>
                          </div>
                        </div>
                      )}
                      <p className="mt-1 text-xs opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestions */}
              {messages.length === 1 && suggestions?.data && (
                <div className="border-t px-4 py-3">
                  <p className="mb-2 text-xs font-medium text-gray-700">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.data.slice(0, 3).map((suggestion: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestion(suggestion)}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
