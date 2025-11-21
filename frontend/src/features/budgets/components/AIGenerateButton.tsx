import { Sparkles, Loader2 } from 'lucide-react';

interface AIGenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export function AIGenerateButton({ onClick, isLoading, disabled }: AIGenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 via-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Generating AI Budget...</span>
        </>
      ) : (
        <>
          <Sparkles className="h-5 w-5" />
          <span>Generate Budget with AI</span>
        </>
      )}
    </button>
  );
}
