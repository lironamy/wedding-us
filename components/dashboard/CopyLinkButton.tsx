'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

interface CopyLinkButtonProps {
  text: string;
}

export default function CopyLinkButton({ text }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy link', error);
    }
  };

  return <Button onClick={handleCopy}>{copied ? 'הועתק!' : 'העתק'}</Button>;
}

