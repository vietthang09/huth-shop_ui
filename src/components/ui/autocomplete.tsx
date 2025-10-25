import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChevronDown, X } from "lucide-react";

export interface AutocompleteOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface AutocompleteProps {
  options: AutocompleteOption[];
  value?: string | number;
  onChange?: (value: string | number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  className?: string;
  variant?: "default" | "error" | "success";
  noOptionsText?: string;
  searchPlaceholder?: string;
}

const autocompleteVariants = {
  base: "relative w-full",
  input:
    "flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  variants: {
    default: "border-gray-200 focus:ring-blue-500",
    error: "border-red-300 focus:ring-red-500 focus:border-red-500",
    success: "border-green-300 focus:ring-green-500 focus:border-green-500",
  },
  dropdown: "absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto",
  option: "px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between",
  optionSelected: "bg-blue-50 text-blue-600 font-medium",
  optionDisabled: "opacity-50 cursor-not-allowed hover:bg-transparent",
  noOptions: "px-3 py-2 text-sm text-gray-500 text-center",
  loading: "px-3 py-2 text-sm text-gray-500 text-center",
};

const Autocomplete = React.forwardRef<HTMLInputElement, AutocompleteProps>(
  (
    {
      options = [],
      value,
      onChange,
      placeholder = "Tìm kiếm...",
      disabled = false,
      loading = false,
      clearable = true,
      className,
      variant = "default",
      noOptionsText = "Không có dữ liệu",
      searchPlaceholder = "Nhập để tìm kiếm...",
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [focusedIndex, setFocusedIndex] = React.useState(-1);

    const inputRef = React.useRef<HTMLInputElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const optionsRef = React.useRef<(HTMLDivElement | null)[]>([]);

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    // Get selected option
    const selectedOption = React.useMemo(() => {
      return options.find((option) => option.value === value) || null;
    }, [options, value]);

    // Filter options based on search term
    const filteredOptions = React.useMemo(() => {
      if (!searchTerm.trim()) return options;
      return options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [options, searchTerm]);

    // Reset options ref array when filtered options change
    React.useEffect(() => {
      optionsRef.current = new Array(filteredOptions.length).fill(null);
    }, [filteredOptions.length]);

    // Display value in input
    const displayValue = React.useMemo(() => {
      if (isOpen) return searchTerm;
      return selectedOption ? selectedOption.label : "";
    }, [isOpen, searchTerm, selectedOption]);

    // Handle input focus
    const handleInputFocus = () => {
      if (!disabled) {
        setIsOpen(true);
        setSearchTerm("");
        setFocusedIndex(-1);
      }
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchTerm = e.target.value;
      setSearchTerm(newSearchTerm);
      setFocusedIndex(-1);

      if (!isOpen && !disabled) {
        setIsOpen(true);
      }
    };

    // Handle option selection
    const handleOptionSelect = (option: AutocompleteOption) => {
      if (option.disabled) return;

      onChange?.(option.value);
      setSearchTerm("");
      setIsOpen(false);
      setFocusedIndex(-1);
      inputRef.current?.blur();
    };

    // Handle clear
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(null);
      setSearchTerm("");
      setIsOpen(false);
      setFocusedIndex(-1);
      inputRef.current?.focus();
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else if (filteredOptions.length > 0) {
            const nextIndex = Math.min(focusedIndex + 1, filteredOptions.length - 1);
            setFocusedIndex(nextIndex);
            // Scroll to focused option
            if (optionsRef.current && optionsRef.current[nextIndex]) {
              optionsRef.current[nextIndex]?.scrollIntoView({
                block: "nearest",
              });
            }
          }
          break;

        case "ArrowUp":
          e.preventDefault();
          if (isOpen && filteredOptions.length > 0) {
            const prevIndex = Math.max(focusedIndex - 1, -1);
            setFocusedIndex(prevIndex);
            // Scroll to focused option
            if (prevIndex >= 0 && optionsRef.current && optionsRef.current[prevIndex]) {
              optionsRef.current[prevIndex]?.scrollIntoView({
                block: "nearest",
              });
            }
          }
          break;

        case "Enter":
          e.preventDefault();
          if (isOpen && focusedIndex >= 0 && filteredOptions[focusedIndex]) {
            handleOptionSelect(filteredOptions[focusedIndex]);
          } else if (!isOpen) {
            setIsOpen(true);
          }
          break;

        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          setSearchTerm("");
          inputRef.current?.blur();
          break;

        case "Tab":
          setIsOpen(false);
          setFocusedIndex(-1);
          if (isOpen && !selectedOption) {
            setSearchTerm("");
          }
          break;
      }
    };

    // Handle click outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current &&
          !inputRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setFocusedIndex(-1);
          if (!selectedOption) {
            setSearchTerm("");
          }
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [selectedOption]);

    // Reset search term when value changes externally
    React.useEffect(() => {
      if (!isOpen) {
        setSearchTerm("");
      }
    }, [value, isOpen]);

    return (
      <div className={twMerge(clsx(autocompleteVariants.base), className)}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={isOpen ? searchPlaceholder : placeholder}
            disabled={disabled}
            className={twMerge(
              clsx(
                autocompleteVariants.input,
                autocompleteVariants.variants[variant],
                clearable && selectedOption && "pr-16"
              )
            )}
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            {...props}
          />

          <div className="absolute right-0 top-0 h-full flex items-center">
            {clearable && selectedOption && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 mr-1 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="p-2 text-gray-400">
              <ChevronDown
                className={clsx("h-4 w-4 transition-transform duration-200", isOpen && "transform rotate-180")}
              />
            </div>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div ref={dropdownRef} className={autocompleteVariants.dropdown} role="listbox" aria-label="Options">
            {loading ? (
              <div className={autocompleteVariants.loading} role="status" aria-live="polite">
                Đang tải...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className={autocompleteVariants.noOptions} role="status">
                {noOptionsText}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={`${option.value}-${index}`}
                  ref={(el) => {
                    if (optionsRef.current) {
                      optionsRef.current[index] = el;
                    }
                  }}
                  onClick={() => handleOptionSelect(option)}
                  className={twMerge(
                    clsx(
                      autocompleteVariants.option,
                      option.value === value && autocompleteVariants.optionSelected,
                      option.disabled && autocompleteVariants.optionDisabled,
                      index === focusedIndex && "bg-gray-100"
                    )
                  )}
                  role="option"
                  aria-selected={option.value === value}
                  aria-disabled={option.disabled}
                >
                  <span>{option.label}</span>
                  {option.value === value && (
                    <div className="text-blue-600" aria-hidden="true">
                      ✓
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }
);

Autocomplete.displayName = "Autocomplete";

export { Autocomplete };
