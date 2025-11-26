'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TEMPLATES, type TemplateInfo } from '@/components/invitation/templates/types';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

export default function TemplateSelector({ selectedTemplate, onSelectTemplate }: TemplateSelectorProps) {
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">בחר עיצוב להזמנה</h3>
        <p className="text-sm text-gray-500">לחץ על העיצוב הרצוי לבחירה</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {TEMPLATES.map((template) => (
          <motion.button
            key={template.id}
            type="button"
            onClick={() => onSelectTemplate(template.id)}
            onMouseEnter={() => setPreviewTemplate(template.id)}
            onMouseLeave={() => setPreviewTemplate(null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative rounded-xl overflow-hidden border-2 transition-all duration-300
              ${selectedTemplate === template.id
                ? 'border-primary ring-2 ring-primary/30'
                : 'border-gray-200 hover:border-gray-300'}
            `}
          >
            {/* Template Preview */}
            <div
              className="aspect-[3/4] relative"
              style={{
                background: `linear-gradient(135deg, ${template.colors.accent} 0%, ${template.colors.primary}20 50%, ${template.colors.secondary}20 100%)`
              }}
            >
              {/* Decorative elements based on template */}
              {template.id === 'classic' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl text-gray-400 font-serif">A & B</div>
                    <div className="w-16 h-px bg-gray-300 mx-auto mt-2" />
                  </div>
                </div>
              )}

              {template.id === 'romantic-garden' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🌸</div>
                    <div className="text-2xl text-pink-400" style={{ fontFamily: 'cursive' }}>A & B</div>
                    <div className="text-xl mt-1">🌷</div>
                  </div>
                </div>
              )}

              {template.id === 'luxury-minimal' && (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  <div className="text-center">
                    <div className="text-3xl tracking-[0.3em] text-gray-800 font-light">A</div>
                    <div className="text-xl text-yellow-600 my-1">&</div>
                    <div className="text-3xl tracking-[0.3em] text-gray-800 font-light">B</div>
                  </div>
                </div>
              )}

              {template.id === 'art-deco' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center border-2 border-yellow-500 p-4">
                    <div className="text-2xl text-yellow-500 tracking-widest">A & B</div>
                    <div className="flex justify-center gap-2 mt-2">
                      <span className="text-yellow-500">◆</span>
                      <span className="text-yellow-500">◆</span>
                      <span className="text-yellow-500">◆</span>
                    </div>
                  </div>
                </div>
              )}

              {template.id === 'starry-night' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg, #0D0D2B 0%, #191970 50%, #301934 100%)' }}
                >
                  <div className="text-center">
                    <div className="text-xs text-yellow-300 mb-1">✦ ✦ ✦</div>
                    <div className="text-2xl text-white" style={{ fontFamily: 'cursive' }}>A & B</div>
                    <div className="text-yellow-400 text-lg mt-1">☽</div>
                  </div>
                </div>
              )}

              {template.id === 'mediterranean' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg, #40E0D0 0%, #FFCBA4 100%)' }}
                >
                  <div className="text-center">
                    <div className="text-2xl text-white drop-shadow">🌊 A & B 🌊</div>
                  </div>
                </div>
              )}

              {template.id === 'enchanted-forest' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg, #0D1F0D 0%, #228B22 100%)' }}
                >
                  <div className="text-center">
                    <div className="text-xs text-yellow-300 mb-1">✨ ✨ ✨</div>
                    <div className="text-2xl text-green-200" style={{ fontFamily: 'serif' }}>A & B</div>
                    <div className="text-lg mt-1">🌿🦌🌿</div>
                  </div>
                </div>
              )}

              {template.id === 'marble-gold' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #E8E8E8 50%, #F5F5F5 100%)' }}
                >
                  <div className="text-center border border-yellow-600 p-3">
                    <div className="text-2xl text-gray-700 tracking-widest">A & B</div>
                    <div className="w-12 h-0.5 bg-yellow-600 mx-auto mt-2" />
                  </div>
                </div>
              )}

              {template.id === 'vintage-letters' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: '#FFF8DC' }}
                >
                  <div className="text-center">
                    <div className="text-xs text-amber-700 mb-1">📮 ✉️ 📮</div>
                    <div className="text-2xl text-amber-800" style={{ fontFamily: 'serif' }}>A & B</div>
                    <div className="text-xs text-amber-600 mt-1">~ 1920 ~</div>
                  </div>
                </div>
              )}

              {template.id === 'carnival' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg, #FF6B6B 0%, #4ECDC4 50%, #FFE66D 100%)' }}
                >
                  <div className="text-center">
                    <div className="text-lg">🎪🎠🎡</div>
                    <div className="text-2xl text-white font-bold" style={{ textShadow: '2px 2px 0 #FF6B6B' }}>A & B</div>
                    <div className="text-lg">🎈🎉🎈</div>
                  </div>
                </div>
              )}

              {template.id === 'beach-shells' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #F5DEB3 100%)' }}
                >
                  <div className="text-center">
                    <div className="text-lg">🐚 🌊 🐚</div>
                    <div className="text-2xl text-blue-700">A & B</div>
                    <div className="text-lg mt-1">🦪 ⭐ 🦪</div>
                  </div>
                </div>
              )}

              {template.id === 'japanese-zen' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: '#F5F5DC' }}
                >
                  <div className="text-center">
                    <div className="text-lg">🎋</div>
                    <div className="text-2xl text-gray-700" style={{ fontFamily: 'serif' }}>A & B</div>
                    <div className="w-6 h-6 mx-auto mt-2 rounded-full border-2 border-red-700 flex items-center justify-center">
                      <span className="text-red-700 text-xs">喜</span>
                    </div>
                  </div>
                </div>
              )}

              {template.id === 'jazz-club' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: '#1A1A2E' }}
                >
                  <div className="text-center">
                    <div className="text-lg">🎷🎺🎹</div>
                    <div className="text-2xl text-pink-500" style={{ textShadow: '0 0 10px #E94560' }}>A & B</div>
                    <div className="text-yellow-400 text-xs mt-1">♪ ♫ ♪</div>
                  </div>
                </div>
              )}

              {template.id === 'renaissance' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg, #FAF0E6 0%, #DEB887 100%)' }}
                >
                  <div className="text-center border-2 border-yellow-700 p-3 bg-white/50">
                    <div className="text-2xl text-red-900" style={{ fontFamily: 'serif' }}>A & B</div>
                    <div className="text-yellow-700 text-xs mt-1">⚜️ XVII ⚜️</div>
                  </div>
                </div>
              )}

              {template.id === 'scandinavian' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: '#FAFAF8' }}
                >
                  <div className="text-center">
                    <div className="text-xs text-amber-600 mb-2">🌿</div>
                    <div className="text-2xl text-gray-700 font-extralight tracking-wide">A & B</div>
                    <div className="w-8 h-px bg-amber-600 mx-auto mt-2" />
                  </div>
                </div>
              )}

              {template.id === 'cyber-pastel' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #F9A8D4 50%, #67E8F9 100%)' }}
                >
                  <div className="text-center">
                    <div className="text-lg">💜💗💙</div>
                    <div className="text-2xl text-white font-light">A & B</div>
                    <div className="text-xs text-white/80 mt-1">○ ○ ○</div>
                  </div>
                </div>
              )}

              {template.id === 'cosmic-galaxy' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg, #0D0D2B 0%, #4B0082 50%, #191970 100%)' }}
                >
                  <div className="text-center">
                    <div className="text-xs text-cyan-300">🌟 ✦ 🌟</div>
                    <div className="text-2xl text-purple-300" style={{ textShadow: '0 0 10px #9370DB' }}>A & B</div>
                    <div className="text-lg mt-1">🪐 🌌 🪐</div>
                  </div>
                </div>
              )}

              {template.id === 'tropical-paradise' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #20E3B2 50%, #FF9966 100%)' }}
                >
                  <div className="text-center">
                    <div className="text-lg">🌴🌺🌴</div>
                    <div className="text-2xl text-white font-bold" style={{ textShadow: '2px 2px 0 #FF6F91' }}>A & B</div>
                    <div className="text-lg mt-1">🦩🍍🦩</div>
                  </div>
                </div>
              )}

              {template.id === 'fairytale' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg, #E6E6FA 0%, #DDA0DD 100%)' }}
                >
                  <div className="text-center">
                    <div className="text-lg">👑</div>
                    <div className="text-2xl text-purple-700" style={{ fontFamily: 'cursive' }}>A & B</div>
                    <div className="text-xs text-purple-500 mt-1">✨ 🏰 ✨</div>
                  </div>
                </div>
              )}

              {template.id === 'industrial-chic' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: '#1C1C1C' }}
                >
                  <div className="text-center">
                    <div className="text-lg">⚙️💡⚙️</div>
                    <div className="text-2xl text-amber-600">A & B</div>
                    <div className="text-xs text-gray-500 mt-1">▬▬▬</div>
                  </div>
                </div>
              )}

              {template.id === 'watercolor' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: '#FFFEF8' }}
                >
                  <div className="text-center">
                    <div className="text-lg">🎨</div>
                    <div className="text-2xl text-gray-600" style={{ fontFamily: 'serif' }}>A & B</div>
                    <div className="flex justify-center gap-1 mt-2">
                      <div className="w-3 h-3 rounded-full bg-pink-200 opacity-60" />
                      <div className="w-3 h-3 rounded-full bg-cyan-200 opacity-60" />
                      <div className="w-3 h-3 rounded-full bg-purple-200 opacity-60" />
                    </div>
                  </div>
                </div>
              )}

              {template.id === 'moroccan' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg, #1E3A5F 0%, #0F2744 100%)' }}
                >
                  <div className="text-center">
                    <div className="text-lg">🏮</div>
                    <div className="text-2xl text-yellow-500">A & B</div>
                    <div className="text-yellow-600 text-xs mt-1">✦ ✦ ✦</div>
                  </div>
                </div>
              )}

              {template.id === 'winter-wonderland' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg, #E8F4F8 0%, #B8D4F0 100%)' }}
                >
                  <div className="text-center">
                    <div className="text-lg">❄️ ⛄ ❄️</div>
                    <div className="text-2xl text-blue-600">A & B</div>
                    <div className="text-purple-400 text-xs mt-1">❄ ❄ ❄</div>
                  </div>
                </div>
              )}

              {template.id === 'botanical' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: '#F5F5DC' }}
                >
                  <div className="text-center">
                    <div className="text-lg">🌿🍃🌿</div>
                    <div className="text-2xl text-green-800" style={{ fontFamily: 'serif' }}>A & B</div>
                    <div className="text-xs text-amber-700 mt-1">~ botanical ~</div>
                  </div>
                </div>
              )}

              {template.id === 'neon-futuristic' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: '#0D0D0D' }}
                >
                  <div className="text-center">
                    <div className="text-xs text-cyan-400 mb-1">// WELCOME //</div>
                    <div className="text-2xl text-pink-500" style={{ textShadow: '0 0 10px #FF00FF, 0 0 20px #FF00FF' }}>A</div>
                    <div className="text-cyan-400" style={{ textShadow: '0 0 10px #00FFFF' }}>&</div>
                    <div className="text-2xl text-cyan-400" style={{ textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF' }}>B</div>
                  </div>
                </div>
              )}

              {template.id === 'paper-cut' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg, #E8F4F8 0%, #C5D8E3 100%)' }}
                >
                  <div className="text-center">
                    <div className="text-lg">🕊️ 🌸 🕊️</div>
                    <div className="text-2xl text-blue-600">A & B</div>
                    <div className="text-pink-400 text-xs mt-1">♡ ♡ ♡</div>
                  </div>
                </div>
              )}

              {/* Selected checkmark */}
              {selectedTemplate === template.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm"
                >
                  ✓
                </motion.div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-3 bg-white">
              <h4 className="font-medium text-gray-800 text-sm">{template.nameHebrew}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Color Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 text-center">
          💡 ניתן לשנות את העיצוב בכל עת דרך הגדרות החתונה
        </p>
      </div>
    </div>
  );
}
