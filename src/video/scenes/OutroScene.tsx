import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { springs } from '../animations';
import { useFireworkBurst, usePerspectiveTilt, usePhysicsParticles } from '../cinematicEffects';
import { typography, colors, spacing, radius } from '../designSystem';

interface OutroSceneProps {
  repoName: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  accentColor: string;
}

// Stat card component
const StatCard: React.FC<{
  value: number;
  label: string;
  color: string;
  prefix?: string;
  frame: number;
  fps: number;
  delay: number;
}> = ({ value, label, color, prefix, frame, fps, delay }) => {
  // Card entrance
  const cardSpring = spring({ frame: frame - delay, fps, config: springs.snappy });
  const cardY = interpolate(cardSpring, [0, 1], [60, 0]);
  const cardScale = interpolate(cardSpring, [0, 1], [0.85, 1]);
  const cardOpacity = interpolate(frame, [delay, delay + 18], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Counter animation
  const counterProgress = interpolate(
    frame,
    [delay + 10, delay + 45],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const easedProgress = Easing.out(Easing.cubic)(counterProgress);
  const animatedValue = Math.round(easedProgress * value);

  // Underline animation
  const underlineWidth = interpolate(frame, [delay + 25, delay + 50], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${spacing.lg}px ${spacing.xl}px`,
        backgroundColor: `${colors.bg.secondary}80`,
        borderRadius: radius.xl,
        border: `1px solid ${color}25`,
        minWidth: 200,
        transform: `translateY(${cardY}px) scale(${cardScale})`,
        opacity: cardOpacity,
        boxShadow: `0 16px 48px ${color}10`,
      }}
    >
      {/* Value */}
      <div
        style={{
          fontSize: typography.utility.stat,
          fontWeight: typography.weight.black,
          color,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
          marginBottom: spacing.sm,
          textShadow: `0 0 40px ${color}40`,
        }}
      >
        {prefix || ''}{animatedValue.toLocaleString()}
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: typography.body.sm,
          fontWeight: typography.weight.semibold,
          color: colors.text.tertiary,
          letterSpacing: typography.tracking.wide,
          textTransform: 'uppercase',
          marginBottom: spacing.sm,
        }}
      >
        {label}
      </div>

      {/* Animated underline */}
      <div
        style={{
          width: `${underlineWidth}%`,
          height: 3,
          backgroundColor: color,
          borderRadius: radius.sm,
          opacity: 0.5,
        }}
      />
    </div>
  );
};

// Celebration particles with organic movement
const CelebrationParticles: React.FC<{
  frame: number;
  fps: number;
  accentColor: string;
}> = ({ frame, fps, accentColor }) => {
  const particleCount = 24;
  const particleColors = [accentColor, colors.semantic.success, colors.semantic.error, colors.accent.gold, colors.accent.sage];

  const particles = Array.from({ length: particleCount }, (_, i) => {
    const particleDelay = 8 + (i % 6) * 4;
    const particleSpring = spring({
      frame: frame - particleDelay,
      fps,
      config: springs.snappy,
    });

    const pseudoRandom1 = ((i * 997) % 1000) / 1000;
    const pseudoRandom2 = ((i * 773) % 1000) / 1000;
    const angle = (i / particleCount) * Math.PI * 2 + pseudoRandom1 * 0.8;
    const distance = 120 + pseudoRandom2 * 180;

    const startX = Math.cos(angle) * 30;
    const startY = Math.sin(angle) * 30;
    const endX = Math.cos(angle) * distance;
    const endY = Math.sin(angle) * distance;

    const x = interpolate(particleSpring, [0, 1], [startX, endX]);
    const y = interpolate(particleSpring, [0, 1], [startY, endY]);
    const scale = interpolate(particleSpring, [0, 0.6, 1], [0, 1, 0]);
    const opacity = interpolate(particleSpring, [0, 0.4, 1], [0, 1, 0]);

    const color = particleColors[i % particleColors.length];
    const size = 8 + (i % 5) * 4;
    const rotation = frame * (2 + (i % 3)) + i * 30;

    return { x, y, scale, opacity, color, size, rotation };
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }}
    >
      {particles.map((particle, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? radius.sm : '50% 0',
            backgroundColor: particle.color,
            transform: `translate(${particle.x}px, ${particle.y}px) scale(${particle.scale}) rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size}px ${particle.color}60`,
          }}
        />
      ))}
    </div>
  );
};

// Success badge
const SuccessBadge: React.FC<{
  frame: number;
  fps: number;
}> = ({ frame, fps }) => {
  const badgeSpring = spring({ frame: frame - 55, fps, config: springs.bouncy });
  const badgeScale = interpolate(badgeSpring, [0, 1], [0, 1]);
  const badgeOpacity = interpolate(frame, [55, 70], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        padding: `${spacing.md}px ${spacing.lg}px`,
        backgroundColor: `${colors.semantic.success}15`,
        border: `1px solid ${colors.semantic.success}40`,
        borderRadius: radius.xl,
        transform: `scale(${badgeScale})`,
        opacity: badgeOpacity,
      }}
    >
      <span style={{ fontSize: 20 }}>✓</span>
      <span
        style={{
          fontSize: typography.body.lg,
          fontWeight: typography.weight.bold,
          color: colors.semantic.success,
          letterSpacing: typography.tracking.wide,
        }}
      >
        MERGED SUCCESSFULLY
      </span>
    </div>
  );
};

export const OutroScene: React.FC<OutroSceneProps> = ({
  repoName,
  filesChanged,
  additions,
  deletions,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Title entrance
  const titleSpring = spring({ frame, fps, config: springs.smooth });
  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Exit animation
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 25, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.95], {
    easing: Easing.in(Easing.quad),
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // 3D perspective tilt for depth
  const perspectiveTilt = usePerspectiveTilt(0);

  // Firework burst celebration at frame 30
  const fireworks = useFireworkBurst(30, 40, [
    accentColor,
    colors.semantic.success,
    '#f4a261',
    '#e9c46a',
    '#b48ead',
  ]);

  // Physics particles for background effect
  const physicsParticles = usePhysicsParticles(12, accentColor, {
    gravity: 0.12,
    friction: 0.98,
    turbulence: 0.06,
    spawnRate: 10,
  });

  // Stats configuration
  const stats = [
    { value: filesChanged, label: 'Files Changed', color: colors.text.tertiary, delay: 10 },
    { value: additions, label: 'Additions', color: colors.semantic.success, prefix: '+', delay: 25 },
    { value: deletions, label: 'Deletions', color: colors.semantic.error, prefix: '-', delay: 40 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg.primary,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: spacing['2xl'],
        overflow: 'hidden',
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 100%, ${accentColor}10 0%, transparent 60%)`,
        }}
      />

      {/* Firework burst celebration */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 8,
        }}
      >
        {fireworks.map((fw, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: fw.size,
              height: fw.size,
              borderRadius: '50%',
              backgroundColor: fw.color,
              transform: `translate(${fw.x}px, ${fw.y}px) scale(${fw.scale}) rotate(${fw.rotation}deg)`,
              opacity: fw.opacity,
              boxShadow: `0 0 ${fw.size * 2}px ${fw.color}`,
            }}
          />
        ))}
      </div>

      {/* Physics particles background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 6,
        }}
      >
        {physicsParticles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: `scale(${p.scale}) rotate(${p.rotation}deg)`,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        ))}
      </div>

      {/* Celebration particles */}
      <CelebrationParticles frame={frame} fps={fps} accentColor={accentColor} />

      {/* Content container with 3D perspective */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing.xl,
          transform: `${perspectiveTilt.transform} scale(${exitScale})`,
          opacity: exitOpacity,
          zIndex: 10,
        }}
      >
        {/* Title */}
        <div
          style={{
            textAlign: 'center',
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
          }}
        >
          <span
            style={{
              fontSize: typography.body.lg,
              fontWeight: typography.weight.medium,
              color: colors.text.tertiary,
              letterSpacing: typography.tracking.wide,
            }}
          >
            CONTRIBUTION SUMMARY
          </span>
          <div
            style={{
              fontSize: typography.display.sm,
              fontWeight: typography.weight.black,
              color: colors.text.primary,
              marginTop: spacing.sm,
              letterSpacing: typography.tracking.tight,
            }}
          >
            {repoName}
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: spacing.lg,
            alignItems: 'stretch',
          }}
        >
          {stats.map((stat, i) => (
            <StatCard
              key={i}
              value={stat.value}
              label={stat.label}
              color={stat.color}
              prefix={stat.prefix}
              frame={frame}
              fps={fps}
              delay={stat.delay}
            />
          ))}
        </div>

        {/* Success badge */}
        <SuccessBadge frame={frame} fps={fps} />
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
          const isActive = i === 4;
          const dotOpacity = interpolate(frame, [30 + i * 3, 40 + i * 3], [0, isActive ? 1 : 0.35], {
            extrapolateRight: 'clamp',
          });

          return (
            <div
              key={i}
              style={{
                width: isActive ? 32 : 8,
                height: 8,
                borderRadius: radius.full,
                backgroundColor: isActive ? accentColor : colors.text.muted,
                opacity: dotOpacity,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

