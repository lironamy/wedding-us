'use client';

import React, { useState, useEffect } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

// Calendar Icon Component
const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

// Clock Icon Component
const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, type = 'text', value, defaultValue, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    // Check if input has value
    useEffect(() => {
      setHasValue(!!value || !!defaultValue);
    }, [value, defaultValue]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      onBlur?.(e);
    };

    const isFloating = isFocused || hasValue;
    const borderColor = error
      ? 'border-error'
      : isFocused
        ? 'border-primary'
        : 'border-gray-300';

    // For date/time inputs
    const isDateOrTime = type === 'date' || type === 'time';
    const shouldHidePlaceholder = isDateOrTime && !hasValue && !isFocused;

    return (
      <div className="w-full">
        <div className="relative">
          {/* Icon for date/time inputs */}
          {isDateOrTime && (
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-colors duration-200 ${isFocused ? 'text-primary' : 'text-gray-400'}`}>
              {type === 'date' ? <CalendarIcon /> : <ClockIcon />}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            value={value}
            defaultValue={defaultValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`
              w-full px-4 py-3.5
              border-2 rounded-xl
              bg-white
              text-gray-800 text-base
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary/20
              disabled:opacity-50 disabled:cursor-not-allowed
              ${borderColor}
              ${label ? 'pt-5 pb-2' : ''}
              ${isDateOrTime ? 'pl-11 cursor-pointer' : ''}
              ${className}
            `}
            style={{
              fontSize: '16px',
              ...(shouldHidePlaceholder ? { color: 'transparent' } : {})
            }}
            placeholder={!label ? props.placeholder : ' '}
            {...props}
          />
          {label && (
            <label
              className={`
                absolute right-3
                pointer-events-none
                transition-all duration-200 ease-out
                px-1
                ${isFloating
                  ? '-top-2.5 text-xs bg-white text-primary font-medium'
                  : 'top-1/2 -translate-y-1/2 text-base text-gray-400'
                }
                ${error ? 'text-error' : ''}
              `}
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;
