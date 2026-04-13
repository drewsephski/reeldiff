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
import { colors, spacing, radius } from '../designSystem';

interface RepoIntroSceneProps {
  repoName: string;
  owner: string;
  ownerAvatar: string;
  stars: number;
  forks: number;
  accentColor: string;
}

// Animated gradient mesh background
const GradientMesh: React.FC<{ frame: number; accentColor: string }> = ({ frame, accentColor }) => {
  const blob1X = Math.sin(frame * 0.012) * 150 + 400;
  const blob1Y = Math.cos(frame * 0.01) * 100 + 300;
  const blob2X = Math.cos(frame * 0.015) * 200 + 1400;
  const blob2Y = Math.sin(frame * 0.013) * 120 + 600;

  return (
    <div
      style={{
        position: 'absolute',
        inset: -100,
        background: `
          radial-gradient(ellipse 700px 500px at ${blob1X}px ${blob1Y}px, ${accentColor}12 0%, transparent 70%),
          radial-gradient(ellipse 500px 400px at ${blob2X}px ${blob2Y}px, ${colors.accent.slate}08 0%, transparent 70%)
        `,
        filter: 'blur(50px)',
      }}
    />
  );
};

// Floating particle field
const ParticleField: React.FC<{ frame: number; fps: number; accentColor: string }> = ({
  frame,
  fps,
  accentColor,
}) => {
  const particles = Array.from({ length: 15 }, (_, i) => {
    const baseX = 8 + (i * 137.5) % 84;
    const baseY = 8 + (i * 72.3) % 84;
    const floatX = Math.sin((frame + i * 40) * 0.022) * 25;
    const floatY = Math.cos((frame + i * 40) * 0.02) * 20;
    const size = 3 + (i % 4) * 2;
    const opacity = 0.12 + Math.sin((frame + i * 15) * 0.04) * 0.08;
    const particleSpring = spring({
      frame: frame - (i * 3),
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
            boxShadow: `0 0 ${p.size * 2}px ${accentColor}30`,
          }}
        />
      ))}
    </>
  );
};

export const RepoIntroScene: React.FC<RepoIntroSceneProps> = ({
  repoName,
  owner,
  ownerAvatar,
  stars,
  forks,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Use wave float for organic motion
  const { y: floatY, rotate: floatRotate } = useWaveFloat(0, 10, 0.03, 0);

  // Glow pulse for effects
  const glow = useGlowPulse(0.4, 0.1);

  // Enhanced repo name entrance - dramatic scale and fade
  const repoNameSpring = spring({ frame, fps, config: enhancedSprings.dramatic });
  const repoNameY = interpolate(repoNameSpring, [0, 1], [100, 0]);
  const repoNameScale = interpolate(repoNameSpring, [0, 0.5, 1], [0.6, 1.05, 1]);
  const repoNameOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Stats bounce in with explosive spring
  const statsSpring = spring({ frame: frame - 12, fps, config: enhancedSprings.elastic });
  const statsScale = interpolate(statsSpring, [0, 0.4, 0.7, 1], [0, 1.15, 0.95, 1]);
  const statsOpacity = interpolate(frame, [12, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Avatar with rotation, scale, and entrance
  const avatarSpring = spring({ frame: frame - 20, fps, config: enhancedSprings.snap });
  const avatarScale = interpolate(avatarSpring, [0, 1], [0, 1]);
  const avatarRotate = interpolate(avatarSpring, [0, 1], [-270, 0]);

  // Animated counters for stats with blur effect
  const getAnimatedValue = (target: number, startFrame: number, duration: number = 35) => {
    const progress = interpolate(
      frame,
      [startFrame, startFrame + duration],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const eased = Easing.out(Easing.cubic)(progress);
    return Math.round(eased * target);
  };

  // Enhanced exit animation
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 25, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitY = interpolate(exitProgress, [0, 1], [0, -100], {
    easing: Easing.in(Easing.cubic),
  });
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.95]);
  const exitOpacity = interpolate(exitProgress, [0, 0.8, 1], [1, 1, 0]);

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const animatedStars = getAnimatedValue(stars, 25);
  const animatedForks = getAnimatedValue(forks, 30);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg.primary,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: spacing.xl,
        opacity: exitOpacity,
        overflow: 'hidden',
      }}
    >
      {/* Animated gradient mesh */}
      <GradientMesh frame={frame} accentColor={accentColor} />

      {/* Particle field */}
      <ParticleField frame={frame} fps={fps} accentColor={accentColor} />

      {/* Main content with wave float and exit */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing.lg,
          transform: `translateY(${repoNameY + floatY + exitY}px) rotate(${floatRotate * 0.3}deg) scale(${exitScale})`,
          zIndex: 10,
        }}
      >
        {/* Repo name with dramatic entrance */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            opacity: repoNameOpacity,
            transform: `scale(${repoNameScale})`,
          }}
        >
          <span
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: colors.text.primary,
              textShadow: `0 4px 40px ${accentColor}${Math.floor(glow.intensity * 60).toString(16).padStart(2, '0')}`,
              letterSpacing: '-0.02em',
            }}
          >
            {repoName}
          </span>
        </div>

        {/* Owner with enhanced avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            transform: `scale(${avatarScale}) rotate(${avatarRotate}deg)`,
          }}
        >
          {/* Avatar with pulsing glow rings */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                inset: -8,
                borderRadius: '50%',
                border: `3px solid ${accentColor}`,
                opacity: glow.intensity,
                transform: `scale(${1 + Math.sin(frame * 0.1) * 0.08})`,
                boxShadow: `0 0 ${25 + glow.intensity * 20}px ${accentColor}${Math.floor(glow.intensity * 70).toString(16).padStart(2, '0')}`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: -4,
                borderRadius: '50%',
                border: `2px solid ${accentColor}50`,
                transform: `scale(${1 + Math.sin(frame * 0.08 + 1) * 0.05}) rotate(${frame * 0.3}deg)`,
              }}
            />
            {ownerAvatar ? (
              <Img
                src={ownerAvatar}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: `4px solid ${accentColor}`,
                  boxShadow: `0 12px 40px ${accentColor}50`,
                }}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: `4px solid ${accentColor}`,
                  backgroundColor: colors.bg.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                }}
              >
                👤
              </div>
            )}
          </div>
          <span
            style={{
              fontSize: 36,
              color: colors.text.secondary,
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            @{owner}
          </span>
        </div>

        {/* Stars & Forks stats with enhanced styling */}
        <div
          style={{
            display: 'flex',
            gap: spacing.xl,
            transform: `scale(${statsScale})`,
            opacity: statsOpacity,
            marginTop: spacing.md,
          }}
        >
          {/* Stars */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: '#fbbf24',
                textShadow: `0 0 ${25 + Math.sin(frame * 0.15) * 10}px #fbbf2460`,
              }}
            >
              ⭐ {formatNumber(animatedStars)}
            </div>
            <div style={{ fontSize: 20, color: colors.text.tertiary, marginTop: 4, fontWeight: 500 }}>stars</div>
          </div>

          {/* Forks */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: '#60a5fa',
                textShadow: `0 0 ${25 + Math.sin(frame * 0.15 + 1) * 10}px #60a5fa60`,
              }}
            >
              🍴 {formatNumber(animatedForks)}
            </div>
            <div style={{ fontSize: 20, color: colors.text.tertiary, marginTop: 4, fontWeight: 500 }}>forks</div>
          </div>
        </div>
      </div>

      {/* Bottom progress indicator */}
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
