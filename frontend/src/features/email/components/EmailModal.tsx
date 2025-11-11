import { useState } from 'react';
import { useMutation, useQueryClient } from '@tantml:react-query';
import { emailApi } from '@services/api';
import { X } from 'lucide-react';

interface EmailModalProps {
  onClose: () => void;
}

export default function EmailModal({ onClose }: EmailModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    provider: 'gmail',
    email: '',
    authMethod: 'oauth',
    password: '',
  });

  const connectMutation = useMutation({
    mutationFn: emailApi.connect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-connections'] });
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      password: formData.authMethod === 'basic' ? formData.password : undefined,
    };

    await connectMutation.mutateAsync(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Connect Email Account</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Provider */}
          <div>
            <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
              Email Provider
            </label>
            <select
              id="provider"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="gmail">Gmail</option>
              <option value="outlook">Outlook</option>
              <option value="yahoo">Yahoo</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Auth Method */}
          <div>
            <label htmlFor="authMethod" className="block text-sm font-medium text-gray-700">
              Authentication Method
            </label>
            <select
              id="authMethod"
              name="authMethod"
              value={formData.authMethod}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="oauth">OAuth (Recommended)</option>
              <option value="basic">Password/App Password</option>
            </select>
          </div>

          {/* Password (only for basic auth) */}
          {formData.authMethod === 'basic' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password or App Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={formData.authMethod === 'basic'}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                For Gmail, you need to use an App Password. Regular passwords won't work.
              </p>
            </div>
          )}

          {/* Info */}
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              {formData.authMethod === 'oauth' ? (
                <>You'll be redirected to {formData.provider} to authorize access.</>
              ) : (
                <>
                  Using basic authentication. For better security, consider using OAuth.
                </>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={connectMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {connectMutation.isPending ? 'Connecting...' : 'Connect Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
