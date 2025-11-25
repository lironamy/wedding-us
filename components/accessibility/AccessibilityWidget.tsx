'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [linkHighlight, setLinkHighlight] = useState(false);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);

  // Apply settings to document
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    if (linkHighlight) {
      document.documentElement.classList.add('link-highlight');
    } else {
      document.documentElement.classList.remove('link-highlight');
    }
  }, [linkHighlight]);

  useEffect(() => {
    document.documentElement.style.setProperty('--line-height', lineHeight.toString());
  }, [lineHeight]);

  useEffect(() => {
    document.documentElement.style.setProperty('--letter-spacing', `${letterSpacing}px`);
  }, [letterSpacing]);

  const resetSettings = () => {
    setFontSize(100);
    setHighContrast(false);
    setLinkHighlight(false);
    setLineHeight(1.5);
    setLetterSpacing(0);
  };

  return (
    <>
      {/* Accessibility Button - Always visible */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-1 bottom-2 z-50 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="פתח תפריט נגישות"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      </motion.button>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-1 bottom-14 w-full max-w-sm max-h-[70vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                    <div>
                      <h2 className="text-lg font-bold">נגישות</h2>
                      <p className="text-xs text-blue-100">הגדרות נגישות</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                    aria-label="סגור תפריט נגישות"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {/* Font Size */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    גודל גופן: {fontSize}%
                  </label>
                  <input
                    type="range"
                    min="80"
                    max="200"
                    step="10"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    aria-label="שינוי גודל גופן"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>קטן</span>
                    <span>בינוני</span>
                    <span>גדול</span>
                  </div>
                </div>

                {/* Line Height */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    ריווח שורות: {lineHeight.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.1"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    aria-label="שינוי ריווח שורות"
                  />
                </div>

                {/* Letter Spacing */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    ריווח אותיות: {letterSpacing}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={letterSpacing}
                    onChange={(e) => setLetterSpacing(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    aria-label="שינוי ריווח אותיות"
                  />
                </div>

                {/* Toggle Options */}
                <div className="space-y-3 pt-3 border-t">
                  {/* High Contrast */}
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-900">ניגודיות גבוהה</span>
                        <span className="block text-xs text-gray-500">שיפור הבחנה בין צבעים</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={highContrast}
                        onChange={(e) => setHighContrast(e.target.checked)}
                        className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-blue-600 cursor-pointer transition-colors peer"
                        aria-label="הפעל ניגודיות גבוהה"
                      />
                      <span className="absolute w-5 h-5 rounded-full bg-white top-0.5 right-0.5 transition-all pointer-events-none peer-checked:right-6"></span>
                    </div>
                  </label>

                  {/* Link Highlight */}
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-900">הדגשת קישורים</span>
                        <span className="block text-xs text-gray-500">סימון ברור של כל הקישורים</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={linkHighlight}
                        onChange={(e) => setLinkHighlight(e.target.checked)}
                        className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-blue-600 cursor-pointer transition-colors peer"
                        aria-label="הפעל הדגשת קישורים"
                      />
                      <span className="absolute w-5 h-5 rounded-full bg-white top-0.5 right-0.5 transition-all pointer-events-none peer-checked:right-6"></span>
                    </div>
                  </label>
                </div>

                {/* Reset Button */}
                <button
                  onClick={resetSettings}
                  className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  איפוס הגדרות
                </button>

                {/* Accessibility Statement */}
                <div className="pt-3 border-t space-y-3">
                  <h3 className="text-base font-bold text-gray-900">הצהרת נגישות</h3>

                  <div className="text-gray-700 space-y-2">
                    <p className="text-xs">
                      לונסול מחויבת להנגיש את שירותיה לכלל האוכלוסייה, לרבות אנשים עם מוגבלות.
                      האתר הונגש בהתאם לתקן הישראלי (ת"י 5568) ברמת AA.
                    </p>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="font-semibold text-blue-900 mb-1 text-xs">תמיכה טכנית:</p>
                      <ul className="text-xs space-y-0.5 text-blue-800">
                        <li>✓ ניווט באמצעות מקלדת</li>
                        <li>✓ תמיכה בתוכנות הקראת מסך</li>
                        <li>✓ ניגודיות צבעים מספקת</li>
                        <li>✓ טקסטים חלופיים לתמונות</li>
                        <li>✓ גופנים ברורים וקריאים</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-semibold mb-1 text-xs">רכז נגישות:</p>
                      <p className="text-xs">צוות לונסול</p>
                      <a
                        href="mailto:lironamy@gmail.com"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        lironamy@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Link to Full Accessibility Page */}
                  <a
                    href="/accessibility"
                    target="_blank"
                    className="block w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
                  >
                    הצהרת נגישות מלאה
                  </a>
                </div>

                {/* Keyboard Shortcuts Info */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <h4 className="font-semibold text-gray-900 text-xs">קיצורי מקלדת:</h4>
                  <div className="space-y-1.5 text-xs text-gray-700">
                    <div className="flex justify-between items-center">
                      <span>פתיחת תפריט נגישות:</span>
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">Alt + A</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>ניווט קדימה:</span>
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">Tab</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>ניווט אחורה:</span>
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">Shift + Tab</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>הגדלת גופן:</span>
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">Ctrl + +</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Styles */}
      <style jsx global>{`
        .high-contrast {
          background-color: #000000 !important;
        }
        .high-contrast body {
          background-color: #000000 !important;
          color: #FFFFFF !important;
        }
        .high-contrast * {
          background-color: #00000000 !important;
          color: #FFFFFF !important;
          border-color: #FFFFFF !important;
        }
        .high-contrast a {
          color: #FFFF00 !important;
          text-decoration: underline !important;
        }
        .high-contrast button {
          background-color: #FFFFFF !important;
          color: #000000 !important;
          border: 2px solid #FFFFFF !important;
        }
        .high-contrast input,
        .high-contrast textarea,
        .high-contrast select {
          background-color: #000000 !important;
          color: #FFFFFF !important;
          border: 2px solid #FFFFFF !important;
        }
        .high-contrast img {
          filter: contrast(1.2) brightness(0.9);
        }
        .high-contrast svg {
          filter: invert(1);
        }

        .link-highlight a {
          text-decoration: underline !important;
          text-decoration-thickness: 2px !important;
          text-underline-offset: 3px !important;
        }

        :root {
          --line-height: 1.5;
          --letter-spacing: 0;
        }

        body * {
          line-height: var(--line-height) !important;
          letter-spacing: var(--letter-spacing) !important;
        }
      `}</style>
    </>
  );
}
