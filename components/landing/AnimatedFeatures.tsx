"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

// Animated SVG Icons
const AnimatedIcons = {
  invitation: ({ isHovered }: { isHovered: boolean }) => (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
      {/* Envelope body */}
      <motion.rect
        x="8"
        y="16"
        width="48"
        height="36"
        rx="4"
        fill="#ede9fe"
        stroke="#7c3aed"
        strokeWidth="2"
      />
      {/* Envelope flap */}
      <motion.path
        d="M8 20L32 38L56 20"
        stroke="#7c3aed"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        animate={isHovered ? { d: "M8 16L32 32L56 16" } : { d: "M8 20L32 38L56 20" }}
        transition={{ duration: 0.3 }}
      />
      {/* Heart */}
      <motion.path
        d="M32 28C32 28 28 24 25 24C22 24 20 26.5 20 29C20 34 32 40 32 40C32 40 44 34 44 29C44 26.5 42 24 39 24C36 24 32 28 32 28Z"
        fill="#7c3aed"
        animate={isHovered ? { scale: 1.2, y: -2 } : { scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ transformOrigin: "center" }}
      />
    </svg>
  ),

  guests: ({ isHovered }: { isHovered: boolean }) => (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
      {/* Person 1 (center) */}
      <motion.circle
        cx="32"
        cy="20"
        r="8"
        fill="#7c3aed"
        animate={isHovered ? { y: -3 } : { y: 0 }}
        transition={{ duration: 0.3 }}
      />
      <motion.path
        d="M20 52C20 42 24 36 32 36C40 36 44 42 44 52"
        stroke="#7c3aed"
        strokeWidth="3"
        strokeLinecap="round"
        fill="#ede9fe"
        animate={isHovered ? { y: -3 } : { y: 0 }}
        transition={{ duration: 0.3 }}
      />
      {/* Person 2 (left) */}
      <motion.circle
        cx="14"
        cy="26"
        r="6"
        fill="#a78bfa"
        animate={isHovered ? { x: -4, y: -2 } : { x: 0, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
      <motion.path
        d="M4 52C4 44 8 40 14 40C18 40 22 42 24 46"
        stroke="#a78bfa"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        animate={isHovered ? { x: -4 } : { x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
      {/* Person 3 (right) */}
      <motion.circle
        cx="50"
        cy="26"
        r="6"
        fill="#a78bfa"
        animate={isHovered ? { x: 4, y: -2 } : { x: 0, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
      <motion.path
        d="M60 52C60 44 56 40 50 40C46 40 42 42 40 46"
        stroke="#a78bfa"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        animate={isHovered ? { x: 4 } : { x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
    </svg>
  ),

  whatsapp: ({ isHovered }: { isHovered: boolean }) => (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
      {/* Phone shape */}
      <motion.rect
        x="16"
        y="4"
        width="32"
        height="56"
        rx="6"
        fill="#ede9fe"
        stroke="#7c3aed"
        strokeWidth="2"
      />
      {/* Screen */}
      <rect x="20" y="12" width="24" height="36" rx="2" fill="white" />
      {/* Message bubbles */}
      <motion.rect
        x="22"
        y="16"
        width="16"
        height="8"
        rx="4"
        fill="#7c3aed"
        animate={isHovered ? { x: 2, opacity: 1 } : { x: 0, opacity: 0.9 }}
        transition={{ duration: 0.2 }}
      />
      <motion.rect
        x="26"
        y="28"
        width="14"
        height="8"
        rx="4"
        fill="#ede9fe"
        stroke="#7c3aed"
        strokeWidth="1"
        animate={isHovered ? { x: -2, opacity: 1 } : { x: 0, opacity: 0.9 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      />
      <motion.rect
        x="22"
        y="40"
        width="12"
        height="6"
        rx="3"
        fill="#7c3aed"
        animate={isHovered ? { x: 2, scale: 1.1 } : { x: 0, scale: 1 }}
        transition={{ duration: 0.2, delay: 0.2 }}
      />
      {/* WhatsApp icon hint */}
      <motion.circle
        cx="32"
        cy="56"
        r="3"
        fill="#7c3aed"
        animate={isHovered ? { scale: 1.3 } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      />
    </svg>
  ),

  seating: ({ isHovered }: { isHovered: boolean }) => {
    // Pre-calculated chair positions to avoid hydration mismatch
    const chairPositions = [
      { cx: 58, cy: 32, hoverCx: 54.5, hoverCy: 19 },    // 0 degrees -> 30 degrees
      { cx: 45, cy: 54.5, hoverCx: 32, hoverCy: 58 },    // 60 degrees -> 90 degrees
      { cx: 19, cy: 54.5, hoverCx: 9.5, hoverCy: 45 },   // 120 degrees -> 150 degrees
      { cx: 6, cy: 32, hoverCx: 9.5, hoverCy: 19 },      // 180 degrees -> 210 degrees
      { cx: 19, cy: 9.5, hoverCx: 32, hoverCy: 6 },      // 240 degrees -> 270 degrees
      { cx: 45, cy: 9.5, hoverCx: 54.5, hoverCy: 19 },   // 300 degrees -> 330 degrees
    ];

    return (
      <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
        {/* Table (circle) */}
        <motion.circle
          cx="32"
          cy="32"
          r="16"
          fill="#ede9fe"
          stroke="#7c3aed"
          strokeWidth="2"
          animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: "center" }}
        />
        {/* Chairs around table */}
        {chairPositions.map((pos, i) => (
          <motion.circle
            key={i}
            cx={pos.cx}
            cy={pos.cy}
            r="5"
            fill="#7c3aed"
            animate={isHovered ? {
              cx: pos.hoverCx,
              cy: pos.hoverCy,
            } : {
              cx: pos.cx,
              cy: pos.cy,
            }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          />
        ))}
        {/* Center decoration */}
        <motion.circle
          cx="32"
          cy="32"
          r="4"
          fill="#7c3aed"
          animate={isHovered ? { scale: 1.3 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: "center" }}
        />
      </svg>
    );
  },

  gift: ({ isHovered }: { isHovered: boolean }) => (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
      {/* Box bottom */}
      <motion.rect
        x="10"
        y="28"
        width="44"
        height="28"
        rx="4"
        fill="#ede9fe"
        stroke="#7c3aed"
        strokeWidth="2"
      />
      {/* Box lid */}
      <motion.rect
        x="6"
        y="20"
        width="52"
        height="10"
        rx="3"
        fill="#ddd6fe"
        stroke="#7c3aed"
        strokeWidth="2"
        animate={isHovered ? { y: 14, rotate: -5 } : { y: 20, rotate: 0 }}
        transition={{ duration: 0.3 }}
        style={{ transformOrigin: "center bottom" }}
      />
      {/* Vertical ribbon */}
      <motion.rect
        x="29"
        y="20"
        width="6"
        height="36"
        fill="#7c3aed"
      />
      {/* Horizontal ribbon */}
      <rect x="10" y="38" width="44" height="6" fill="#7c3aed" />
      {/* Bow */}
      <motion.g
        animate={isHovered ? { scale: 1.2, y: -8 } : { scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ transformOrigin: "32px 20px" }}
      >
        <ellipse cx="24" cy="16" rx="8" ry="5" fill="#7c3aed" />
        <ellipse cx="40" cy="16" rx="8" ry="5" fill="#7c3aed" />
        <circle cx="32" cy="18" r="4" fill="#a78bfa" />
      </motion.g>
      {/* Sparkles when hovered */}
      {isHovered && (
        <>
          <motion.circle
            cx="52"
            cy="12"
            r="2"
            fill="#a78bfa"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.circle
            cx="12"
            cy="14"
            r="1.5"
            fill="#a78bfa"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          />
          <motion.circle
            cx="48"
            cy="8"
            r="1"
            fill="#a78bfa"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          />
        </>
      )}
    </svg>
  ),

  stats: ({ isHovered }: { isHovered: boolean }) => (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
      {/* Chart background */}
      <rect x="8" y="8" width="48" height="48" rx="4" fill="#ede9fe" stroke="#7c3aed" strokeWidth="2" />
      {/* Grid lines */}
      <path d="M8 24H56M8 40H56" stroke="#ddd6fe" strokeWidth="1" />
      {/* Bars */}
      <motion.rect
        x="14"
        y="32"
        width="8"
        height="18"
        rx="2"
        fill="#7c3aed"
        animate={isHovered ? { height: 28, y: 22 } : { height: 18, y: 32 }}
        transition={{ duration: 0.4, delay: 0 }}
      />
      <motion.rect
        x="28"
        y="24"
        width="8"
        height="26"
        rx="2"
        fill="#a78bfa"
        animate={isHovered ? { height: 34, y: 16 } : { height: 26, y: 24 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      />
      <motion.rect
        x="42"
        y="18"
        width="8"
        height="32"
        rx="2"
        fill="#7c3aed"
        animate={isHovered ? { height: 38, y: 12 } : { height: 32, y: 18 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />
      {/* Trend line */}
      <motion.path
        d="M18 36L32 28L46 20"
        stroke="#5b21b6"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        animate={isHovered ? { d: "M18 28L32 20L46 12" } : { d: "M18 36L32 28L46 20" }}
        transition={{ duration: 0.4 }}
      />
      {/* Trend dots */}
      <motion.circle
        cx="18"
        cy="36"
        r="3"
        fill="#5b21b6"
        animate={isHovered ? { cy: 28 } : { cy: 36 }}
        transition={{ duration: 0.4 }}
      />
      <motion.circle
        cx="32"
        cy="28"
        r="3"
        fill="#5b21b6"
        animate={isHovered ? { cy: 20 } : { cy: 28 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      />
      <motion.circle
        cx="46"
        cy="20"
        r="3"
        fill="#5b21b6"
        animate={isHovered ? { cy: 12 } : { cy: 20 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />
    </svg>
  ),
};

const features = [
  {
    type: "invitation" as const,
    title: "הזמנות דיגיטליות",
    description: "צור הזמנות אלגנטיות עם תמונות וסרטונים, התאם אישית את העיצוב והצבעים",
    color: "from-primary/10 to-accent/10",
    iconBg: "bg-primary/10",
  },
  {
    type: "guests" as const,
    title: "ניהול אורחים",
    description: "ייבוא אורחים מאקסל, מעקב אחר אישורי הגעה, וניהול קבוצות משפחתיות",
    color: "from-primary/10 to-accent/10",
    iconBg: "bg-primary/10",
  },
  {
    type: "whatsapp" as const,
    title: "הודעות WhatsApp",
    description: "שלח הזמנות ותזכורות דרך WhatsApp באופן אוטומטי עם קישורים מותאמים אישית",
    color: "from-primary/10 to-accent/10",
    iconBg: "bg-primary/10",
  },
  {
    type: "seating" as const,
    title: "סידור הושבה",
    description: "נהל שולחנות וסדר את האורחים בקלות עם ממשק גרירה ושחרור",
    color: "from-primary/10 to-accent/10",
    iconBg: "bg-primary/10",
  },
  {
    type: "gift" as const,
    title: "מעקב מתנות",
    description: "עקוב אחר מתנות שהתקבלו באמצעות Bit ו-Paybox בקלות",
    color: "from-primary/10 to-accent/10",
    iconBg: "bg-primary/10",
  },
  {
    type: "stats" as const,
    title: "דוחות וסטטיסטיקות",
    description: "קבל תמונה מלאה של אישורי ההגעה, מספר האורחים והמתנות",
    color: "from-primary/10 to-accent/10",
    iconBg: "bg-primary/10",
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section ref={ref} className="pb-4 md:py-20 overflow-hidden bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
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
          {features.map((feature, index) => {
            const IconComponent = AnimatedIcons[feature.type];
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className={`relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100 overflow-hidden group`}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative z-10">
                  <motion.div
                    className={`w-20 h-20 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <IconComponent isHovered={isHovered} />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3 text-[#6e6262]">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>

                {/* Hover Effect Line */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
