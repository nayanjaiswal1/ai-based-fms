import { Link } from 'react-router-dom';
import { CheckCircle, Mail, UserPlus } from 'lucide-react';

export default function GoodbyePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        {/* Main Message */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Your Account Has Been Deleted
          </h1>
          <p className="mt-4 text-gray-600">
            We've successfully deleted your account and all associated data from our systems.
          </p>
        </div>

        {/* What Was Deleted */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            What was deleted:
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>All your transactions and financial records</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>All your accounts and balances</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>All your budgets and financial goals</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>All your investments and portfolio data</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Your membership in all groups</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>All your personal data and preferences</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>All your custom categories and tags</span>
            </li>
          </ul>
        </div>

        {/* Information Box */}
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            Your data has been permanently deleted and cannot be recovered. If you exported your
            data before deletion, you still have access to that export file.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            to="/register"
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
          >
            <UserPlus className="h-5 w-5" />
            <span>Create a New Account</span>
          </Link>

          <Link
            to="/login"
            className="flex w-full items-center justify-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 hover:bg-gray-50"
          >
            <span>Back to Login</span>
          </Link>
        </div>

        {/* Support Contact */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <Mail className="mx-auto mb-2 h-6 w-6 text-gray-400" />
          <p className="text-sm text-gray-600">
            Have questions or feedback?
          </p>
          <p className="mt-1 text-sm text-gray-900">
            Contact us at{' '}
            <a
              href="mailto:support@fms.com"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              support@fms.com
            </a>
          </p>
        </div>

        {/* Footer Message */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Thank you for using our Financial Management System. We're sorry to see you go.
          </p>
        </div>
      </div>
    </div>
  );
}
