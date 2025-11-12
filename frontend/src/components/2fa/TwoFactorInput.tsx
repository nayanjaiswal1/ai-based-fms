import { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';

interface TwoFactorInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
}

export default function TwoFactorInput({
  value,
  onChange,
  onComplete,
  disabled = false,
}: TwoFactorInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, ' ').split('').slice(0, 6);

  const handleChange = (index: number, newValue: string) => {
    if (disabled) return;

    // Only allow digits
    const digit = newValue.replace(/\D/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digit;
    const newCode = newDigits.join('').trim();

    onChange(newCode);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newCode.length === 6 && onComplete) {
      onComplete(newCode);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Handle backspace
    if (e.key === 'Backspace' && !digits[index].trim() && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle arrow keys
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    onChange(pastedData);

    // Focus appropriate input after paste
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();

    // Auto-submit if complete
    if (pastedData.length === 6 && onComplete) {
      onComplete(pastedData);
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit.trim()}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="h-12 w-12 rounded-md border border-gray-300 text-center text-xl font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      ))}
    </div>
  );
}
