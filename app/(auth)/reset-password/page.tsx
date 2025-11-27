'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Alert, GradientText } from '@/components/ui';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('קישור לא תקין. אנא בקש קישור חדש לאיפוס סיסמה.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('הסיסמה חייבת להכיל לפחות 8 תווים');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'אירעה שגיאה');
        setIsLoading(false);
        return;
      }

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError('אירעה שגיאה. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-accent to-muted px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Alert type="error" message="קישור לא תקין. אנא בקש קישור חדש לאיפוס סיסמה." />
            <Link href="/forgot-password">
              <Button className="mt-4">בקש קישור חדש</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-accent to-muted px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
              >
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">הסיסמה עודכנה בהצלחה!</h2>
              <p className="text-gray-600 mb-4">מיד תועבר לדף ההתחברות...</p>
              <Link href="/login">
                <Button>עבור להתחברות</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-accent to-muted px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">
              <GradientText>איפוס סיסמה</GradientText>
            </CardTitle>
            <p className="text-gray-600">הזן את הסיסמה החדשה שלך</p>
          </CardHeader>
          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert type="error" message={error} className="mb-6" onClose={() => setError('')} />
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="סיסמה חדשה"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />

              <Input
                label="אימות סיסמה"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button type="submit" className="w-full h-12" isLoading={isLoading}>
                  עדכן סיסמה
                </Button>
              </motion.div>
            </form>

            <p className="mt-6 text-center text-gray-600">
              נזכרת בסיסמה?{' '}
              <Link href="/login" className="text-primary hover:text-primary/80 font-semibold">
                חזור להתחברות
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
