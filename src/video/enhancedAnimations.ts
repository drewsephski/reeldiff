import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// Enhanced spring configurations for more dynamic motion
export const enhancedSprings = {
  smooth: { damping: 200, stiffness: 100 },
  snappy: { damping: 20, stiffness: 300 },
  bouncy: { damping: 8, stiffness: 150 },
  heavy: { damping: 15, stiffness: 100, mass: 2.5 },
  gentle: { damping: 150, stiffness: 80 },
  dramatic: { damping: 12, stiffness: 120, mass: 1.5 },
  elastic: { damping: 6, stiffness: 200 },
  snap: { damping: 25, stiffness: 400 },
} as const;

// Magnetic text effect - characters snap into place
export const useMagneticText = (text: string, startFrame: number, charDelay: number = 2) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return text.split('').map((char, i) => {
    const charStart = startFrame + i * charDelay;
    const charSpring = spring({
      frame: frame - charStart,
      fps,
      config: enhancedSprings.snap,
    });

    const y = interpolate(charSpring, [0, 1], [50, 0]);
    const opacity = interpolate(frame, [charStart, charStart + 8], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const scale = interpolate(charSpring, [0, 1], [0.5, 1]);
    const rotate = interpolate(charSpring, [0, 1], [15, 0]);

    return { char, y, opacity, scale, rotate, isVisible: frame >= charStart };
  });
};

// Wave animation for floating elements
export const useWaveFloat = (baseY: number = 0, amplitude: number = 20, frequency: number = 0.05, offset: number = 0) => {
  const frame = useCurrentFrame();
  const y = baseY + Math.sin((frame + offset) * frequency) * amplitude;
  const rotate = Math.sin((frame + offset) * frequency * 0.5) * 3;
  return { y, rotate };
};

// Staggered cascade animation
export const useCascade = (itemCount: number, startFrame: number, staggerDelay: number = 4) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return Array.from({ length: itemCount }, (_, i) => {
    const itemStart = startFrame + i * staggerDelay;
    const itemSpring = spring({
      frame: frame - itemStart,
      fps,
      config: enhancedSprings.dramatic,
    });

    const y = interpolate(itemSpring, [0, 1], [80, 0]);
    const x = interpolate(itemSpring, [0, 1], [40, 0]);
    const opacity = interpolate(frame, [itemStart, itemStart + 12], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const scale = interpolate(itemSpring, [0, 1], [0.7, 1]);

    return { y, x, opacity, scale, isVisible: frame >= itemStart };
  });
};

// Glow pulse animation
export const useGlowPulse = (baseIntensity: number = 0.3, speed: number = 0.08) => {
  const frame = useCurrentFrame();
  const intensity = baseIntensity + Math.sin(frame * speed) * baseIntensity * 0.5;
  const scale = 1 + Math.sin(frame * speed * 0.7) * 0.02;
  return { intensity, scale };
};

// Orbiting particles system
export const useOrbitingParticles = (count: number, radius: number, speed: number = 1) => {
  const frame = useCurrentFrame();

  return Array.from({ length: count }, (_, i) => {
    const angle = ((i / count) * Math.PI * 2) + (frame * 0.02 * speed);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const scale = 0.8 + Math.sin(frame * 0.1 + i) * 0.4;
    const opacity = 0.4 + Math.sin(frame * 0.08 + i * 0.5) * 0.3;

    return { x, y, scale, opacity, angle };
  });
};

// Text scramble reveal effect
export const useScrambleReveal = (text: string, startFrame: number, duration: number = 30) => {
  const frame = useCurrentFrame();
  const chars = '!<>-_\\/[]{}—=+*^?#________';

  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const revealedLength = Math.floor(progress * text.length);

  return text.split('').map((char, i) => {
    if (i < revealedLength) return char;
    if (i === revealedLength && progress < 1) {
      return chars[Math.floor(frame * 0.5 + i) % chars.length];
    }
    return '';
  }).join('');
};

// Elastic scale bounce
export const useElasticScale = (startFrame: number, duration: number = 20) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const springValue = spring({
    frame: frame - startFrame,
    fps,
    config: enhancedSprings.elastic,
  });

  const scale = interpolate(springValue, [0, 1], [0, 1]);
  return { scale, progress };
};

// Typing cursor effect
export const useTypingCursor = (_startFrame: number, blinkSpeed: number = 20) => {
  const frame = useCurrentFrame();
  const isVisible = Math.floor(frame / (blinkSpeed / 2)) % 2 === 0;
  const opacity = isVisible ? 1 : 0;
  return { opacity, isVisible };
};

// Explosive entrance - elements burst from center
export const useExplosiveEntrance = (startFrame: number, delay: number = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = frame - startFrame - delay;

  const entranceSpring = spring({
    frame: adjustedFrame,
    fps,
    config: enhancedSprings.heavy,
  });

  const scale = interpolate(entranceSpring, [0, 1], [0.3, 1]);
  const opacity = interpolate(frame, [startFrame + delay, startFrame + delay + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return { scale, opacity };
};

// Parallax layer movement
export const useParallax = (depth: number = 1, direction: 'x' | 'y' = 'x') => {
  const frame = useCurrentFrame();
  const movement = Math.sin(frame * 0.01 * depth) * 30 * depth;
  return direction === 'x' ? { x: movement, y: 0 } : { x: 0, y: movement };
};

// Counter roll animation with blur effect
export const useRollingCounter = (targetValue: number, startFrame: number, duration: number = 40) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const easedProgress = Easing.out(Easing.cubic)(progress);
  const currentValue = Math.round(easedProgress * targetValue);

  // Calculate blur based on velocity
  const velocity = Math.sin(progress * Math.PI); // Peak velocity at middle
  const blur = velocity * 2;

  return { value: currentValue, blur, progress };
};

// Morphing blob path generator
export const useMorphingBlob = (baseSize: number, speed: number = 0.02) => {
  const frame = useCurrentFrame();

  const points = 6;
  const angles = Array.from({ length: points }, (_, i) => (i / points) * Math.PI * 2);

  const radii = angles.map((_, i) => {
    const offset = Math.sin(frame * speed + (i / points) * Math.PI * 2) * baseSize * 0.15;
    return baseSize + offset;
  });

  return { radii, angles };
};

// Spotlight sweep animation
export const useSpotlightSweep = (startFrame: number, duration: number = 90, direction: 'left' | 'right' = 'left') => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const startX = direction === 'left' ? -300 : width + 300;
  const endX = direction === 'left' ? width + 300 : -300;

  const x = interpolate(frame, [startFrame, startFrame + duration], [startX, endX], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacity = interpolate(frame, [startFrame, startFrame + 10, startFrame + duration - 10, startFrame + duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return { x, opacity };
};

// Staggered word reveal with emphasis
export const useStaggeredWords = (words: string[], startFrame: number, baseDelay: number = 6, emphasisEvery: number = 3) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return words.map((word, i) => {
    const wordStart = startFrame + i * baseDelay;
    const wordSpring = spring({
      frame: frame - wordStart,
      fps,
      config: i % emphasisEvery === 0 ? enhancedSprings.bouncy : enhancedSprings.smooth,
    });

    const y = interpolate(wordSpring, [0, 1], [40, 0]);
    const opacity = interpolate(frame, [wordStart, wordStart + 10], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const scale = interpolate(wordSpring, [0, 1], [0.8, 1]);
    const isEmphasis = i % emphasisEvery === 0;

    return { word, y, opacity, scale, isEmphasis, index: i };
  });
};
