'use client';

import React, { useState, useEffect } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

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

    return (
      <div className="w-full">
        <div className="relative">
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
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${borderColor}
              ${label ? 'pt-5 pb-2' : ''}
              ${className}
            `}
            style={{ fontSize: '16px' }}
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
