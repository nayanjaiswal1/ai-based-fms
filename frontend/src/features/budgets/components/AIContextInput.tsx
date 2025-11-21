interface AIContextInputProps {
  aiContext: string;
  setAiContext: (context: string) => void;
  monthlyIncome: number;
}

export function AIContextInput({ aiContext, setAiContext, monthlyIncome }: AIContextInputProps) {
  if (monthlyIncome <= 0) return null;

  return (
    <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
      <label className="block text-sm font-semibold text-purple-900 mb-2">
        Additional Context (Optional)
      </label>
      <input
        type="text"
        value={aiContext}
        onChange={(e) => setAiContext(e.target.value)}
        placeholder="e.g., Family of 4, saving for vacation, rent $1200"
        className="w-full px-4 py-2.5 border-2 border-purple-200 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm"
      />
      <p className="mt-2 text-xs text-purple-700">
        Add any relevant information to help AI create personalized budgets
      </p>
    </div>
  );
}
