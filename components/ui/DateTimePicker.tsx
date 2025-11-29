'use client';

import React, { useState, forwardRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { he } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

// Register Hebrew locale
registerLocale('he', he);

// Calendar Icon
const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

// Clock Icon
const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface DateTimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: 'date' | 'time';
  error?: string;
  required?: boolean;
  name?: string;
  timeIntervals?: number; // For time picker - minutes between options (default 15)
  minDate?: Date; // Minimum selectable date
  minTime?: Date; // Minimum selectable time
}

// Custom input component for DatePicker
const CustomInput = forwardRef<HTMLInputElement, {
  value?: string;
  onClick?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  label: string;
  type: 'date' | 'time';
  error?: string;
  isFocused: boolean;
  hasValue: boolean;
  placeholder?: string;
  readOnly?: boolean;
}>(({ value, onClick, onChange, onKeyDown, label, type, error, isFocused, hasValue, placeholder, readOnly }, ref) => {
  const isFloating = isFocused || hasValue;
  const borderColor = error
    ? 'border-red-500'
    : isFocused
      ? 'border-primary'
      : 'border-gray-300';

  return (
    <div className="relative w-full">
      {/* Icon - clickable to open picker */}
      <div
        className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 cursor-pointer hover:text-primary ${isFocused ? 'text-primary' : 'text-gray-400'}`}
        onClick={onClick}
      >
        {type === 'date' ? <CalendarIcon /> : <ClockIcon />}
      </div>

      <input
        ref={ref}
        value={value || ''}
        onClick={onClick}
        onChange={readOnly ? undefined : onChange}
        onKeyDown={readOnly ? (e) => e.preventDefault() : onKeyDown}
        readOnly={readOnly}
        className={`
          w-full px-4 pl-11 py-3.5
          border-2 rounded-xl
          bg-white
          text-gray-800 text-base
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${borderColor}
          pt-5 pb-2
          ${readOnly ? 'cursor-pointer' : ''}
        `}
        style={{ fontSize: '16px' }}
        placeholder={placeholder || ' '}
      />

      {/* Floating label */}
      <label
        className={`
          absolute right-3
          pointer-events-none
          transition-all duration-200 ease-out
          px-1 bg-white
          ${isFloating
            ? '-top-2.5 text-xs text-primary font-medium'
            : 'top-1/2 -translate-y-1/2 text-base text-gray-400'
          }
          ${error ? 'text-red-500' : ''}
        `}
      >
        {label}
      </label>
    </div>
  );
});

CustomInput.displayName = 'CustomInput';

export function ModernDatePicker({ label, value, onChange, error, required, name, minDate }: DateTimePickerProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Convert string date to Date object
  const selectedDate = value ? new Date(value) : null;

  // Update input value when value changes
  React.useEffect(() => {
    if (value) {
      const date = new Date(value);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      setInputValue(`${day}/${month}/${year}`);
    } else {
      setInputValue('');
    }
  }, [value]);

  const handleChange = (date: Date | null) => {
    if (date) {
      // Format as YYYY-MM-DD using local date components (not UTC)
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const formatted = `${year}-${month}-${day}`;
      onChange(formatted);
    }
  };

  // Handle manual input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // Try to parse the date (support formats: dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy)
    const match = val.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        // Format as YYYY-MM-DD using local date components (not UTC)
        const formattedYear = date.getFullYear();
        const formattedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
        const formattedDay = date.getDate().toString().padStart(2, '0');
        const formatted = `${formattedYear}-${formattedMonth}-${formattedDay}`;
        onChange(formatted);
      }
    }
  };

  return (
    <div className="w-full">
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        onCalendarOpen={() => setIsFocused(true)}
        onCalendarClose={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        locale="he"
        dateFormat="dd/MM/yyyy"
        showPopperArrow={false}
        calendarClassName="modern-datepicker"
        popperClassName="modern-datepicker-popper"
        minDate={minDate}
        customInput={
          <CustomInput
            label={label}
            type="date"
            error={error}
            isFocused={isFocused}
            hasValue={!!value || !!inputValue}
            placeholder="dd/mm/yyyy"
            value={inputValue}
            onChange={handleInputChange}
          />
        }
        portalId="datepicker-portal"
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}

      {/* Styles for the datepicker */}
      <style jsx global>{`
        .modern-datepicker {
          font-family: 'Assistant', 'Heebo', sans-serif !important;
          border: none !important;
          border-radius: 16px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
          padding: 16px !important;
          background: white !important;
        }

        .modern-datepicker-popper {
          z-index: 9999 !important;
        }

        .react-datepicker-wrapper {
          width: -webkit-fill-available !important;
          width: -moz-available !important;
          width: 100% !important;
        }

        .react-datepicker {
          border: none !important;
          border-radius: 16px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
          font-family: 'Assistant', 'Heebo', sans-serif !important;
        }

        .react-datepicker__header {
          background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%) !important;
          border: none !important;
          border-radius: 16px 16px 0 0 !important;
          padding: 16px !important;
        }

        .react-datepicker__current-month {
          color: white !important;
          font-size: 1.1rem !important;
          font-weight: 600 !important;
          margin-bottom: 8px !important;
        }

        .react-datepicker__day-names {
          margin-top: 8px !important;
        }

        .react-datepicker__day-name {
          color: rgba(255, 255, 255, 0.9) !important;
          font-weight: 500 !important;
          width: 36px !important;
          line-height: 36px !important;
          margin: 2px !important;
        }

        .react-datepicker__month {
          margin: 12px !important;
        }

        .react-datepicker__day {
          width: 36px !important;
          line-height: 36px !important;
          margin: 2px !important;
          border-radius: 10px !important;
          transition: all 0.2s ease !important;
          color: #374151 !important;
        }

        .react-datepicker__day:hover {
          background: #f3e8ff !important;
          color: #7c3aed !important;
          border-radius: 10px !important;
        }

        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%) !important;
          color: white !important;
          font-weight: 600 !important;
        }

        .react-datepicker__day--today {
          font-weight: 700 !important;
          color: #7c3aed !important;
        }

        .react-datepicker__day--today.react-datepicker__day--selected {
          color: white !important;
        }

        .react-datepicker__day--outside-month {
          color: #d1d5db !important;
        }

        .react-datepicker__navigation {
          top: 40px !important;
          height: 32px !important;
          width: 32px !important;
        }

        .react-datepicker__navigation-icon::before {
          border-color: #374151 !important;
          border-width: 3px 3px 0 0 !important;
          width: 10px !important;
          height: 10px !important;
        }

        .react-datepicker__navigation:hover *::before {
          border-color: #1f2937 !important;
        }

        .react-datepicker__triangle {
          display: none !important;
        }

        /* Mobile responsive styles */
        @media (max-width: 640px) {
          .react-datepicker {
            font-size: 0.85rem !important;
          }

          .react-datepicker__header {
            padding: 10px !important;
          }

          .react-datepicker__current-month {
            font-size: 0.95rem !important;
            margin-bottom: 4px !important;
          }

          .react-datepicker__day-name {
            width: 28px !important;
            line-height: 28px !important;
            margin: 1px !important;
            font-size: 0.75rem !important;
          }

          .react-datepicker__month {
            margin: 8px !important;
          }

          .react-datepicker__day {
            width: 28px !important;
            line-height: 28px !important;
            margin: 1px !important;
            font-size: 0.8rem !important;
            border-radius: 6px !important;
          }

          .react-datepicker__navigation {
            top: 32px !important;
          }

          .react-datepicker__navigation-icon::before {
            width: 8px !important;
            height: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}

export function ModernTimePicker({ label, value, onChange, error, required, name, timeIntervals = 15, minTime }: DateTimePickerProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Convert HH:MM string to Date object
  const getTimeAsDate = (timeStr: string): Date | null => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const selectedTime = getTimeAsDate(value);

  const handleChange = (date: Date | null) => {
    if (date) {
      // Format as HH:MM
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      onChange(`${hours}:${minutes}`);
    }
  };

  return (
    <div className="w-full">
      <DatePicker
        selected={selectedTime}
        onChange={handleChange}
        onCalendarOpen={() => setIsFocused(true)}
        onCalendarClose={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={timeIntervals}
        timeCaption="שעה"
        dateFormat="HH:mm"
        locale="he"
        showPopperArrow={false}
        calendarClassName="modern-timepicker"
        popperClassName="modern-timepicker-popper"
        {...(minTime ? { minTime, maxTime: new Date(new Date().setHours(23, 59, 0, 0)) } : {})}
        customInput={
          <CustomInput
            label={label}
            type="time"
            error={error}
            isFocused={isFocused}
            hasValue={!!value}
            readOnly={true}
          />
        }
        portalId="datepicker-portal"
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}

      {/* Styles for the timepicker */}
      <style jsx global>{`
        .modern-timepicker,
        .react-datepicker--time-only {
          font-family: 'Assistant', 'Heebo', sans-serif !important;
          border: none !important;
          border-radius: 16px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
          background: white !important;
          overflow: hidden !important;
        }

        .modern-timepicker-popper {
          z-index: 9999 !important;
        }

        .react-datepicker-wrapper {
          width: -webkit-fill-available !important;
          width: -moz-available !important;
          width: 100% !important;
        }

        .react-datepicker--time-only .react-datepicker__header {
          background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%) !important;
          border: none !important;
          border-radius: 16px 16px 0 0 !important;
          padding: 12px 16px !important;
        }

        .react-datepicker-time__header {
          color: white !important;
          font-size: 1rem !important;
          font-weight: 600 !important;
        }

        .react-datepicker__time-container {
          border: none !important;
          width: 150px !important;
        }

        .react-datepicker__time-box {
          width: 100% !important;
        }

        .react-datepicker__time-list {
          height: 200px !important;
        }

        .react-datepicker__time-list-item {
          padding: 10px 16px !important;
          transition: all 0.2s ease !important;
          font-size: 0.95rem !important;
        }

        .react-datepicker__time-list-item:hover {
          background: #f3e8ff !important;
          color: #7c3aed !important;
        }

        .react-datepicker__time-list-item--selected {
          background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%) !important;
          color: white !important;
          font-weight: 600 !important;
        }

        /* Mobile responsive styles for time picker */
        @media (max-width: 640px) {
          .react-datepicker--time-only {
            border-radius: 12px !important;
          }

          .react-datepicker--time-only .react-datepicker__header {
            padding: 8px 12px !important;
            border-radius: 12px 12px 0 0 !important;
          }

          .react-datepicker-time__header {
            font-size: 0.9rem !important;
          }

          .react-datepicker__time-container {
            width: 120px !important;
          }

          .react-datepicker__time-list {
            height: 160px !important;
          }

          .react-datepicker__time-list-item {
            padding: 8px 12px !important;
            font-size: 0.85rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default { ModernDatePicker, ModernTimePicker };
