import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

interface AIConfig {
  id: string;
  provider: 'openai' | 'ollama' | 'anthropic' | 'none';
  model?: string;
  apiKey?: string;
  apiEndpoint?: string;
  timeout?: number;
  modelParameters?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  };
  features?: {
    emailParsing?: boolean;
    categorization?: boolean;
    insights?: boolean;
    chat?: boolean;
  };
  isActive?: boolean;
}

const AIConfigPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showApiKey, setShowApiKey] = useState(false);

  // Fetch current AI config
  const { data: config, isLoading } = useQuery({
    queryKey: ['ai-config'],
    queryFn: async () => {
      const response = await api.get<AIConfig>('/ai/config');
      return response.data;
    },
  });

  // Fetch available models
  const { data: modelsData } = useQuery({
    queryKey: ['ai-models', config?.provider],
    queryFn: async () => {
      const response = await api.get<{ models: string[] }>('/ai/config/models');
      return response.data;
    },
    enabled: !!config && config.provider !== 'none',
  });

  // Update config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (updates: Partial<AIConfig>) => {
      const response = await api.patch('/ai/config', updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-config'] });
      toast.success('AI configuration updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update configuration');
    },
  });

  // Test config mutation
  const testConfigMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<{ success: boolean; message: string; models?: string[] }>(
        '/ai/config/test'
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Configuration test failed');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const updates: Partial<AIConfig> = {
      provider: formData.get('provider') as any,
      model: formData.get('model') as string,
      apiKey: formData.get('apiKey') as string,
      apiEndpoint: formData.get('apiEndpoint') as string,
      timeout: parseInt(formData.get('timeout') as string) || 30000,
      modelParameters: {
        temperature: parseFloat(formData.get('temperature') as string) || 0.7,
        maxTokens: parseInt(formData.get('maxTokens') as string) || 500,
        systemPrompt: formData.get('systemPrompt') as string,
      },
      features: {
        emailParsing: formData.get('emailParsing') === 'on',
        categorization: formData.get('categorization') === 'on',
        insights: formData.get('insights') === 'on',
        chat: formData.get('chat') === 'on',
      },
      isActive: formData.get('isActive') === 'on',
    };

    updateConfigMutation.mutate(updates);
  };

  if (isLoading) {
    return <div className="p-6">Loading AI configuration...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Configuration</h1>
        <p className="text-gray-600 mt-2">
          Configure your AI provider for email parsing, categorization, and insights
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Provider Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">AI Provider</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Provider</label>
              <select
                name="provider"
                defaultValue={config?.provider || 'none'}
                className="w-full p-2 border rounded"
              >
                <option value="none">None (Pattern Matching Only)</option>
                <option value="ollama">Ollama (Local, Free)</option>
                <option value="openai">OpenAI (Paid)</option>
                <option value="anthropic">Anthropic Claude (Paid)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Choose your AI provider. Ollama runs locally and is completely free.
              </p>
            </div>

            {config?.provider !== 'none' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Model</label>
                  {modelsData?.models && modelsData.models.length > 0 ? (
                    <select
                      name="model"
                      defaultValue={config?.model}
                      className="w-full p-2 border rounded"
                    >
                      {modelsData.models.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="model"
                      defaultValue={config?.model}
                      placeholder="e.g., gpt-3.5-turbo or llama3.1"
                      className="w-full p-2 border rounded"
                    />
                  )}
                </div>

                {config?.provider === 'ollama' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">API Endpoint</label>
                    <input
                      type="text"
                      name="apiEndpoint"
                      defaultValue={config?.apiEndpoint || 'http://localhost:11434'}
                      placeholder="http://localhost:11434"
                      className="w-full p-2 border rounded"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Ollama server endpoint. Default: http://localhost:11434
                    </p>
                  </div>
                )}

                {(config?.provider === 'openai' || config?.provider === 'anthropic') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">API Key</label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        name="apiKey"
                        defaultValue={config?.apiKey}
                        placeholder="sk-..."
                        className="w-full p-2 border rounded pr-20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2 top-2 text-sm text-blue-600"
                      >
                        {showApiKey ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Your API key is encrypted and stored securely
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Model Parameters */}
        {config?.provider !== 'none' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Model Parameters</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Temperature: {config?.modelParameters?.temperature || 0.7}
                </label>
                <input
                  type="range"
                  name="temperature"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue={config?.modelParameters?.temperature || 0.7}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Higher = more creative, Lower = more consistent
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Tokens</label>
                <input
                  type="number"
                  name="maxTokens"
                  defaultValue={config?.modelParameters?.maxTokens || 500}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">System Prompt (Optional)</label>
                <textarea
                  name="systemPrompt"
                  defaultValue={config?.modelParameters?.systemPrompt}
                  rows={3}
                  placeholder="Custom instructions for the AI..."
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Timeout (ms)</label>
                <input
                  type="number"
                  name="timeout"
                  defaultValue={config?.timeout || 30000}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Features */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Enabled Features</h2>

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="emailParsing"
                defaultChecked={config?.features?.emailParsing !== false}
                className="rounded"
              />
              <span>Email Parsing</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="categorization"
                defaultChecked={config?.features?.categorization !== false}
                className="rounded"
              />
              <span>Transaction Categorization</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="insights"
                defaultChecked={config?.features?.insights}
                className="rounded"
              />
              <span>Financial Insights</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="chat"
                defaultChecked={config?.features?.chat}
                className="rounded"
              />
              <span>AI Chat Assistant</span>
            </label>
          </div>
        </Card>

        {/* Status */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={config?.isActive !== false}
              className="rounded"
            />
            <span>Active</span>
          </label>
        </Card>

        {/* Actions */}
        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={updateConfigMutation.isPending}
            className="flex-1"
          >
            {updateConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
          </Button>

          <Button
            type="button"
            onClick={() => testConfigMutation.mutate()}
            disabled={testConfigMutation.isPending}
            variant="outline"
            className="flex-1"
          >
            {testConfigMutation.isPending ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AIConfigPage;
