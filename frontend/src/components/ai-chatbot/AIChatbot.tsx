import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi, transactionsApi, accountsApi } from '@services/api';
import { Send, Bot, User, X, Minimize2, CheckCircle, Paperclip, Loader2 } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FeatureFlag } from '@/config/features.config';
import DocumentUploadZone from './DocumentUploadZone';
import ExtractedDataCard from './ExtractedDataCard';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  action?: any;
  extractedData?: any;
  fileInfo?: any;
}

export default function AIChatbot() {
  const queryClient = useQueryClient();
  const { hasAccess } = useFeatureAccess(FeatureFlag.AI_ASSISTANT);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [conversationId] = useState(() => `conv-${Date.now()}`);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('ocr_space');
  const [processingStage, setProcessingStage] = useState<'idle' | 'uploading' | 'processing' | 'extracting' | 'done'>('idle');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI financial assistant. I can help you:\n\n• Create transactions naturally (e.g., "I spent $50 on groceries")\n• Upload and process receipts/invoices\n• Categorize your transactions automatically\n• Answer questions about your finances\n\nWhat would you like to do?',
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: suggestions } = useQuery({
    queryKey: ['chat-suggestions'],
    queryFn: chatApi.getSuggestions,
    enabled: isOpen && hasAccess,
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
    enabled: isOpen && hasAccess,
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: ({ file, provider }: { file: File; provider?: string }) => {
      setProcessingStage('uploading');
      return chatApi.uploadDocument(file, conversationId, undefined, provider);
    },
    onSuccess: (response) => {
      setProcessingStage('done');

      // Add user message showing file uploaded
      const userMessage: Message = {
        role: 'user',
        content: `📎 Uploaded: ${response.data.fileInfo.fileName}`,
        timestamp: new Date(),
        fileInfo: response.data.fileInfo,
      };

      // Add assistant message with extracted data
      const assistantMessage: Message = {
        role: 'assistant',
        content: 'I\'ve extracted the transaction details from your document. Please review and confirm:',
        timestamp: new Date(),
        extractedData: response.data.extractedData,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setShowUpload(false);
      setProcessingStage('idle');
    },
    onError: (error: any) => {
      setProcessingStage('idle');
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I couldn't process the document. ${error.response?.data?.message || 'Please try again.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setShowUpload(false);
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data: any) => transactionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      const successMessage: Message = {
        role: 'assistant',
        content: '✅ Transaction added successfully!',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);
    },
    onError: (error: any) => {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Failed to create transaction: ${error.response?.data?.message || 'Please try again.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: any) => chatApi.sendMessage(data),
    onSuccess: (response) => {
      const assistantMessage: Message = {
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

    const userMessage: Message = {
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

  const handleFileSelected = async (file: File, provider?: string) => {
    setProcessingStage('processing');

    // Simulate progress stages
    setTimeout(() => setProcessingStage('extracting'), 1000);

    await uploadDocumentMutation.mutateAsync({ file, provider: provider || selectedProvider });
  };

  const handleConfirmTransaction = async (extractedData: any) => {
    // Get the last message with extracted data to update it
    const updatedMessages = messages.map((msg, index) => {
      if (index === messages.length - 1 && msg.extractedData) {
        return { ...msg, extractedData: null }; // Remove extracted data card
      }
      return msg;
    });
    setMessages(updatedMessages);

    // Find the file info from the previous message
    const fileMessage = messages.find(msg => msg.fileInfo);
    const filePath = fileMessage?.fileInfo?.filePath;

    // Get default account (first account)
    const defaultAccount = accounts?.data?.[0];

    if (!defaultAccount) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Please create at least one account first before adding transactions.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // Create transaction
    const transactionData = {
      description: extractedData.description,
      amount: extractedData.amount,
      type: extractedData.type || 'expense',
      date: extractedData.date || new Date().toISOString().split('T')[0],
      accountId: defaultAccount.id,
      categoryId: extractedData.categoryId,
      notes: extractedData.items ? `Items: ${extractedData.items.join(', ')}` : null,
      attachments: filePath ? [filePath] : [],
      metadata: {
        source: 'document_upload',
        merchantName: extractedData.merchantName,
        confidence: extractedData.confidence,
      },
    };

    await createTransactionMutation.mutateAsync(transactionData);
  };

  const handleCancelExtraction = () => {
    // Remove the last message with extracted data
    setMessages((prev) => prev.filter((msg, index) => index !== prev.length - 1 || !msg.extractedData));

    const cancelMessage: Message = {
      role: 'assistant',
      content: 'No problem! Is there anything else I can help you with?',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, cancelMessage]);
  };

  const handleSuggestion = (suggestion: string) => {
    setMessage(suggestion);
  };

  const toggleUpload = () => {
    setShowUpload(!showUpload);
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Simulate processing stages
  useEffect(() => {
    if (processingStage === 'uploading') {
      setTimeout(() => setProcessingStage('processing'), 500);
    } else if (processingStage === 'processing') {
      setTimeout(() => setProcessingStage('extracting'), 1500);
    }
  }, [processingStage]);

  // Don't render if user doesn't have access
  if (!hasAccess) {
    return null;
  }

  const getProcessingMessage = () => {
    switch (processingStage) {
      case 'uploading':
        return 'Uploading document...';
      case 'processing':
        return 'Processing document...';
      case 'extracting':
        return 'Extracting transaction data...';
      default:
        return '';
    }
  };

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
                  <div key={index}>
                    <div
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

                    {/* Extracted Data Card */}
                    {msg.extractedData && (
                      <div className="ml-9 mt-2">
                        <ExtractedDataCard
                          data={msg.extractedData}
                          onConfirm={handleConfirmTransaction}
                          onCancel={handleCancelExtraction}
                          isSubmitting={createTransactionMutation.isPending}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* Processing Indicator */}
                {processingStage !== 'idle' && processingStage !== 'done' && (
                  <div className="flex items-start gap-2">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    </div>
                    <div className="rounded-lg bg-gray-100 px-3 py-2">
                      <p className="text-sm text-gray-900">{getProcessingMessage()}</p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Upload Zone */}
              {showUpload && (
                <div className="border-t px-4 py-3">
                  <DocumentUploadZone
                    onFileSelected={handleFileSelected}
                    isProcessing={processingStage !== 'idle'}
                  />
                </div>
              )}

              {/* Quick Suggestions */}
              {messages.length === 1 && !showUpload && suggestions?.data && (
                <div className="border-t px-4 py-3">
                  <p className="mb-2 text-xs font-medium text-gray-700">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.data.slice(0, 3).map((suggestion: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestion(suggestion.command || suggestion)}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
                      >
                        {suggestion.text || suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t p-3">
                <div className="flex gap-2">
                  <button
                    onClick={toggleUpload}
                    className={`flex items-center justify-center rounded-lg border px-3 py-2 ${
                      showUpload
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    aria-label="Upload document"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
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
