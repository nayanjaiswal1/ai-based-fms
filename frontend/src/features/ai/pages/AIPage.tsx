import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { chatApi, aiApi, transactionsApi } from '@services/api';
import { Send, Bot, User, Sparkles, FileText, CheckCircle } from 'lucide-react';

export default function AIPage() {
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
            <p className="mt-1 text-sm text-gray-600">
              Natural language transactions and financial insights
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-white shadow">
        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-lg px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                {msg.action && (
                  <div className="mt-3 rounded border-t border-gray-200 pt-3">
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Action completed: {msg.action.action}</span>
                    </div>
                  </div>
                )}
                <p className="mt-1 text-xs opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {messages.length === 1 && suggestions?.data && (
          <div className="border-t p-4">
            <p className="mb-3 text-sm font-medium text-gray-700">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.data.slice(0, 4).map((suggestion: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleSuggestion(suggestion)}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message... (e.g., 'I spent $50 on groceries today')"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {sendMessageMutation.isPending ? (
                'Sending...'
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Tools Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <AIToolCard
          icon={Sparkles}
          title="Auto-Categorize"
          description="Automatically categorize uncategorized transactions"
          color="bg-purple-100 text-purple-600"
        />
        <AIToolCard
          icon={FileText}
          title="Parse Receipt"
          description="Extract transaction details from receipts"
          color="bg-green-100 text-green-600"
        />
        <AIToolCard
          icon={CheckCircle}
          title="Detect Duplicates"
          description="Find and merge duplicate transactions"
          color="bg-blue-100 text-blue-600"
        />
      </div>
    </div>
  );
}

function AIToolCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: any;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="cursor-pointer rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-lg">
      <div className={`inline-flex rounded-lg p-3 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-3 font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
  );
}
