import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', padding = 'md', variant = 'default', children, ...props }, ref) => {
    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const variantStyles = {
      default: 'bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200',
      elevated: 'bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-200',
      outlined: 'bg-white border-2 border-purple-100 hover:border-purple-200 transition-colors duration-200',
      gradient: 'bg-gradient-to-br from-white to-purple-50/30 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-200',
    };

    return (
      <div
        ref={ref}
        className={`rounded-2xl ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`mb-4 pb-4 border-b border-gray-100 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <h3 ref={ref} className={`text-xl font-bold text-gray-800 ${className}`} {...props}>
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <p ref={ref} className={`text-sm text-gray-500 mt-1 ${className}`} {...props}>
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`mt-4 pt-4 border-t border-gray-100 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
