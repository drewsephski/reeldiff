// Design System for PatchPlay Videos
// Professional, distinctive aesthetic avoiding typical AI patterns

// Typography Scale - Fluid sizing for 1920x1080 videos
export const typography = {
  // Display sizes for headlines
  display: {
    xl: 'clamp(80px, 8vw, 140px)',   // Main headlines
    lg: 'clamp(64px, 6vw, 100px)',    // Secondary headlines
    md: 'clamp(48px, 4vw, 72px)',    // Emphasis text
    sm: 'clamp(36px, 3vw, 48px)',    // Small headlines
  },
  // Body sizes
  body: {
    xl: 'clamp(32px, 3vw, 48px)',    // Large body
    lg: 'clamp(28px, 2.5vw, 36px)',  // Medium body
    md: 'clamp(24px, 2vw, 28px)',    // Regular body
    sm: 'clamp(18px, 1.5vw, 22px)',  // Small body
  },
  // Utility sizes
  utility: {
    xs: 'clamp(14px, 1vw, 18px)',    // Captions, labels
    stat: 'clamp(56px, 5vw, 80px)',  // Stats/numbers
  },
  // Font weights
  weight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 800,
  },
  // Line heights
  leading: {
    tight: 1.1,
    normal: 1.3,
    relaxed: 1.5,
    loose: 1.7,
  },
  // Letter spacing
  tracking: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.05em',
    wider: '0.1em',
  },
} as const;

// Color System - Warm, sophisticated palette avoiding neon AI colors
export const colors = {
  // Background colors
  bg: {
    primary: '#0f0f12',      // Deep charcoal - not pure black
    secondary: '#1a1a1f',    // Slightly lighter
    tertiary: '#25252c',     // Elevated surfaces
  },
  // Accent colors - warm, sophisticated
  accent: {
    coral: '#e07a5f',        // Warm coral
    amber: '#f4a261',        // Soft amber
    sage: '#81b29a',         // Muted sage
    slate: '#5e81ac',        // Soft blue
    lavender: '#b48ead',     // Muted lavender
    gold: '#e9c46a',         // Warm gold
    rose: '#e07a8f',         // Dusty rose
    teal: '#2a9d8f',         // Deep teal
  },
  // Text colors - tinted neutrals
  text: {
    primary: '#f4f1ea',      // Warm white
    secondary: '#d4cfc4',    // Warm light gray
    tertiary: '#9a958a',       // Warm medium gray
    muted: '#6b665e',        // Warm dark gray
  },
  // Semantic colors
  semantic: {
    success: '#81b29a',
    error: '#e07a5f',
    warning: '#f4a261',
    info: '#5e81ac',
  },
} as const;

// Spacing System
export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  '2xl': 64,
  '3xl': 96,
  '4xl': 128,
} as const;

// Border radius
export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// Animation timing
export const timing = {
  // Durations in frames (30fps)
  fast: 10,      // 0.33s
  normal: 20,    // 0.66s
  slow: 30,      // 1s
  slower: 45,    // 1.5s
  slowest: 60,   // 2s
  // Stagger delays
  stagger: {
    tight: 3,
    normal: 6,
    loose: 10,
  },
} as const;

// Easing curves (CSS cubic-bezier equivalents)
export const easing = {
  // Standard easings
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  // Exponential easings for natural deceleration
  expoOut: [0.16, 1, 0.3, 1],
  expoIn: [0.7, 0, 0.84, 0],
  // Back easings for playful bounce
  backOut: [0.34, 1.56, 0.64, 1],
  backIn: [0.36, 0, 0.66, -0.56],
  // Spring-like
  spring: [0.175, 0.885, 0.32, 1.275],
} as const;

// Vibe-based color mapping (maps vibe to accent color)
export const vibeColors: Record<string, string> = {
  feature: colors.accent.sage,
  fix: colors.accent.coral,
  refactor: colors.accent.slate,
  docs: colors.accent.lavender,
  chore: colors.accent.amber,
};

// Tone-based particle configs
export const toneConfigs = {
  celebratory: {
    particleCount: 25,
    particleSpeed: 1.5,
    glowIntensity: 0.5,
    useConfetti: true,
  },
  relief: {
    particleCount: 12,
    particleSpeed: 0.8,
    glowIntensity: 0.3,
    useConfetti: false,
  },
  technical: {
    particleCount: 8,
    particleSpeed: 0.5,
    glowIntensity: 0.2,
    useConfetti: false,
  },
  minor: {
    particleCount: 0,
    particleSpeed: 0,
    glowIntensity: 0.1,
    useConfetti: false,
  },
  educational: {
    particleCount: 15,
    particleSpeed: 1,
    glowIntensity: 0.35,
    useConfetti: false,
  },
  hype: {
    particleCount: 35,
    particleSpeed: 2,
    glowIntensity: 0.6,
    useConfetti: true,
  },
} as const;

// Layout constants for video composition
export const layout = {
  // Video dimensions (16:9)
  width: 1920,
  height: 1080,
  // Safe zones
  safeZone: {
    horizontal: 120,
    vertical: 80,
  },
  // Grid system
  grid: {
    columns: 12,
    gap: 32,
  },
  // Content max width
  maxContentWidth: 1600,
} as const;

// Decorative patterns
export const patterns = {
  // Dot grid pattern
  dotGrid: (color: string, gap: number = 40) => ({
    backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
    backgroundSize: `${gap}px ${gap}px`,
  }),
  // Gradient overlays
  gradientOverlays: {
    top: 'linear-gradient(180deg, rgba(15,15,18,0.8) 0%, transparent 100%)',
    bottom: 'linear-gradient(0deg, rgba(15,15,18,0.8) 0%, transparent 100%)',
    radial: 'radial-gradient(ellipse at center, transparent 0%, rgba(15,15,18,0.6) 100%)',
  },
} as const;
