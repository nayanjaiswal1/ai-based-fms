import { Fragment, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { Check, ChevronDown, Plus, Search } from 'lucide-react';

export interface SearchableSelectOption {
  value: string;
  label: string;
  color?: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  onCreateNew?: (searchQuery: string) => Promise<string> | string;
  disabled?: boolean;
  error?: string;
  allowCreate?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  onCreateNew,
  disabled = false,
  error,
  allowCreate = true,
}: SearchableSelectProps) {
  const [query, setQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

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
    allowCreate && onCreateNew && query !== '' && !filteredOptions.some((option) => option.label.toLowerCase() === query.toLowerCase());

  const handleCreate = async () => {
    if (!onCreateNew || !query.trim()) return;

    setIsCreating(true);
    try {
      const newValue = await onCreateNew(query.trim());
      onChange(newValue);
      setQuery('');
    } catch (error) {
      console.error('Failed to create new option:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Combobox value={value} onChange={onChange} disabled={disabled}>
      <div className="relative">
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-background text-left">
          <Combobox.Input
            className={`w-full border ${
              error
                ? 'border-destructive/50 bg-destructive/10 focus:border-destructive focus:ring-destructive'
                : 'border-input focus:border-ring focus:ring-ring'
            } rounded-lg py-2.5 pl-10 pr-10 text-sm leading-5 text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
              disabled ? 'cursor-not-allowed bg-muted text-muted-foreground' : ''
            }`}
            displayValue={(value: string) => {
              const option = options.find((o) => o.value === value);
              return option?.label || '';
            }}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </Combobox.Button>
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </Combobox.Button>
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
              <Combobox.Option
                value={query}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCreate();
                }}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                    active ? 'bg-primary/10 text-primary' : 'text-foreground'
                  } ${isCreating ? 'opacity-50 cursor-wait' : ''}`
                }
                disabled={isCreating}
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="block truncate font-medium">
                    Create "{query}"
                  </span>
                </div>
              </Combobox.Option>
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
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-primary' : 'text-primary'
                          }`}
                        >
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}
