'use client';

import Lottie from 'lottie-react';
import { CSSProperties, useEffect, useState } from 'react';

// Lottie animation URLs from LottieFiles CDN (backup - inline LOTTIE_DATA is preferred)
export const LOTTIE_URLS = {
  loading: 'https://assets2.lottiefiles.com/packages/lf20_usmfx6bp.json',
  success: 'https://assets2.lottiefiles.com/packages/lf20_jbrw3hcz.json',
  empty: 'https://assets2.lottiefiles.com/packages/lf20_wnqlfojb.json',
  celebration: 'https://assets2.lottiefiles.com/packages/lf20_lg6lh7fp.json',
  confetti: 'https://assets2.lottiefiles.com/packages/lf20_u4yrau.json',
  // Stats icons - using inline LOTTIE_DATA instead
  guests: 'https://assets2.lottiefiles.com/packages/lf20_vnikrcia.json',
  confirmed: 'https://assets2.lottiefiles.com/packages/lf20_jbrw3hcz.json',
  declined: 'https://assets2.lottiefiles.com/packages/lf20_tl52xzvn.json',
  pending: 'https://assets2.lottiefiles.com/packages/lf20_usmfx6bp.json',
  adults: 'https://assets2.lottiefiles.com/packages/lf20_vnikrcia.json',
  children: 'https://assets2.lottiefiles.com/packages/lf20_vnikrcia.json',
};

// Inline Lottie data for common animations
export const LOTTIE_DATA: Record<string, any> = {
  // Message/Email icon - animated envelope
  message: {
    v: '5.7.4', fr: 30, ip: 0, op: 60, w: 100, h: 100, nm: 'Message',
    layers: [{
      ddd: 0, ind: 1, ty: 4, nm: 'Envelope', sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        p: { a: 0, k: [50, 50] },
        s: { a: 1, k: [{ t: 0, s: [95, 95] }, { t: 30, s: [100, 100] }, { t: 60, s: [95, 95] }] }
      },
      shapes: [
        { ty: 'rc', s: { a: 0, k: [60, 40] }, p: { a: 0, k: [0, 5] }, r: { a: 0, k: 4 } },
        { ty: 'gr', it: [
          { ty: 'sh', ks: { a: 0, k: { c: false, v: [[-30, -15], [0, 10], [30, -15]], i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]] } } },
          { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, w: { a: 0, k: 3 }, lc: 2, lj: 2 }
        ]},
        { ty: 'fl', c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } }
      ]
    }]
  },
  // Send/Paper plane icon
  send: {
    v: '5.7.4', fr: 30, ip: 0, op: 60, w: 100, h: 100, nm: 'Send',
    layers: [{
      ddd: 0, ind: 1, ty: 4, nm: 'Plane', sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        p: { a: 1, k: [{ t: 0, s: [40, 60] }, { t: 30, s: [60, 40] }, { t: 60, s: [40, 60] }] },
        r: { a: 0, k: -45 },
        s: { a: 1, k: [{ t: 0, s: [90, 90] }, { t: 30, s: [100, 100] }, { t: 60, s: [90, 90] }] }
      },
      shapes: [
        { ty: 'gr', it: [
          { ty: 'sh', ks: { a: 0, k: { c: true, v: [[0, -20], [25, 0], [0, 8], [-5, 0]], i: [[0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0]] } } },
          { ty: 'fl', c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } }
        ]}
      ]
    }]
  },
  // Schedule/Clock icon
  schedule: {
    v: '5.7.4', fr: 30, ip: 0, op: 120, w: 100, h: 100, nm: 'Schedule',
    layers: [{
      ddd: 0, ind: 1, ty: 4, nm: 'Clock', sr: 1,
      ks: { o: { a: 0, k: 100 }, p: { a: 0, k: [50, 50] }, s: { a: 0, k: [100, 100] } },
      shapes: [
        { ty: 'el', s: { a: 0, k: [50, 50] }, p: { a: 0, k: [0, 0] } },
        { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, w: { a: 0, k: 4 }, o: { a: 0, k: 100 } },
        { ty: 'gr', it: [
          { ty: 'sh', ks: { a: 0, k: { c: false, v: [[0, 0], [0, -15]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] } } },
          { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, w: { a: 0, k: 4 }, lc: 2 },
          { ty: 'tm', s: { a: 0, k: 0 }, e: { a: 0, k: 100 } }
        ]},
        { ty: 'gr', it: [
          { ty: 'sh', ks: { a: 0, k: { c: false, v: [[0, 0], [10, 5]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] } } },
          { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, w: { a: 0, k: 3 }, lc: 2 },
          { ty: 'tm', s: { a: 0, k: 0 }, e: { a: 1, k: [{ t: 0, s: [0] }, { t: 60, s: [100] }] } }
        ]}
      ]
    }]
  },
  // WhatsApp icon
  whatsapp: {
    v: '5.7.4', fr: 30, ip: 0, op: 60, w: 100, h: 100, nm: 'WhatsApp',
    layers: [{
      ddd: 0, ind: 1, ty: 4, nm: 'WA', sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        p: { a: 0, k: [50, 50] },
        s: { a: 1, k: [{ t: 0, s: [95, 95] }, { t: 30, s: [105, 105] }, { t: 60, s: [95, 95] }] }
      },
      shapes: [
        { ty: 'el', s: { a: 0, k: [45, 45] }, p: { a: 0, k: [0, 0] } },
        { ty: 'fl', c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } }
      ]
    }]
  },
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
