"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const features = [
  {
    icon: "📧",
    title: "הזמנות דיגיטליות",
    description: "צור הזמנות אלגנטיות עם תמונות וסרטונים, התאם אישית את העיצוב והצבעים",
    color: "from-pink-500/20 to-rose-500/20",
  },
  {
    icon: "👥",
    title: "ניהול אורחים",
    description: "ייבוא אורחים מאקסל, מעקב אחר אישורי הגעה, וניהול קבוצות משפחתיות",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: "💬",
    title: "הודעות WhatsApp",
    description: "שלח הזמנות ותזכורות דרך WhatsApp באופן אוטומטי עם קישורים מותאמים אישית",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: "🪑",
    title: "סידורי ישיבה",
    description: "נהל שולחנות וסדר את האורחים בקלות עם ממשק גרירה ושחרור",
    color: "from-purple-500/20 to-violet-500/20",
  },
  {
    icon: "🎁",
    title: "מעקב מתנות",
    description: "עקוב אחר מתנות שהתקבלו באמצעות Bit ו-Paybox בקלות",
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    icon: "📊",
    title: "דוחות וסטטיסטיקות",
    description: "קבל תמונה מלאה של אישורי ההגעה, מספר האורחים והמתנות",
    color: "from-teal-500/20 to-cyan-500/20",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

export default function AnimatedFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="py-32 overflow-hidden bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#6e6262] mb-6">
            הכל במקום אחד
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            פלטפורמה מקיפה לניהול הזמנות לחתונה, אישורי הגעה, סידורי ישיבה ומעקב אחר מתנות
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              className={`relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100 overflow-hidden group`}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Content */}
              <div className="relative z-10">
                <motion.div
                  className="text-5xl mb-6"
                  whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-bold mb-3 text-[#6e6262]">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>

              {/* Hover Effect Line */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
