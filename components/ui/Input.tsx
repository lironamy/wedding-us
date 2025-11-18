import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, type = 'text', ...props }, ref) => {
    const baseStyles = 'w-full px-4 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';
    const errorStyles = error ? 'border-error focus:ring-error' : 'border-border';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#6e6262] mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`${baseStyles} ${errorStyles} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;
