"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

export default function WhatsAppShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [5, -5]);

  return (
    <section ref={ref} className="md:py-20 overflow-hidden bg-[#f8f5f2]">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16 pb-[35px] lg:pb-0">
          {/* Text Content */}
          <motion.div
            className="flex-1 text-center lg:text-right"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="font-semibold">שליחת הודעות מרובות</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#6e6262] mb-6 leading-tight">
              שליחה ישירה
              <br />
              <span className="text-primary">לוואטסאפ</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              שלחו הזמנות מותאמות אישית ישירות לוואטסאפ של האורחים.
              קבלו אישורי הגעה במקום ועקבו אחר הסטטוס בזמן אמת.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-max mx-auto lg:mx-0">
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <div className="text-3xl font-bold text-primary">5 סבבי הודעות</div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <div className="text-3xl font-bold text-primary">שליחה אוטומטית</div>
              </div>
            </div>
          </motion.div>

          {/* WhatsApp Image */}
          <motion.div
            className="flex-1 flex justify-center"
            style={{ y, rotate }}
          >
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            >
              {/* Image Container */}
              <div className="relative w-[280px] md:w-[300px] h-[580px] md:h-[620px] rounded-[2rem] overflow-hidden">
                <Image
                  src="https://64.media.tumblr.com/64bf99c8e83104f407fd153646a503d1/7e1bc881a3987955-11/s1280x1920/a3975998f345b7bcd0f6bd91ac149208bc014192.pnj"
                  alt="WhatsApp message preview"
                  fill
                  className="object-cover object-top"
                />
              </div>

              {/* WhatsApp Notification Bubble */}
              <motion.div
                className="absolute -top-4 -right-4 bg-primary text-white rounded-full px-4 py-2 shadow-lg"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              >
                <span className="font-bold">הזמנה חדשה!</span>
              </motion.div>

              {/* Decorative Elements */}
              <motion.div
                className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary/30 rounded-full blur-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
