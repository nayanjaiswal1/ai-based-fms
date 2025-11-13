import { Fragment, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { Check, X, Plus, Search } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
  color?: string;
}

interface CreatableMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  onCreateNew?: (searchQuery: string) => Promise<string> | string;
  disabled?: boolean;
  error?: string;
  allowCreate?: boolean;
}

export function CreatableMultiSelect({
  value,
  onChange,
  options,
  placeholder = 'Search or create...',
  onCreateNew,
  disabled = false,
  error,
  allowCreate = true,
}: CreatableMultiSelectProps) {
  const [query, setQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const selectedOptions = options.filter((option) => value.includes(option.value));

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) =>
          option.label
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        );

  const showCreateOption =
    allowCreate &&
    onCreateNew &&
    query !== '' &&
    !filteredOptions.some((option) => option.label.toLowerCase() === query.toLowerCase());

  const handleCreate = async () => {
    if (!onCreateNew || !query.trim()) return;

    setIsCreating(true);
    try {
      const newValue = await onCreateNew(query.trim());
      onChange([...value, newValue]);
      setQuery('');
    } catch (error) {
      console.error('Failed to create new option:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  const handleSelect = (selectedValue: string) => {
    if (value.includes(selectedValue)) {
      onChange(value.filter((v) => v !== selectedValue));
    } else {
      onChange([...value, selectedValue]);
    }
  };

  return (
    <div className="space-y-2">
      {/* Selected Tags */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
              style={
                option.color
                  ? {
                      backgroundColor: `${option.color}20`,
                      color: option.color,
                    }
                  : undefined
              }
            >
              {option.label}
              <button
                type="button"
                onClick={() => handleRemove(option.value)}
                className="rounded-full hover:bg-primary/20 p-0.5 transition-colors"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Searchable Dropdown */}
      <Combobox value={value} onChange={() => {}} disabled={disabled} multiple>
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-background text-left">
            <Combobox.Input
              className={`w-full border ${
                error
                  ? 'border-destructive/50 bg-destructive/10 focus:border-destructive focus:ring-destructive'
                  : 'border-input focus:border-ring focus:ring-ring'
              } rounded-lg py-2.5 pl-10 pr-4 text-sm leading-5 text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                disabled ? 'cursor-not-allowed bg-muted text-muted-foreground' : ''
              }`}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              displayValue={() => query}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-input bg-background py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {showCreateOption && (
                <div
                  onClick={() => handleCreate()}
                  className={`relative cursor-pointer select-none py-2.5 pl-10 pr-4 hover:bg-primary/10 hover:text-primary text-foreground ${
                    isCreating ? 'opacity-50 cursor-wait' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 absolute left-3" />
                    <span className="block truncate font-medium ml-7">
                      Create "{query}"
                    </span>
                  </div>
                </div>
              )}

              {filteredOptions.length === 0 && !showCreateOption ? (
                <div className="relative cursor-default select-none py-2.5 px-4 text-muted-foreground text-sm">
                  No options found.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <Combobox.Option
                    key={option.value}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                        active ? 'bg-primary/10 text-primary' : 'text-foreground'
                      }`
                    }
                    value={option.value}
                    onClick={() => handleSelect(option.value)}
                  >
                    {({ active }) => {
                      const isSelected = value.includes(option.value);
                      return (
                        <>
                          <span
                            className={`block truncate ${
                              isSelected ? 'font-medium' : 'font-normal'
                            }`}
                          >
                            {option.label}
                          </span>
                          {isSelected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? 'text-primary' : 'text-primary'
                              }`}
                            >
                              <Check className="h-4 w-4" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      );
                    }}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
}
