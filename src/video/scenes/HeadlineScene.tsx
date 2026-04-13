import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { springs, useWordHighlight } from '../animations';
import { typography, colors, spacing, radius, toneConfigs, layout } from '../designSystem';

interface HeadlineSceneProps {
  headline: string;
  emoji: string;
  accentColor: string;
  tone: 'celebratory' | 'relief' | 'technical' | 'minor' | 'educational' | 'hype';
}

// Kinetic typography spotlight component
const Spotlight: React.FC<{ frame: number; accentColor: string }> = ({
  frame,
  accentColor,
}) => {
  const spotlightX = interpolate(frame, [0, 120], [-200, 2120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle 400px at ${spotlightX}px 50%, ${accentColor}20 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}
    />
  );
};

// Organic floating orbs
const FloatingOrbs: React.FC<{
  frame: number;
  accentColor: string;
  count: number;
}> = ({ frame, accentColor, count }) => {
  const orbs = Array.from({ length: count }, (_, i) => {
    const baseX = 15 + (i * 137.5) % 70;
    const baseY = 15 + (i * 72) % 70;
    const floatX = Math.sin((frame + i * 50) * 0.015) * 40;
    const floatY = Math.cos((frame + i * 50) * 0.012) * 30;
    const size = 60 + (i % 4) * 40;
    const opacity = 0.04 + (i % 3) * 0.02;

    return { x: baseX + floatX, y: baseY + floatY, size, opacity };
  });

  return (
    <>
      {orbs.map((orb, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            backgroundColor: accentColor,
            opacity: orb.opacity,
            filter: 'blur(40px)',
          }}
        />
      ))}
    </>
  );
};

// Tone badge component
const ToneBadge: React.FC<{
  tone: string;
  frame: number;
  fps: number;
  accentColor: string;
}> = ({ tone, frame, fps, accentColor }) => {
  const badgeSpring = spring({ frame: frame - 20, fps, config: springs.snappy });
  const badgeScale = interpolate(badgeSpring, [0, 1], [0.8, 1]);
  const badgeOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const toneLabels: Record<string, { label: string; icon: string }> = {
    celebratory: { label: 'CELEBRATION', icon: '✦' },
    relief: { label: 'RELIEF', icon: '✓' },
    technical: { label: 'TECH UPDATE', icon: '⚡' },
    minor: { label: 'MAINTENANCE', icon: '◆' },
    educational: { label: 'LEARNING', icon: '◈' },
    hype: { label: 'EXCITING', icon: '★' },
  };

  const { label, icon } = toneLabels[tone] || toneLabels.celebratory;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        padding: `${spacing.sm}px ${spacing.md}px`,
        backgroundColor: `${accentColor}15`,
        border: `1px solid ${accentColor}40`,
        borderRadius: radius.xl,
        transform: `scale(${badgeScale})`,
        opacity: badgeOpacity,
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span
        style={{
          fontSize: typography.utility.xs,
          fontWeight: typography.weight.semibold,
          color: accentColor,
          letterSpacing: typography.tracking.wider,
        }}
      >
        {label}
      </span>
    </div>
  );
};

export const HeadlineScene: React.FC<HeadlineSceneProps> = ({
  headline,
  emoji,
  accentColor,
  tone,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Split headline into words
  const words = headline.split(' ');
  const highlightedWords = useWordHighlight(words, 12, 7);

  // Get tone configuration
  const toneConfig = toneConfigs[tone] || toneConfigs.celebratory;

  // Emoji entrance with elegant physics
  const emojiSpring = spring({ frame, fps, config: springs.bouncy });
  const emojiScale = interpolate(emojiSpring, [0, 1], [0, 1]);
  const emojiY = interpolate(emojiSpring, [0, 1], [60, 0]);
  const emojiRotate = interpolate(emojiSpring, [0, 1], [45, 0]);

  // Subtle continuous animation
  const emojiPulse = Math.sin(frame * 0.06) * 0.03 + 1;

  // Exit animation
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitY = interpolate(exitProgress, [0, 1], [0, -60], {
    easing: Easing.out(Easing.quad),
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // Progress dots for scene indicator
  const sceneIndex = 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg.primary,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: spacing.xl,
        overflow: 'hidden',
      }}
    >
      {/* Organic background orbs */}
      <FloatingOrbs
        frame={frame}
        accentColor={accentColor}
        count={toneConfig.particleCount}
      />

      {/* Spotlight effect */}
      <Spotlight frame={frame} accentColor={accentColor} />

      {/* Top vignette */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 200,
          background: 'linear-gradient(180deg, rgba(15,15,18,0.6) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing.lg,
          transform: `translateY(${exitY}px)`,
          opacity: exitOpacity,
          zIndex: 10,
          maxWidth: layout.maxContentWidth,
          padding: `0 ${spacing['2xl']}px`,
        }}
      >
        {/* Tone badge */}
        <ToneBadge tone={tone} frame={frame} fps={fps} accentColor={accentColor} />

        {/* Emoji with entrance */}
        <div
          style={{
            fontSize: 120,
            transform: `scale(${emojiScale * emojiPulse}) translateY(${emojiY}px) rotate(${emojiRotate}deg)`,
            filter: `drop-shadow(0 16px 40px ${accentColor}40)`,
            marginBottom: spacing.sm,
          }}
        >
          {emoji}
        </div>

        {/* Headline with kinetic typography */}
        <h1
          style={{
            fontSize: typography.display.md,
            fontWeight: typography.weight.black,
            color: colors.text.primary,
            textAlign: 'center',
            lineHeight: typography.leading.tight,
            letterSpacing: typography.tracking.tight,
            maxWidth: 1200,
            margin: 0,
          }}
        >
          {highlightedWords.map((wordData, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.25em',
                marginBottom: '0.1em',
                color: wordData.isHighlighted ? accentColor : colors.text.primary,
                textShadow: wordData.isHighlighted
                  ? `0 0 60px ${accentColor}60`
                  : 'none',
                opacity: wordData.opacity,
                transform: wordData.isHighlighted ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'transform 0.15s ease-out',
              }}
            >
              {wordData.word}
            </span>
          ))}
        </h1>

        {/* Animated underline */}
        <div
          style={{
            width: interpolate(
              frame,
              [words.length * 7 + 25, words.length * 7 + 55],
              [0, 180],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            ),
            height: 3,
            background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
            borderRadius: radius.sm,
            marginTop: spacing.md,
            opacity: 0.8,
          }}
        />
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
          const isActive = i === sceneIndex;
          const dotOpacity = interpolate(frame, [30 + i * 4, 40 + i * 4], [0, isActive ? 1 : 0.35], {
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
                transition: 'width 0.3s ease',
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
