import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// Spring configurations for different animation feels
export const springs = {
  smooth: { damping: 200 },
  snappy: { damping: 20, stiffness: 200 },
  bouncy: { damping: 8, stiffness: 100 },
  heavy: { damping: 15, stiffness: 80, mass: 2 },
  gentle: { damping: 150, stiffness: 80 },
} as const;

// Typewriter effect - reveals text character by character
export const useTypewriter = (text: string, startFrame: number, charsPerSecond: number = 20) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const charsToShow = Math.floor(Math.max(0, frame - startFrame) * (charsPerSecond / fps));
  return { text: text.slice(0, Math.min(charsToShow, text.length)), isComplete: charsToShow >= text.length };
};

// Staggered children animation
export const useStaggered = (index: number, baseDelay: number = 5, staggerDelay: number = 3) => {
  const frame = useCurrentFrame();

  const delay = baseDelay + index * staggerDelay;

  const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(frame, [delay, delay + 15], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  return { opacity, y, isVisible: frame >= delay };
};

// Fade in with scale
export const useFadeInScale = (startFrame: number = 0, duration: number = 15) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(frame, [startFrame, startFrame + duration], [0.9, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  return { opacity, scale };
};

// Slide in from direction
export const useSlideIn = (
  direction: 'left' | 'right' | 'top' | 'bottom',
  startFrame: number = 0,
  distance: number = 100
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideSpring = spring({
    frame: frame - startFrame,
    fps,
    config: springs.smooth,
  });

  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
  const multiplier = direction === 'left' || direction === 'top' ? -1 : 1;

  const offset = interpolate(slideSpring, [0, 1], [distance * multiplier, 0]);

  return axis === 'x' ? { x: offset, y: 0 } : { x: 0, y: offset };
};

// Pulse animation
export const usePulse = (startFrame: number = 0, interval: number = 30) => {
  const frame = useCurrentFrame();
  const adjustedFrame = frame - startFrame;

  const cycle = adjustedFrame % interval;
  const pulse = Math.sin((cycle / interval) * Math.PI * 2) * 0.5 + 0.5;

  return interpolate(pulse, [0, 1], [1, 1.05]);
};

// Word highlight animation - highlights words sequentially
export const useWordHighlight = (words: string[], startFrame: number = 0, wordDuration: number = 15) => {
  const frame = useCurrentFrame();

  return words.map((word, index) => {
    const wordStart = startFrame + index * wordDuration;
    const isHighlighted = frame >= wordStart && frame < wordStart + wordDuration;
    const isPast = frame >= wordStart + wordDuration;

    return {
      word,
      isHighlighted,
      isPast,
      opacity: isPast ? 1 : interpolate(frame, [wordStart, wordStart + 5], [0.4, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
    };
  });
};

// Confetti/celebration trigger
export const useCelebration = (triggerFrame: number = 0) => {
  const frame = useCurrentFrame();
  const isActive = frame >= triggerFrame && frame < triggerFrame + 60;
  const intensity = Math.max(0, 1 - (frame - triggerFrame) / 60);

  return { isActive, intensity };
};
