import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { enhancedSprings } from './enhancedAnimations';

// ============================================
// CINEMATIC CAMERA MOVEMENTS
// ============================================

// Smooth dolly zoom effect (Vertigo effect)
export const useDollyZoom = (startFrame: number, durationInFrames: number = 90) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const easedProgress = Easing.inOut(Easing.cubic)(progress);

  // Camera moves closer while zooming out (or vice versa)
  const cameraZ = interpolate(easedProgress, [0, 1], [0, -200]);
  const scale = interpolate(easedProgress, [0, 1], [1, 1.15]);

  return { cameraZ, scale, progress };
};

// Cinematic pan with easing
export const useCinematicPan = (
  direction: 'left' | 'right' | 'up' | 'down',
  startFrame: number,
  durationInFrames: number = 120,
  distance: number = 100
) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Use ease-in-out for smooth camera movement
  const easedProgress = Easing.inOut(Easing.quad)(progress);

  let x = 0;
  let y = 0;

  switch (direction) {
    case 'left':
      x = interpolate(easedProgress, [0, 1], [distance, -distance]);
      break;
    case 'right':
      x = interpolate(easedProgress, [0, 1], [-distance, distance]);
      break;
    case 'up':
      y = interpolate(easedProgress, [0, 1], [distance, -distance]);
      break;
    case 'down':
      y = interpolate(easedProgress, [0, 1], [-distance, distance]);
      break;
  }

  return { x, y, progress: easedProgress };
};

// Handheld camera shake for realistic feel
export const useHandheldShake = (intensity: number = 1, seed: number = 0) => {
  const frame = useCurrentFrame();

  // Multiple noise frequencies for organic shake
  const shakeX =
    Math.sin((frame + seed) * 0.15) * 2 * intensity +
    Math.sin((frame + seed) * 0.37) * 1 * intensity +
    Math.sin((frame + seed) * 0.73) * 0.5 * intensity;

  const shakeY =
    Math.cos((frame + seed) * 0.13) * 2 * intensity +
    Math.cos((frame + seed) * 0.41) * 1 * intensity +
    Math.cos((frame + seed) * 0.67) * 0.5 * intensity;

  const rotation =
    Math.sin((frame + seed) * 0.08) * 0.3 * intensity +
    Math.cos((frame + seed) * 0.29) * 0.15 * intensity;

  return { x: shakeX, y: shakeY, rotation };
};

// 3D perspective tilt for depth
export const usePerspectiveTilt = (startFrame: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const springValue = spring({
    frame: frame - startFrame,
    fps,
    config: enhancedSprings.smooth,
  });

  const rotateX = interpolate(springValue, [0, 1], [15, 0]);
  const rotateY = interpolate(springValue, [0, 1], [-10, 0]);
  const translateZ = interpolate(springValue, [0, 1], [-100, 0]);

  return {
    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
    rotateX,
    rotateY,
    translateZ,
  };
};

// Focus pull effect (simulated depth of field)
export const useFocusPull = (startFrame: number, durationInFrames: number = 60) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const easedProgress = Easing.inOut(Easing.cubic)(progress);

  // Start blurry, become sharp, or vice versa
  const blur = interpolate(easedProgress, [0, 0.3, 0.7, 1], [8, 0, 0, 4]);

  return { blur, progress: easedProgress };
};

// ============================================
// ADVANCED PARTICLE SYSTEM WITH PHYSICS
// ============================================

// Pseudo-random function for deterministic results (Remotion-safe)
const pseudoRandom = (seed: number): number => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

export const usePhysicsParticles = (
  count: number,
  accentColor: string,
  options: {
    gravity?: number;
    friction?: number;
    turbulence?: number;
    spawnRate?: number;
  } = {}
) => {
  const frame = useCurrentFrame();
  const { gravity = 0.2, friction = 0.98, turbulence = 0.1, spawnRate = 5 } = options;

  const colors = [accentColor, '#f4a261', '#e9c46a', '#81b29a', '#b48ead'];

  // Generate particles with physics simulation
  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
    scale: number;
    rotation: number;
  }> = [];

  for (let i = 0; i < count; i++) {
    const spawnFrame = i * spawnRate;
    if (frame < spawnFrame) continue;

    const age = frame - spawnFrame;
    const maxAge = 120 + (i % 60);

    if (age > maxAge) continue;

    // Initial position (burst from center with variation)
    const angle = (i / count) * Math.PI * 2 + (i * 137.5 * Math.PI) / 180;
    const initialSpeed = 3 + (i % 5) * 1.5;

    let x = 960 + Math.cos(angle) * 50;
    let y = 540 + Math.sin(angle) * 50;
    let vx = Math.cos(angle) * initialSpeed;
    let vy = Math.sin(angle) * initialSpeed - 2; // Initial upward burst

    // Apply physics over time
    for (let t = 0; t < age; t++) {
      vy += gravity;
      vx *= friction;
      vy *= friction;

      // Add turbulence using deterministic pseudo-random
      vx += (pseudoRandom(i * 100 + t) - 0.5) * turbulence;
      vy += (pseudoRandom(i * 200 + t + 1000) - 0.5) * turbulence;

      x += vx;
      y += vy;
    }

    const lifeRatio = 1 - age / maxAge;
    const opacity = lifeRatio * (0.6 + Math.sin(frame * 0.1 + i) * 0.2);
    const scale = 0.5 + lifeRatio * 0.5;
    const rotation = age * (2 + (i % 3));

    particles.push({
      x,
      y,
      vx,
      vy,
      size: 4 + (i % 6) * 2,
      opacity,
      color: colors[i % colors.length],
      scale,
      rotation,
    });
  }

  return particles;
};

// Orbiting spark system
export const useOrbitingSparks = (count: number, radius: number, speed: number = 1, spread: number = 50) => {
  const frame = useCurrentFrame();

  return Array.from({ length: count }, (_, i) => {
    const baseAngle = (i / count) * Math.PI * 2;
    const timeOffset = frame * 0.02 * speed;
    const angle = baseAngle + timeOffset;

    // Elliptical orbit with vertical spread
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * (radius * 0.4) + Math.sin(timeOffset * 2 + i) * spread;

    // Spark trail effect
    const trailLength = 5 + (i % 8);
    const opacity = 0.4 + Math.sin(frame * 0.1 + i * 0.5) * 0.3;
    const scale = 0.6 + Math.sin(frame * 0.08 + i) * 0.4;

    return {
      x,
      y,
      angle,
      opacity,
      scale,
      trailLength,
      size: 2 + (i % 4),
    };
  });
};

// Firework burst effect
export const useFireworkBurst = (
  triggerFrame: number,
  burstCount: number = 30,
  colors: string[] = ['#f4a261', '#e9c46a', '#81b29a', '#b48ead', '#e07a5f']
) => {
  const frame = useCurrentFrame();

  const particles = Array.from({ length: burstCount }, (_, i) => {
    const delay = i * 0.5;
    const particleFrame = frame - triggerFrame - delay;

    if (particleFrame < 0 || particleFrame > 90) {
      return null;
    }

    const angle = (i / burstCount) * Math.PI * 2 + pseudoRandom(i * 300) * 0.5;
    const speed = 8 + (i % 5) * 3;

    // Explosive outward motion with gravity
    const t = particleFrame / 30;
    const distance = speed * t * 20;
    const gravityY = t * t * 100;

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance + gravityY;

    const lifeRatio = 1 - particleFrame / 90;
    const opacity = lifeRatio * (0.8 + Math.sin(particleFrame * 0.2) * 0.2);
    const scale = lifeRatio;
    const rotation = particleFrame * 5;

    return {
      x,
      y,
      opacity,
      scale,
      rotation,
      color: colors[i % colors.length],
      size: 4 + (i % 6) * 2,
    };
  }).filter((p): p is NonNullable<typeof p> => p !== null);

  return particles;
};

// ============================================
// CINEMATIC VISUAL EFFECTS
// ============================================

// Film grain effect
export const useFilmGrain = (intensity: number = 0.03) => {
  const frame = useCurrentFrame();

  // Pseudo-random noise based on frame
  const noise = Math.sin(frame * 12.9898) * 43758.5453;
  const grainValue = (noise - Math.floor(noise)) * intensity;

  return grainValue;
};

// Vignette effect with animated intensity
export const useAnimatedVignette = (baseIntensity: number = 0.4, animateSpeed: number = 0.05) => {
  const frame = useCurrentFrame();

  const intensity = baseIntensity + Math.sin(frame * animateSpeed) * 0.1;

  return {
    background: `radial-gradient(ellipse at center, transparent 0%, rgba(15,15,18,${intensity}) 100%)`,
    intensity,
  };
};

// Lens flare effect
export const useLensFlare = (x: number, y: number, intensity: number = 1) => {
  const frame = useCurrentFrame();

  const flareIntensity = intensity * (0.8 + Math.sin(frame * 0.1) * 0.2);
  const flareScale = 1 + Math.sin(frame * 0.05) * 0.1;

  return {
    position: { x, y },
    intensity: flareIntensity,
    scale: flareScale,
  };
};

// Chromatic aberration (RGB split) effect
export const useChromaticAberration = (intensity: number = 2) => {
  const frame = useCurrentFrame();

  const offset = intensity * (1 + Math.sin(frame * 0.08) * 0.3);

  return {
    redOffset: { x: offset, y: 0 },
    blueOffset: { x: -offset, y: 0 },
    greenOffset: { x: 0, y: 0 },
  };
};

// Motion blur simulation based on velocity
export const useMotionBlur = (velocity: number = 10, direction: 'x' | 'y' = 'x') => {
  const blurAmount = Math.min(velocity * 0.3, 8);

  return direction === 'x'
    ? { filter: `blur(${blurAmount}px)`, transform: `translateX(${velocity * 0.5}px)` }
    : { filter: `blur(${blurAmount}px)`, transform: `translateY(${velocity * 0.5}px)` };
};

// ============================================
// KINETIC TYPOGRAPHY EFFECTS
// ============================================

// Character-by-character reveal with varied animations
export const useKineticText = (
  text: string,
  startFrame: number,
  options: {
    charDelay?: number;
    animationStyle?: 'slide' | 'scale' | 'rotate' | 'wave';
    randomness?: number;
  } = {}
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { charDelay = 3, animationStyle = 'slide', randomness = 0.2 } = options;

  return text.split('').map((char, i) => {
    const delay = startFrame + i * charDelay + pseudoRandom(i * 400) * randomness * charDelay;
    const charSpring = spring({
      frame: frame - delay,
      fps,
      config: enhancedSprings.bouncy,
    });

    let transform = '';
    const opacity = interpolate(frame, [delay, delay + 8], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    switch (animationStyle) {
      case 'slide': {
        const y = interpolate(charSpring, [0, 1], [40, 0]);
        transform = `translateY(${y}px)`;
        break;
      }
      case 'scale': {
        const scale = interpolate(charSpring, [0, 0.5, 1], [0, 1.2, 1]);
        transform = `scale(${scale})`;
        break;
      }
      case 'rotate': {
        const rotate = interpolate(charSpring, [0, 1], [90, 0]);
        const rotateScale = interpolate(charSpring, [0, 1], [0.5, 1]);
        transform = `rotate(${rotate}deg) scale(${rotateScale})`;
        break;
      }
      case 'wave': {
        const waveY = Math.sin(i * 0.5 + frame * 0.1) * 10;
        const waveScale = interpolate(charSpring, [0, 1], [0.8, 1]);
        transform = `translateY(${waveY}px) scale(${waveScale})`;
        break;
      }
    }

    return {
      char: char === ' ' ? '\u00A0' : char,
      transform,
      opacity,
      delay,
    };
  });
};

// Word-by-word emphasis animation
export const useEmphasisWords = (
  words: string[],
  startFrame: number,
  baseDelay: number = 8,
  emphasisInterval: number = 3
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return words.map((word, i) => {
    const delay = startFrame + i * baseDelay;
    const isEmphasis = i % emphasisInterval === 0;

    const wordSpring = spring({
      frame: frame - delay,
      fps,
      config: isEmphasis ? enhancedSprings.bouncy : enhancedSprings.smooth,
    });

    const y = interpolate(wordSpring, [0, 1], [30, 0]);
    const scale = interpolate(wordSpring, [0, 0.6, 1], [0.7, isEmphasis ? 1.1 : 1, 1]);
    const opacity = interpolate(frame, [delay, delay + 6], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    return {
      word,
      transform: `translateY(${y}px) scale(${scale})`,
      opacity,
      isEmphasis,
      delay,
    };
  });
};

// Text reveal with underline sweep
export const useTextRevealSweep = (startFrame: number, durationInFrames: number = 40) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const easedProgress = Easing.out(Easing.cubic)(progress);

  // Text clips in from left
  const clipPath = `inset(0 ${100 - easedProgress * 100}% 0 0)`;

  // Underline sweeps from left to right
  const underlineWidth = easedProgress * 100;

  return { clipPath, underlineWidth, progress: easedProgress };
};

// ============================================
// SCENE TRANSITION EFFECTS
// ============================================

// Screen wipe with custom shape
export const useShapeWipe = (
  startFrame: number,
  durationInFrames: number = 30,
  shape: 'circle' | 'diamond' | 'cross' = 'circle'
) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const easedProgress = Easing.inOut(Easing.cubic)(progress);

  let clipPath = '';

  switch (shape) {
    case 'circle': {
      const radius = easedProgress * 150;
      clipPath = `circle(${radius}% at 50% 50%)`;
      break;
    }
    case 'diamond': {
      const size = easedProgress * 100;
      clipPath = `polygon(${50 - size}% 50%, 50% ${50 - size}%, ${50 + size}% 50%, 50% ${50 + size}%)`;
      break;
    }
    case 'cross': {
      const w = easedProgress * 50;
      const h = easedProgress * 100;
      clipPath = `polygon(
        ${50 - w}% 0%, ${50 + w}% 0%, ${50 + w}% ${100 - h}%,
        100% ${100 - h}%, 100% 100%, 0% 100%, 0% ${100 - h}%,
        ${50 - w}% ${100 - h}%
      )`;
      break;
    }
  }

  return { clipPath, progress: easedProgress };
};

// Glitch transition effect
export const useGlitchTransition = (startFrame: number, durationInFrames: number = 20) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Multiple glitch slices
  const slices = Array.from({ length: 5 }, (_, i) => {
    const sliceProgress = Math.max(0, Math.min(1, (progress - i * 0.1) * 3));
    const offsetX = (pseudoRandom(i * 500 + 2000) - 0.5) * 20 * (1 - sliceProgress);
    const offsetY = (i - 2) * 15;

    return {
      offsetX,
      offsetY,
      opacity: sliceProgress,
    };
  });

  return { slices, progress };
};

// Page curl effect simulation
export const usePageCurl = (startFrame: number, durationInFrames: number = 45) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const easedProgress = Easing.inOut(Easing.cubic)(progress);

  // 3D page curl transform
  const rotateY = easedProgress * -90;
  const shadowOpacity = Math.sin(easedProgress * Math.PI) * 0.5;

  return {
    transform: `perspective(1000px) rotateY(${rotateY}deg)`,
    transformOrigin: 'left center',
    shadowOpacity,
    progress: easedProgress,
  };
};
