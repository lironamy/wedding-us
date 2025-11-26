"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function InvitationShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 overflow-hidden bg-[#FAFAFA]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Text Content */}
          <motion.div
            className="flex-1 text-center lg:text-right"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#6e6262] mb-6 leading-tight">
              הזמנות דיגיטליות
              <br />
              <span className="text-primary">שמרגשות</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              צרו חוויה בלתי נשכחת לאורחים שלכם עם הזמנות אינטראקטיביות
              שכוללות תמונות, סרטונים ואפקטים מרהיבים
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎬</span>
                <span className="text-gray-600">סרטונים מותאמים</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span className="text-gray-600">אפקטים מיוחדים</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📱</span>
                <span className="text-gray-600">תצוגה מושלמת בנייד</span>
              </div>
            </div>
          </motion.div>

          {/* Video */}
          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, y: 100, rotateY: -15 }}
            animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          >
            <div className="relative">
              {/* Video Container */}
              <div className="relative w-[280px] md:w-[300px] h-[500px] md:h-[660px] overflow-hidden">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                >
                  <source src="https://va.media.tumblr.com/tumblr_t64zyh6W3H1zsx3om.mp4" type="video/mp4" />
                </video>
              </div>

              {/* Decorative Elements */}
              <motion.div
                className="absolute -top-8 -right-8 w-24 h-24 bg-transparent rounded-full blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-8 -left-8 w-32 h-32 bg-transparent rounded-full blur-2xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
