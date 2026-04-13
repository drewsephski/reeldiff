import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  Easing,
} from 'remotion';
import { enhancedSprings, useWaveFloat, useGlowPulse } from '../enhancedAnimations';
import { typography, colors, spacing, radius } from '../designSystem';

interface IntroSceneProps {
  repoName: string;
  prNumber: number;
  author: string;
  ownerAvatar: string;
  accentColor: string;
}

// Animated gradient mesh background
const GradientMesh: React.FC<{ frame: number; accentColor: string }> = ({ frame, accentColor }) => {
  const blob1X = Math.sin(frame * 0.015) * 200 + 300;
  const blob1Y = Math.cos(frame * 0.012) * 150 + 200;
  const blob2X = Math.cos(frame * 0.018) * 250 + 1500;
  const blob2Y = Math.sin(frame * 0.014) * 180 + 700;
  const blob3X = Math.sin(frame * 0.02 + 2) * 180 + 960;
  const blob3Y = Math.cos(frame * 0.016 + 1) * 200 + 540;

  return (
    <div
      style={{
        position: 'absolute',
        inset: -100,
        background: `
          radial-gradient(ellipse 800px 600px at ${blob1X}px ${blob1Y}px, ${accentColor}15 0%, transparent 70%),
          radial-gradient(ellipse 600px 500px at ${blob2X}px ${blob2Y}px, ${colors.accent.slate}10 0%, transparent 70%),
          radial-gradient(ellipse 500px 400px at ${blob3X}px ${blob3Y}px, ${colors.accent.amber}08 0%, transparent 70%)
        `,
        filter: 'blur(60px)',
      }}
    />
  );
};

// Subtle dot grid with wave animation
const DotGrid: React.FC<{ color: string; frame: number }> = ({ color, frame }) => {
  const waveOffset = Math.sin(frame * 0.03) * 10;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle, ${color}12 1.5px, transparent 1.5px)`,
        backgroundSize: '48px 48px',
        opacity: 0.5,
        transform: `translateY(${waveOffset}px)`,
      }}
    />
  );
};

// Floating particle system
const ParticleField: React.FC<{ frame: number; fps: number; accentColor: string }> = ({
  frame,
  fps,
  accentColor,
}) => {
  const particles = Array.from({ length: 20 }, (_, i) => {
    const baseX = 10 + (i * 137.5) % 80;
    const baseY = 10 + (i * 72.3) % 80;
    const floatX = Math.sin((frame + i * 30) * 0.02) * 30;
    const floatY = Math.cos((frame + i * 30) * 0.018) * 25;
    const size = 4 + (i % 4) * 2;
    const opacity = 0.15 + Math.sin((frame + i * 20) * 0.05) * 0.1;
    const particleSpring = spring({
      frame: frame - (i * 2),
      fps,
      config: enhancedSprings.gentle,
    });
    const scale = interpolate(particleSpring, [0, 1], [0, 1]);

    return { x: baseX + floatX * 0.01, y: baseY + floatY * 0.01, size, opacity, scale };
  });

  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: accentColor,
            opacity: p.opacity * p.scale,
            boxShadow: `0 0 ${p.size * 2}px ${accentColor}40`,
          }}
        />
      ))}
    </>
  );
};

// Geometric accent shapes with rotation
const GeometricShapes: React.FC<{ frame: number; fps: number; accentColor: string }> = ({
  frame,
  fps,
  accentColor,
}) => {
  const shapes = [
    { size: 350, delay: 0, x: '3%', y: '5%', rotation: 45, type: 'square' as const },
    { size: 200, delay: 8, x: '88%', y: '72%', rotation: -30, type: 'circle' as const },
    { size: 120, delay: 16, x: '78%', y: '12%', rotation: 60, type: 'diamond' as const },
    { size: 180, delay: 24, x: '8%', y: '75%', rotation: 15, type: 'square' as const },
  ];

  return (
    <>
      {shapes.map((shape, i) => {
        const shapeSpring = spring({
          frame: frame - shape.delay,
          fps,
          config: enhancedSprings.gentle,
        });
        const scale = interpolate(shapeSpring, [0, 1], [0.6, 1]);
        const opacity = interpolate(frame, [shape.delay, shape.delay + 20], [0, 0.12], {
          extrapolateRight: 'clamp',
        });
        const rotation = shape.rotation + frame * (0.08 + i * 0.02);
        const floatY = Math.sin(frame * 0.04 + i) * 10;

        const borderRadius = shape.type === 'circle' ? '50%' : shape.type === 'diamond' ? '4px' : radius.lg;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: shape.x,
              top: shape.y,
              width: shape.size,
              height: shape.size,
              border: `2px solid ${accentColor}`,
              transform: `rotate(${rotation}deg) scale(${scale}) translateY(${floatY}px)`,
              opacity,
              borderRadius,
            }}
          />
        );
      })}
    </>
  );
};

// Animated corner brackets with glow
const CornerBrackets: React.FC<{ frame: number; accentColor: string; fps: number }> = ({
  frame,
  accentColor,
  fps,
}) => {
  const corners = [
    { top: 50, left: 50, rotate: 0 },
    { top: 50, right: 50, rotate: 90 },
    { bottom: 50, right: 50, rotate: 180 },
    { bottom: 50, left: 50, rotate: 270 },
  ];

  return (
    <>
      {corners.map((corner, i) => {
        const cornerSpring = spring({
          frame: frame - (10 + i * 4),
          fps,
          config: enhancedSprings.smooth,
        });
        const cornerOpacity = interpolate(cornerSpring, [0, 1], [0, 0.5]);
        const scale = interpolate(cornerSpring, [0, 1], [0.8, 1]);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 50,
              height: 50,
              borderTop: `3px solid ${accentColor}`,
              borderLeft: `3px solid ${accentColor}`,
              top: corner.top,
              left: corner.left,
              right: corner.right,
              bottom: corner.bottom,
              opacity: cornerOpacity,
              transform: `rotate(${corner.rotate}deg) scale(${scale})`,
              boxShadow: `0 0 20px ${accentColor}30`,
            }}
          />
        );
      })}
    </>
  );
};

export const IntroScene: React.FC<IntroSceneProps> = ({
  repoName,
  prNumber,
  author,
  ownerAvatar,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Use wave float for organic motion
  const { y: floatY, rotate: floatRotate } = useWaveFloat(0, 8, 0.04, 0);

  // Main title - dramatic spring entrance with magnetic effect
  const titleSpring = spring({ frame, fps, config: enhancedSprings.dramatic });
  const titleY = interpolate(titleSpring, [0, 1], [120, 0], {
    extrapolateLeft: 'clamp',
  });
  const titleScale = interpolate(titleSpring, [0, 0.5, 1], [0.7, 1.05, 1]);
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const titleRotate = interpolate(titleSpring, [0, 1], [5, 0]);

  // PR number - explosive bounce entrance
  const prSpring = spring({ frame: frame - 15, fps, config: enhancedSprings.bouncy });
  const prScale = interpolate(prSpring, [0, 0.4, 0.7, 1], [0, 1.15, 0.95, 1]);
  const prOpacity = interpolate(frame, [15, 28], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const prRotate = interpolate(prSpring, [0, 1], [-20, 0]);

  // Author section - slide from left with fade
  const authorSpring = spring({ frame: frame - 30, fps, config: enhancedSprings.smooth });
  const authorX = interpolate(authorSpring, [0, 1], [-100, 0], {
    extrapolateLeft: 'clamp',
  });
  const authorOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Avatar with dramatic rotation and scale
  const avatarSpring = spring({ frame: frame - 38, fps, config: enhancedSprings.snap });
  const avatarScale = interpolate(avatarSpring, [0, 1], [0, 1]);
  const avatarRotate = interpolate(avatarSpring, [0, 1], [-180, 0]);

  // Glow pulse for avatar ring
  const avatarGlow = useGlowPulse(0.4, 0.12);

  // Exit animation with scale and upward motion
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames - 5],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitY = interpolate(exitProgress, [0, 1], [0, -100], {
    easing: Easing.out(Easing.cubic),
  });
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.92]);
  const exitOpacity = interpolate(exitProgress, [0, 0.7, 1], [1, 1, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg.primary,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Animated gradient mesh background */}
      <GradientMesh frame={frame} accentColor={accentColor} />

      {/* Wave-animated dot grid */}
      <DotGrid color={accentColor} frame={frame} />

      {/* Floating particle field */}
      <ParticleField frame={frame} fps={fps} accentColor={accentColor} />

      {/* Geometric decorative shapes with rotation */}
      <GeometricShapes frame={frame} fps={fps} accentColor={accentColor} />

      {/* Glowing corner brackets */}
      <CornerBrackets frame={frame} accentColor={accentColor} fps={fps} />

      {/* Main content container with exit animation */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing.xl,
          transform: `translateY(${floatY + exitY}px) rotate(${floatRotate * 0.5}deg) scale(${exitScale})`,
          opacity: exitOpacity,
          zIndex: 10,
        }}
      >
        {/* Repository name with PR number - enhanced typography */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: spacing.md,
            transform: `translateY(${titleY}px) rotate(${titleRotate}deg)`,
            opacity: titleOpacity,
          }}
        >
          <span
            style={{
              fontSize: typography.display.xl,
              fontWeight: typography.weight.black,
              color: colors.text.primary,
              letterSpacing: typography.tracking.tight,
              lineHeight: typography.leading.tight,
              textShadow: `0 4px 60px ${accentColor}20`,
              transform: `scale(${titleScale})`,
              display: 'inline-block',
            }}
          >
            {repoName}
          </span>
          <span
            style={{
              fontSize: typography.display.md,
              fontWeight: typography.weight.bold,
              color: accentColor,
              opacity: prOpacity,
              transform: `scale(${prScale}) rotate(${prRotate}deg)`,
              letterSpacing: typography.tracking.wide,
              display: 'inline-block',
              textShadow: `0 0 40px ${accentColor}50`,
            }}
          >
            #{prNumber}
          </span>
        </div>

        {/* Author section with enhanced avatar ring */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            transform: `translateX(${authorX}px)`,
            opacity: authorOpacity,
          }}
        >
          {/* Avatar with orbiting ring effect */}
          <div
            style={{
              position: 'relative',
              transform: `scale(${avatarScale}) rotate(${avatarRotate}deg)`,
            }}
          >
            {/* Outer glow ring with pulse */}
            <div
              style={{
                position: 'absolute',
                inset: -10,
                borderRadius: '50%',
                border: `3px solid ${accentColor}`,
                opacity: avatarGlow.intensity,
                transform: `scale(${1 + Math.sin(frame * 0.1) * 0.08})`,
                boxShadow: `0 0 ${30 + Math.sin(frame * 0.1) * 15}px ${accentColor}${Math.floor(avatarGlow.intensity * 80).toString(16).padStart(2, '0')}`,
              }}
            />
            {/* Secondary ring */}
            <div
              style={{
                position: 'absolute',
                inset: -4,
                borderRadius: '50%',
                border: `2px solid ${accentColor}60`,
                transform: `scale(${1 + Math.sin(frame * 0.08 + 1) * 0.05}) rotate(${frame * 0.5}deg)`,
              }}
            />
            <Img
              src={ownerAvatar}
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                border: `3px solid ${accentColor}`,
                boxShadow: `0 12px 48px ${accentColor}50`,
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                fontSize: typography.body.lg,
                fontWeight: typography.weight.medium,
                color: colors.text.secondary,
                letterSpacing: typography.tracking.wider,
                textTransform: 'uppercase',
              }}
            >
              PULL REQUEST BY
            </span>
            <span
              style={{
                fontSize: typography.body.xl,
                fontWeight: typography.weight.bold,
                color: colors.text.primary,
                letterSpacing: '0.02em',
              }}
            >
              @{author}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced bottom progress indicator with animation */}
      <div
        style={{
          position: 'absolute',
          bottom: spacing.xl,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: spacing.sm,
          zIndex: 20,
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const isActive = i === 0;
          const dotSpring = spring({
            frame: frame - (35 + i * 4),
            fps,
            config: enhancedSprings.gentle,
          });
          const dotOpacity = isActive
            ? 0.8 + Math.sin(frame * 0.15) * 0.2
            : interpolate(dotSpring, [0, 1], [0, 0.35]);
          const dotScale = isActive ? 1 : interpolate(dotSpring, [0, 1], [0.5, 1]);

          return (
            <div
              key={i}
              style={{
                width: isActive ? 36 : 10,
                height: 10,
                borderRadius: radius.full,
                backgroundColor: isActive ? accentColor : colors.text.muted,
                opacity: dotOpacity,
                transform: `scale(${dotScale})`,
                boxShadow: isActive ? `0 0 12px ${accentColor}60` : 'none',
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
