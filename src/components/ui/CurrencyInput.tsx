'use client';

import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  prefix?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  id?: string;
  name?: string;
  required?: boolean;
  autoFocus?: boolean;
}

/**
 * Format a number to Indonesian Rupiah style thousand dots:
 * e.g. 15000 -> "15.000"
 */
function formatNumberWithDots(val: number | string): string {
  if (val === '' || val === null || val === undefined) return '';
  const numStr = String(val).replace(/\D/g, '');
  if (!numStr) return '';
  return Number(numStr).toLocaleString('id-ID');
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  prefix,
  disabled = false,
  min = 0,
  max,
  id,
  name,
  required = false,
  autoFocus = false,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState<string>(() =>
    value ? formatNumberWithDots(value) : ''
  );

  useEffect(() => {
    // Sync external value changes into formatted string
    if (value === 0 && displayValue === '') {
      // Keep empty if user cleared it
      return;
    }
    const currentNum = Number(displayValue.replace(/\D/g, '')) || 0;
    if (value !== currentNum) {
      setDisplayValue(value ? formatNumberWithDots(value) : '');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    
    if (!rawDigits) {
      setDisplayValue('');
      onChange(0);
      return;
    }

    let numericVal = parseInt(rawDigits, 10);
    if (max !== undefined && numericVal > max) {
      numericVal = max;
    }
    if (min !== undefined && numericVal < min && rawDigits.length > 3) {
      numericVal = min;
    }

    setDisplayValue(formatNumberWithDots(numericVal));
    onChange(numericVal);
  };

  const baseInputStyle = `
    w-full px-3 py-2 rounded-xl border border-[#DCCBB8] bg-white text-[#3E271B]
    placeholder-[#A8927F] transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-[#6B4226]/30 focus:border-[#6B4226]
    relative focus:z-10
  `;

  if (prefix) {
    return (
      <div className="relative flex items-center w-full">
        <span className="absolute left-3 text-xs font-semibold text-[#8C6D53] pointer-events-none select-none z-20">
          {prefix}
        </span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          id={id}
          name={name}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`${baseInputStyle} pl-9 ${className}`}
        />
      </div>
    );
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      id={id}
      name={name}
      disabled={disabled}
      required={required}
      autoFocus={autoFocus}
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={`${baseInputStyle} ${className}`}
    />
  );
}
