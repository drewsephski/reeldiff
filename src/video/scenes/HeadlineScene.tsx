import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { enhancedSprings, useGlowPulse, useWaveFloat } from '../enhancedAnimations';
import {
  useEmphasisWords,
  useOrbitingSparks,
  usePerspectiveTilt,
} from '../cinematicEffects';
import { typography, colors, spacing, radius, toneConfigs, layout } from '../designSystem';

interface HeadlineSceneProps {
  headline: string;
  emoji: string;
  accentColor: string;
  tone: 'celebratory' | 'relief' | 'technical' | 'minor' | 'educational' | 'hype';
}

// Enhanced floating orbs with varied shapes and motion
const FloatingOrbs: React.FC<{
  frame: number;
  accentColor: string;
  count: number;
  secondaryColor?: string;
}> = ({ frame, accentColor, count, secondaryColor }) => {
  const orbColors = [accentColor, secondaryColor || '#5e81ac', '#f4a261'];
  const orbs = Array.from({ length: count }, (_, i) => {
    const baseX = 10 + (i * 137.5) % 80;
    const baseY = 10 + (i * 72) % 70;
    const floatX = Math.sin((frame + i * 60) * 0.018) * 50;
    const floatY = Math.cos((frame + i * 60) * 0.015) * 40;
    const size = 80 + (i % 5) * 50;
    const opacity = 0.03 + (i % 4) * 0.02;
    const scale = 1 + Math.sin(frame * 0.03 + i) * 0.15;
    const color = orbColors[i % orbColors.length];

    return { x: baseX + floatX * 0.01, y: baseY + floatY * 0.01, size, opacity, scale, color };
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
            width: orb.size * orb.scale,
            height: orb.size * orb.scale,
            borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '30%' : '60% 40%',
            backgroundColor: orb.color,
            opacity: orb.opacity,
            filter: 'blur(50px)',
            transform: `rotate(${frame * 0.2 + i * 30}deg)`,
          }}
        />
      ))}
    </>
  );
};

// Particle burst effect
const ParticleBurst: React.FC<{
  frame: number;
  fps: number;
  accentColor: string;
  intensity: number;
}> = ({ frame, fps, accentColor, intensity }) => {
  const particleCount = Math.floor(intensity * 15);

  const particles = Array.from({ length: particleCount }, (_, i) => {
    const delay = i * 2;
    const particleSpring = spring({
      frame: frame - 15 - delay,
      fps,
      config: enhancedSprings.snappy,
    });
    const angle = (i / particleCount) * Math.PI * 2 + (frame * 0.01);
    const distance = 100 + (i % 3) * 80;
    const x = Math.cos(angle) * interpolate(particleSpring, [0, 1], [0, distance]);
    const y = Math.sin(angle) * interpolate(particleSpring, [0, 1], [0, distance]);
    const scale = interpolate(particleSpring, [0, 0.5, 1], [0, 1, 0.3]);
    const opacity = interpolate(particleSpring, [0, 0.3, 1], [0, 0.8, 0]);
    const size = 4 + (i % 4) * 3;

    return { x, y, scale, opacity, size };
  });

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: accentColor,
            transform: `translate(${p.x}px, ${p.y}px) scale(${p.scale})`,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px ${accentColor}`,
          }}
        />
      ))}
    </div>
  );
};

// Enhanced tone badge with glow pulse
const ToneBadge: React.FC<{
  tone: string;
  frame: number;
  fps: number;
  accentColor: string;
}> = ({ tone, frame, fps, accentColor }) => {
  const badgeSpring = spring({ frame: frame - 10, fps, config: enhancedSprings.snap });
  const badgeScale = interpolate(badgeSpring, [0, 0.6, 1], [0, 1.1, 1]);
  const badgeOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const glow = useGlowPulse(0.3, 0.1);

  const toneLabels: Record<string, { label: string; icon: string; gradient: string }> = {
    celebratory: { label: 'CELEBRATION', icon: '✦', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
    relief: { label: 'RELIEF', icon: '✓', gradient: 'linear-gradient(135deg, #81b29a, #6b9c7a)' },
    technical: { label: 'TECH UPDATE', icon: '⚡', gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)' },
    minor: { label: 'MAINTENANCE', icon: '◆', gradient: 'linear-gradient(135deg, #9ca3af, #6b7280)' },
    educational: { label: 'LEARNING', icon: '◈', gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)' },
    hype: { label: 'EXCITING', icon: '★', gradient: 'linear-gradient(135deg, #f472b6, #ec4899)' },
  };

  const { label, icon } = toneLabels[tone] || toneLabels.celebratory;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        padding: `${spacing.sm}px ${spacing.lg}px`,
        background: `${accentColor}12`,
        border: `2px solid ${accentColor}${Math.floor(glow.intensity * 100).toString(16).padStart(2, '0')}`,
        borderRadius: radius.xl,
        transform: `scale(${badgeScale})`,
        opacity: badgeOpacity,
        boxShadow: `0 0 ${20 + glow.intensity * 20}px ${accentColor}${Math.floor(glow.intensity * 60).toString(16).padStart(2, '0')}`,
      }}
    >
      <span style={{ fontSize: 18, filter: `drop-shadow(0 0 4px ${accentColor})` }}>{icon}</span>
      <span
        style={{
          fontSize: typography.utility.xs,
          fontWeight: typography.weight.bold,
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

  // Typewriter effect for headline
  const charsPerFrame = 0.8;
  const typewriterProgress = Math.min(headline.length, Math.floor(frame * charsPerFrame));
  const visibleText = headline.slice(0, typewriterProgress);
  const isTypingComplete = typewriterProgress >= headline.length;

  // Blinking cursor animation
  const cursorBlink = Math.sin(frame * 0.4) > 0;
  const showCursor = !isTypingComplete || (isTypingComplete && cursorBlink);

  // Split visible text into words for kinetic animation
  const words = visibleText.split(' ');
  const kineticWords = useEmphasisWords(words, 15, 5, 3);

  // 3D perspective tilt for depth
  const perspectiveTilt = usePerspectiveTilt(0);

  // Orbiting sparks for dynamic background
  const orbitingSparks = useOrbitingSparks(8, 300, 1.5, 80);

  // Get tone configuration
  const toneConfig = toneConfigs[tone] || toneConfigs.celebratory;

  // Enhanced emoji entrance with dramatic physics
  const emojiSpring = spring({ frame, fps, config: enhancedSprings.elastic });
  const emojiScale = interpolate(emojiSpring, [0, 0.5, 0.8, 1], [0, 1.2, 0.95, 1]);
  const emojiY = interpolate(emojiSpring, [0, 1], [80, 0]);
  const emojiRotate = interpolate(emojiSpring, [0, 1], [90, 0]);

  // Wave float for organic motion
  const { y: waveY, rotate: waveRotate } = useWaveFloat(0, 6, 0.05, 0);

  // Glow pulse effect
  const glow = useGlowPulse(0.4, 0.08);

  // Enhanced exit animation
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 25, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitY = interpolate(exitProgress, [0, 1], [0, -80], {
    easing: Easing.out(Easing.cubic),
  });
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.95]);
  const exitOpacity = interpolate(exitProgress, [0, 0.8, 1], [1, 1, 0]);

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
      {/* Enhanced floating orbs with varied colors */}
      <FloatingOrbs
        frame={frame}
        accentColor={accentColor}
        count={toneConfig.particleCount}
        secondaryColor={colors.accent.sage}
      />

      {/* Particle burst for celebratory tones */}
      {(tone === 'celebratory' || tone === 'hype') && (
        <ParticleBurst
          frame={frame}
          fps={fps}
          accentColor={accentColor}
          intensity={tone === 'hype' ? 1.5 : 1}
        />
      )}

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

      {/* Orbiting sparks background */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        {orbitingSparks.map((spark, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: spark.size,
              height: spark.size,
              borderRadius: '50%',
              backgroundColor: accentColor,
              transform: `translate(${spark.x}px, ${spark.y}px) scale(${spark.scale})`,
              opacity: spark.opacity,
              boxShadow: `0 0 ${spark.size * 3}px ${accentColor}`,
            }}
          />
        ))}
      </div>

      {/* Content container with 3D perspective and enhanced animations */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing.lg,
          transform: `${perspectiveTilt.transform} translateY(${exitY + waveY}px) scale(${exitScale})`,
          opacity: exitOpacity,
          zIndex: 10,
          maxWidth: layout.maxContentWidth,
          padding: `0 ${spacing['2xl']}px`,
        }}
      >
        {/* Enhanced tone badge */}
        <ToneBadge tone={tone} frame={frame} fps={fps} accentColor={accentColor} />

        {/* Emoji with enhanced entrance and glow */}
        <div
          style={{
            fontSize: 140,
            transform: `scale(${emojiScale}) translateY(${emojiY + waveY}px) rotate(${emojiRotate + waveRotate}deg)`,
            filter: `drop-shadow(0 20px 60px ${accentColor}${Math.floor(glow.intensity * 80).toString(16).padStart(2, '0')})`,
            marginBottom: spacing.sm,
          }}
        >
          {emoji}
        </div>

        {/* Headline with typewriter and kinetic typography */}
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
            position: 'relative',
          }}
        >
          {kineticWords.map((wordData: { word: string; transform: string; opacity: number; isEmphasis: boolean }, i: number) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.25em',
                marginBottom: '0.1em',
                color: wordData.isEmphasis ? accentColor : colors.text.primary,
                textShadow: wordData.isEmphasis
                  ? `0 0 50px ${accentColor}${Math.floor(glow.intensity * 100).toString(16).padStart(2, '0')}`
                  : 'none',
                opacity: wordData.opacity,
                transform: wordData.transform,
                fontSize: wordData.isEmphasis ? '1.05em' : '1em',
              }}
            >
              {wordData.word}
            </span>
          ))}
          {/* Blinking typewriter cursor */}
          <span
            style={{
              display: 'inline-block',
              width: 4,
              height: '1em',
              backgroundColor: accentColor,
              marginLeft: 4,
              opacity: showCursor ? 1 : 0,
              boxShadow: `0 0 10px ${accentColor}`,
              verticalAlign: 'middle',
            }}
          />
        </h1>

        {/* Enhanced animated underline with glow */}
        <div
          style={{
            width: interpolate(
              frame,
              [words.length * 5 + 20, words.length * 5 + 50],
              [0, 200],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            ),
            height: 4,
            background: `linear-gradient(90deg, transparent 0%, ${accentColor} 30%, ${accentColor} 70%, transparent 100%)`,
            borderRadius: radius.sm,
            marginTop: spacing.md,
            opacity: 0.8,
            boxShadow: `0 0 ${10 + glow.intensity * 10}px ${accentColor}60`,
          }}
        />
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
            frame: frame - (25 + i * 3),
            fps,
            config: enhancedSprings.gentle,
          });
          const dotOpacity = isActive
            ? 0.8 + Math.sin(frame * 0.15) * 0.2
            : interpolate(dotSpring, [0, 1], [0, 0.35]);
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
                boxShadow: isActive ? `0 0 12px ${accentColor}60` : 'none',
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
