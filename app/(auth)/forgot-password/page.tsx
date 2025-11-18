'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/ui';
import { sendPasswordResetEmail } from '@/lib/email/emailjs';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      // First, check if user exists
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'אירעה שגיאה');
        setIsLoading(false);
        return;
      }

      // Send email using EmailJS
      const resetLink = `${window.location.origin}/reset-password?token=${data.resetToken || 'token'}`;
      const emailResult = await sendPasswordResetEmail(email, email.split('@')[0], resetLink);

      if (emailResult.success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(emailResult.message || 'אירעה שגיאה בשליחת האימייל');
      }
    } catch (err) {
      setError('אירעה שגיאה. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent to-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">שכחתי סיסמה</CardTitle>
          <p className="text-gray-600">נשלח לך קישור לאיפוס הסיסמה</p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert type="error" message={error} className="mb-4" onClose={() => setError('')} />
          )}

          {success && (
            <Alert
              type="success"
              title="נשלח!"
              message="קישור לאיפוס סיסמה נשלח לאימייל שלך. אנא בדוק את תיבת הדואר."
              className="mb-4"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="אימייל"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={isLoading || success}
            />

            <Button type="submit" className="w-full" isLoading={isLoading} disabled={success}>
              שלח קישור לאיפוס
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-primary hover:text-primary-dark transition-colors"
            >
              חזרה להתחברות
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
