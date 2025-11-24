'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { Button, Input, Alert, Aurora, GradientText, SplitText } from '@/components/ui';

// Wedding rings Lottie animation
const WEDDING_ANIMATION = 'https://assets2.lottiefiles.com/packages/lf20_u4yrau.json';
// Fallback animation - celebration/confetti
const CELEBRATION_ANIMATION = 'https://assets2.lottiefiles.com/packages/lf20_lg6lh7fp.json';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animationData, setAnimationData] = useState<object | null>(null);

  // Load Lottie animation
  useState(() => {
    fetch(WEDDING_ANIMATION)
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(() => {});
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    if (formData.password.length < 8) {
      setError('הסיסמה חייבת להכיל לפחות 8 תווים');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'אירעה שגיאה בהרשמה');
        setIsLoading(false);
        return;
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('ההרשמה הצליחה, אך ההתחברות נכשלה. נסה להתחבר ידנית.');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('אירעה שגיאה. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (err) {
      setError('אירעה שגיאה בהתחברות עם Google');
      setIsLoading(false);
    }
  };

  // Animation variants for staggered form fields
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-8 bg-white"
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-3xl font-bold">
              <GradientText>ניהול חתונות</GradientText>
            </h1>
          </div>

          {/* Welcome Text */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              <SplitText text="צור חשבון חדש" delay={0.3} />
            </h2>
            <p className="text-gray-500">הצטרפו אלינו ותתחילו לתכנן את החתונה המושלמת</p>
          </motion.div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Alert type="error" message={error} className="mb-6" onClose={() => setError('')} />
            </motion.div>
          )}

          {/* Register Form */}
          <motion.form
            onSubmit={handleSubmit}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <motion.div variants={itemVariants}>
              <Input
                label="שם מלא"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                label="אימייל"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                label="סיסמה"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                helperText="הסיסמה חייבת להכיל לפחות 8 תווים"
                required
                disabled={isLoading}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                label="אימות סיסמה"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button type="submit" className="w-full h-12 text-base mt-2" isLoading={isLoading}>
                הירשם
              </Button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">או</span>
            </div>
          </div>

          {/* Google Sign In */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-3 border-2 hover:bg-gray-50"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              הירשם עם Google
            </Button>
          </motion.div>

          {/* Login Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-center text-gray-600"
          >
            כבר יש לך חשבון?{' '}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              התחבר
            </Link>
          </motion.p>
        </div>
      </motion.div>

      {/* Right Side - Animation & Branding */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex w-1/2 min-h-screen relative overflow-hidden"
      >
        <Aurora className="absolute inset-0 w-full h-full bg-gradient-to-bl from-rose-50 via-pink-50 to-purple-50">
          <div className="flex flex-col items-center justify-center min-h-screen p-12">
            {/* Branding Text - Top */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-6"
            >
              <h1 className="text-5xl font-bold mb-3">
                <GradientText colors={['#f43f5e', '#ec4899', '#a855f7', '#f43f5e']}>
                  ניהול חתונות
                </GradientText>
              </h1>
              <p className="text-gray-600 text-xl">
                הפלטפורמה המושלמת לתכנון וניהול החתונה שלכם
              </p>
            </motion.div>

            {/* Lottie Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="w-64 h-64 mb-6"
            >
              {animationData ? (
                <Lottie animationData={animationData} loop={true} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <motion.div
                    className="relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    {/* Animated Rings */}
                    <motion.div
                      className="w-28 h-28 rounded-full border-4 border-pink-300 absolute"
                      style={{ top: -15, left: -35 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="w-28 h-28 rounded-full border-4 border-purple-300 absolute"
                      style={{ top: -15, left: 0 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                  </motion.div>
                </div>
              )}
            </motion.div>

            {/* Feature highlights */}
            <motion.div
              className="space-y-3 text-right"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[
                'ניהול רשימת מוזמנים',
                'מעקב אחר אישורי הגעה',
                'תכנון ישיבה חכם',
                'שליחת הזמנות דיגיטליות',
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  className="flex items-center gap-2 justify-end"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <span className="text-gray-600">{feature}</span>
                  <div className="w-5 h-5 rounded-full bg-linear-to-r from-pink-400 to-purple-400 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              className="absolute bottom-10 right-10"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="w-16 h-16 rounded-full bg-rose-200/50 blur-xl" />
            </motion.div>
            <motion.div
              className="absolute top-20 left-20"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="w-20 h-20 rounded-full bg-purple-200/50 blur-xl" />
            </motion.div>
          </div>
        </Aurora>
      </motion.div>
    </div>
  );
}
