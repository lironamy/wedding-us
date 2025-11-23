'use client';

import Lottie from 'lottie-react';
import { CSSProperties, useEffect, useState } from 'react';

// Lottie animation URLs from LottieFiles
export const LOTTIE_URLS = {
  loading: 'https://lottie.host/c8bd4d68-2e82-43a3-8c6e-3b17e03ad6e4/cJCPqXE00V.json',
  success: 'https://lottie.host/5e0d1a8c-9c8a-4e0f-8a5f-6b3d9e8b7c0d/success.json',
  empty: 'https://lottie.host/e1f5c8a7-9d4e-4f3a-8b2c-1a0d9e8f7c6b/empty.json',
  celebration: 'https://lottie.host/f2e6d9c8-7a5b-4e3f-9c1d-2b0a8f7e6d5c/celebration.json',
  confetti: 'https://lottie.host/3c8b5f91-9b3a-4d1e-8c5f-7a2b0e9d4f6c/confetti.json',
  // Stats icons
  guests: 'https://lottie.host/0fbd9a87-2d1b-45ad-a7c9-dfe60ffaa21a/people.json',
  confirmed: 'https://lottie.host/c3a0c1f3-54bf-4e39-9b3c-5b2f6d7e8f9a/confirmed.json',
  declined: 'https://lottie.host/d4b1d2f4-65cg-5f4a-ac4d-6c3g7e8f0b1b/declined.json',
  pending: 'https://lottie.host/e5c2e3f5-76dh-6g5b-bd5e-7d4h8f9g1c2c/pending.json',
  adults: 'https://lottie.host/f6d3f4g6-87ei-7h6c-ce6f-8e5i9g0h2d3d/adults.json',
  children: 'https://lottie.host/g7e4g5h7-98fj-8i7d-df7g-9f6j0h1i3e4e/children.json',
};

// Inline Lottie data for common animations
export const LOTTIE_DATA: Record<string, any> = {
  // People/Guests icon - animated circles
  guests: {
    v: '5.7.4', fr: 30, ip: 0, op: 60, w: 100, h: 100, nm: 'Guests',
    layers: [{
      ddd: 0, ind: 1, ty: 4, nm: 'People', sr: 1,
      ks: { o: { a: 0, k: 100 }, p: { a: 0, k: [50, 50] }, s: { a: 1, k: [{ t: 0, s: [95, 95] }, { t: 30, s: [100, 100] }, { t: 60, s: [95, 95] }] } },
      shapes: [
        { ty: 'el', s: { a: 0, k: [25, 25] }, p: { a: 0, k: [-15, -10] } },
        { ty: 'el', s: { a: 0, k: [25, 25] }, p: { a: 0, k: [15, -10] } },
        { ty: 'rc', s: { a: 0, k: [55, 30] }, p: { a: 0, k: [0, 18] }, r: { a: 0, k: 10 } },
        { ty: 'fl', c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } }
      ]
    }]
  },
  // Checkmark for confirmed
  confirmed: {
    v: '5.7.4', fr: 60, ip: 0, op: 60, w: 100, h: 100, nm: 'Confirmed',
    layers: [{
      ddd: 0, ind: 1, ty: 4, nm: 'Check', sr: 1,
      ks: { o: { a: 0, k: 100 }, p: { a: 0, k: [50, 50] }, s: { a: 1, k: [{ t: 0, s: [90, 90] }, { t: 30, s: [100, 100] }, { t: 60, s: [90, 90] }] } },
      shapes: [{
        ty: 'gr', it: [
          { ty: 'sh', ks: { a: 0, k: { c: false, v: [[-20, 0], [-5, 15], [20, -15]], i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]] } } },
          { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, w: { a: 0, k: 8 }, lc: 2, lj: 2 },
          { ty: 'tm', s: { a: 0, k: 0 }, e: { a: 1, k: [{ t: 0, s: [0] }, { t: 30, s: [100] }] } }
        ]
      }]
    }]
  },
  // X mark for declined
  declined: {
    v: '5.7.4', fr: 60, ip: 0, op: 60, w: 100, h: 100, nm: 'Declined',
    layers: [{
      ddd: 0, ind: 1, ty: 4, nm: 'X', sr: 1,
      ks: { o: { a: 0, k: 100 }, p: { a: 0, k: [50, 50] }, s: { a: 1, k: [{ t: 0, s: [90, 90] }, { t: 30, s: [100, 100] }, { t: 60, s: [90, 90] }] } },
      shapes: [
        { ty: 'gr', it: [
          { ty: 'sh', ks: { a: 0, k: { c: false, v: [[-15, -15], [15, 15]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] } } },
          { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, w: { a: 0, k: 8 }, lc: 2 }
        ]},
        { ty: 'gr', it: [
          { ty: 'sh', ks: { a: 0, k: { c: false, v: [[15, -15], [-15, 15]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] } } },
          { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, w: { a: 0, k: 8 }, lc: 2 }
        ]}
      ]
    }]
  },
  // Hourglass for pending
  pending: {
    v: '5.7.4', fr: 30, ip: 0, op: 90, w: 100, h: 100, nm: 'Pending',
    layers: [{
      ddd: 0, ind: 1, ty: 4, nm: 'Hourglass', sr: 1,
      ks: { o: { a: 0, k: 100 }, p: { a: 0, k: [50, 50] }, r: { a: 1, k: [{ t: 0, s: [0] }, { t: 45, s: [180] }, { t: 90, s: [360] }] } },
      shapes: [
        { ty: 'rc', s: { a: 0, k: [30, 8] }, p: { a: 0, k: [0, -25] }, r: { a: 0, k: 2 } },
        { ty: 'rc', s: { a: 0, k: [30, 8] }, p: { a: 0, k: [0, 25] }, r: { a: 0, k: 2 } },
        { ty: 'gr', it: [
          { ty: 'sh', ks: { a: 0, k: { c: true, v: [[-12, -20], [0, 0], [12, -20], [12, -20], [-12, -20]], i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]] } } }
        ]},
        { ty: 'gr', it: [
          { ty: 'sh', ks: { a: 0, k: { c: true, v: [[-12, 20], [0, 0], [12, 20], [12, 20], [-12, 20]], i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]] } } }
        ]},
        { ty: 'fl', c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } }
      ]
    }]
  },
  // Person for adults
  adults: {
    v: '5.7.4', fr: 30, ip: 0, op: 60, w: 100, h: 100, nm: 'Adults',
    layers: [{
      ddd: 0, ind: 1, ty: 4, nm: 'Person', sr: 1,
      ks: { o: { a: 0, k: 100 }, p: { a: 0, k: [50, 50] }, s: { a: 1, k: [{ t: 0, s: [95, 95] }, { t: 30, s: [100, 100] }, { t: 60, s: [95, 95] }] } },
      shapes: [
        { ty: 'el', s: { a: 0, k: [22, 22] }, p: { a: 0, k: [0, -18] } },
        { ty: 'rc', s: { a: 0, k: [28, 35] }, p: { a: 0, k: [0, 12] }, r: { a: 0, k: 8 } },
        { ty: 'fl', c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } }
      ]
    }]
  },
  // Small person for children
  children: {
    v: '5.7.4', fr: 30, ip: 0, op: 60, w: 100, h: 100, nm: 'Children',
    layers: [{
      ddd: 0, ind: 1, ty: 4, nm: 'Child', sr: 1,
      ks: { o: { a: 0, k: 100 }, p: { a: 0, k: [50, 55] }, s: { a: 1, k: [{ t: 0, s: [90, 90] }, { t: 15, s: [95, 85] }, { t: 30, s: [90, 90] }, { t: 45, s: [95, 85] }, { t: 60, s: [90, 90] }] } },
      shapes: [
        { ty: 'el', s: { a: 0, k: [20, 20] }, p: { a: 0, k: [0, -15] } },
        { ty: 'rc', s: { a: 0, k: [22, 25] }, p: { a: 0, k: [0, 5] }, r: { a: 0, k: 6 } },
        { ty: 'fl', c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } }
      ]
    }]
  },
  loading: {
    v: '5.7.4',
    fr: 30,
    ip: 0,
    op: 60,
    w: 200,
    h: 200,
    nm: 'Loading',
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: 'Circle',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: {
            a: 1,
            k: [
              { t: 0, s: [0], e: [360] },
              { t: 60, s: [360] },
            ],
          },
          p: { a: 0, k: [100, 100] },
          a: { a: 0, k: [0, 0] },
          s: { a: 0, k: [100, 100] },
        },
        shapes: [
          {
            ty: 'el',
            s: { a: 0, k: [60, 60] },
            p: { a: 0, k: [0, 0] },
          },
          {
            ty: 'st',
            c: { a: 0, k: [0.769, 0.647, 0.482, 1] }, // Gold color
            o: { a: 0, k: 100 },
            w: { a: 0, k: 6 },
            lc: 2,
            lj: 2,
            d: [
              { n: 'd', nm: 'dash', v: { a: 0, k: 40 } },
              { n: 'g', nm: 'gap', v: { a: 0, k: 120 } },
            ],
          },
        ],
      },
    ],
  },
  checkmark: {
    v: '5.7.4',
    fr: 60,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    nm: 'Checkmark',
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: 'Check',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          p: { a: 0, k: [50, 50] },
        },
        shapes: [
          {
            ty: 'gr',
            it: [
              {
                ty: 'sh',
                ks: {
                  a: 0,
                  k: {
                    c: false,
                    v: [
                      [-20, 0],
                      [-5, 15],
                      [20, -15],
                    ],
                    i: [
                      [0, 0],
                      [0, 0],
                      [0, 0],
                    ],
                    o: [
                      [0, 0],
                      [0, 0],
                      [0, 0],
                    ],
                  },
                },
              },
              {
                ty: 'st',
                c: { a: 0, k: [0.133, 0.545, 0.133, 1] }, // Green
                w: { a: 0, k: 8 },
                lc: 2,
                lj: 2,
              },
              {
                ty: 'tm',
                s: { a: 0, k: 0 },
                e: {
                  a: 1,
                  k: [
                    { t: 0, s: [0], e: [100] },
                    { t: 30, s: [100] },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
};

interface LottieAnimationProps {
  animation: keyof typeof LOTTIE_DATA | keyof typeof LOTTIE_URLS;
  size?: number;
  loop?: boolean;
  autoplay?: boolean;
  style?: CSSProperties;
  className?: string;
}

export function LottieAnimation({
  animation,
  size = 100,
  loop = true,
  autoplay = true,
  style,
  className = '',
}: LottieAnimationProps) {
  const animationData = LOTTIE_DATA[animation as keyof typeof LOTTIE_DATA];

  if (!animationData) {
    // Fallback to a simple CSS spinner
    return (
      <div
        className={`animate-spin rounded-full border-4 border-gold border-t-transparent ${className}`}
        style={{ width: size, height: size, ...style }}
      />
    );
  }

  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      style={{ width: size, height: size, ...style }}
      className={className}
    />
  );
}
