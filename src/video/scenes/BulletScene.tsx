import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { LayoutA } from '../layouts/LayoutA';
import { LayoutB } from '../layouts/LayoutB';
import { LayoutC } from '../layouts/LayoutC';
import { LayoutD } from '../layouts/LayoutD';
import { LayoutE } from '../layouts/LayoutE';
import { LayoutF } from '../layouts/LayoutF';
import { LayoutG } from '../layouts/LayoutG';
import { LayoutH } from '../layouts/LayoutH';
import { enhancedSprings } from '../enhancedAnimations';
import { colors, spacing, radius } from '../designSystem';

interface BulletSceneProps {
  text: string;
  index: number;
  accentColor: string;
}

// All 8 layouts for rich variety
const layouts = [LayoutA, LayoutB, LayoutC, LayoutD, LayoutE, LayoutF, LayoutG, LayoutH];

// Animated gradient mesh background
const GradientMesh: React.FC<{ frame: number; accentColor: string }> = ({ frame, accentColor }) => {
  const blob1X = Math.sin(frame * 0.008) * 100 + 300;
  const blob1Y = Math.cos(frame * 0.006) * 80 + 200;
  const blob2X = Math.cos(frame * 0.01) * 120 + 1500;
  const blob2Y = Math.sin(frame * 0.007) * 90 + 700;

  return (
    <div
      style={{
        position: 'absolute',
        inset: -50,
        background: `
          radial-gradient(ellipse 600px 400px at ${blob1X}px ${blob1Y}px, ${accentColor}08 0%, transparent 70%),
          radial-gradient(ellipse 500px 350px at ${blob2X}px ${blob2Y}px, ${colors.accent.slate}05 0%, transparent 70%)
        `,
        filter: 'blur(40px)',
        opacity: 0.8,
      }}
    />
  );
};

// Floating particles background
const FloatingParticles: React.FC<{ frame: number; fps: number; accentColor: string }> = ({
  frame,
  fps,
  accentColor,
}) => {
  const particles = Array.from({ length: 12 }, (_, i) => {
    const baseX = 5 + (i * 137.5) % 90;
    const baseY = 5 + (i * 72.3) % 90;
    const floatX = Math.sin((frame + i * 50) * 0.015) * 20;
    const floatY = Math.cos((frame + i * 50) * 0.012) * 15;
    const size = 2 + (i % 3);
    const opacity = 0.08 + Math.sin((frame + i * 20) * 0.03) * 0.05;
    const particleSpring = spring({
      frame: frame - (i * 4),
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
            boxShadow: `0 0 ${p.size * 2}px ${accentColor}20`,
          }}
        />
      ))}
    </>
  );
};

export const BulletScene: React.FC<BulletSceneProps> = ({
  text,
  index,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Layout = layouts[index % layouts.length];

  // Calculate scene position (0-indexed after intro and headline)
  const sceneIndex = index + 2;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg.primary,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 80,
        overflow: 'hidden',
      }}
    >
      {/* Animated gradient mesh */}
      <GradientMesh frame={frame} accentColor={accentColor} />

      {/* Floating particles */}
      <FloatingParticles frame={frame} fps={fps} accentColor={accentColor} />

      {/* Vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 0%, ${colors.bg.primary}85 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Main layout */}
      <div style={{ zIndex: 10, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Layout text={text} accentColor={accentColor} />
      </div>

      {/* Enhanced bottom progress indicator */}
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
          const isActive = i === sceneIndex;
          const dotSpring = spring({
            frame: frame - (i * 3),
            fps,
            config: enhancedSprings.gentle,
          });
          const dotOpacity = isActive
            ? 0.8 + Math.sin(frame * 0.15) * 0.2
            : interpolate(dotSpring, [0, 1], [0, 0.3]);
          const dotScale = isActive ? 1 : interpolate(dotSpring, [0, 1], [0.6, 1]);

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
                boxShadow: isActive ? `0 0 12px ${accentColor}50` : 'none',
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
