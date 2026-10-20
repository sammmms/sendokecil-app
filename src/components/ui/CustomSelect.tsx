'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  badge?: string;
  badgeColor?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  label?: string;
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  className = '',
  label,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-[#5A3E2C] mb-1">
          {label}
        </label>
      )}

      {/* Button / Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-xs font-semibold text-[#3E271B] transition-all text-left shadow-xs ${
          isOpen
            ? 'ring-2 ring-[#6B4226]/30 border-[#6B4226]'
            : 'hover:border-[#C4B29E] hover:bg-[#FAF8F5]'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0 text-[#6B4226]">{selectedOption.icon}</span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                selectedOption.badgeColor || 'bg-[#F3ECE0] text-[#6B4226]'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#8C6D53] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#6B4226]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-[#E8DEC8] bg-[#FFFDF9] p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-xs"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${
                  isSelected
                    ? 'bg-[#F3ECE0] text-[#3E271B] font-bold'
                    : 'text-[#5A3E2C] hover:bg-[#FAF5EC] hover:text-[#3E271B]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {opt.icon && (
                    <span className={`shrink-0 ${isSelected ? 'text-[#6B4226]' : 'text-[#8C6D53]'}`}>
                      {opt.icon}
                    </span>
                  )}
                  <div className="truncate">
                    <div className="truncate">{opt.label}</div>
                    {opt.description && (
                      <div className="text-[10px] text-gray-500 truncate">{opt.description}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {opt.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        opt.badgeColor || 'bg-[#FAF2E6] text-[#7A4B27]'
                      }`}
                    >
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#6B4226] stroke-[2.5]" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
