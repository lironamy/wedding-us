'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function AnimatedCard({
  children,
  className = '',
  delay = 0,
  hover = true,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={
        hover
          ? {
              scale: 1.02,
              y: -4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            }
          : undefined
      }
      whileTap={hover ? { scale: 0.98 } : undefined}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}
