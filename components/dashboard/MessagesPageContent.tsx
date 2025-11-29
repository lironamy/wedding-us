'use client';

import { motion } from 'framer-motion';
import { ScheduledMessages } from './ScheduledMessages';
import { AutomatedMessageSender } from './AutomatedMessageSender';
import { BlurText } from '@/components/ui/animated';

interface MessagesPageContentProps {
  weddingId: string;
}

// Animated SVG Icons for tabs
const TabIcons = {
  schedule: ({ color }: { color: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <motion.circle
        cx="12" cy="12" r="10"
        stroke={color}
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        d="M12 6v6l4 2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      />
    </svg>
  ),
  send: ({ color }: { color: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <motion.path
        d="M22 2L11 13"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4 }}
      />
      <motion.path
        d="M22 2L15 22L11 13L2 9L22 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      />
    </svg>
  ),
};

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-start gap-3 p-4 rounded-xl bg-white/50 backdrop-blur-sm"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-primary/20 to-pink-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
}

export default function MessagesPageContent({ weddingId }: MessagesPageContentProps) {
  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-6 md:p-8 text-white"
      >
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-24 translate-y-24" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full" />

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="absolute top-6 left-6 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </motion.div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-white/80 text-sm mb-2">מרכז ההודעות</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <BlurText text="שליחת הודעות" className="text-white" />
            </h1>
            <p className="text-white/90 text-lg max-w-xl">
              שלחו הודעות אוטומטיות לאורחים דרך WhatsApp - הזמנות, תזכורות והודעות תודה
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <FeatureCard
          icon={
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" strokeLinecap="round" />
              </svg>
            </motion.span>
          }
          title="תזמון אוטומטי"
          description="ההודעות נשלחות אוטומטית לפי לוח הזמנים"
          delay={0.4}
        />
        <FeatureCard
          icon={
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
          }
          title="שליחה ידנית"
          description="שליטה מלאה על מי מקבל הודעות"
          delay={0.5}
        />
        <FeatureCard
          icon={
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
          }
          title="התראות"
          description="קבלו עדכונים על כל שליחה"
          delay={0.6}
        />
      </motion.div>

      {/* Scheduled Messages Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
            className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30"
          >
            <TabIcons.schedule color="white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">תזמון אוטומטי</h2>
            <p className="text-gray-500 text-sm">הודעות שיישלחו אוטומטית</p>
          </div>
        </div>
        <ScheduledMessages weddingId={weddingId} />
      </motion.section>

      {/* Manual Message Sender Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.6 }}
            className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
          >
            <TabIcons.send color="white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">שליחה ידנית</h2>
            <p className="text-gray-500 text-sm">שלח הודעות לאורחים שבחרת</p>
          </div>
        </div>
        <AutomatedMessageSender weddingId={weddingId} />
      </motion.section>
    </div>
  );
}
