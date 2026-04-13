import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { springs, useWordHighlight } from '../animations';

interface HeadlineSceneProps {
  headline: string;
  emoji: string;
  accentColor: string;
  tone: 'celebratory' | 'relief' | 'technical' | 'minor';
}

export const HeadlineScene: React.FC<HeadlineSceneProps> = ({
  headline,
  emoji,
  accentColor,
  tone,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Split headline into words for word-by-word reveal
  const words = headline.split(' ');
  const highlightedWords = useWordHighlight(words, 10, 8);

  // Emoji entrance with bounce and continuous animation
  const emojiSpring = spring({ frame, fps, config: springs.bouncy });
  const emojiScale = interpolate(emojiSpring, [0, 1], [0, 1.3]);
  const emojiRotate = interpolate(emojiSpring, [0, 1], [180, 0]);

  // Continuous floating and pulsing
  const emojiFloat = Math.sin(frame * 0.12) * 8;
  const emojiPulse = Math.sin(frame * 0.08) * 0.1 + 1;

  // Background glow pulses
  const glowIntensity = interpolate(
    frame,
    [0, 30, 60],
    [0.2, 0.5, 0.3],
    { extrapolateRight: 'clamp' }
  ) + Math.sin(frame * 0.05) * 0.1;

  // Tone-based styling
  const getToneEffects = () => {
    switch (tone) {
      case 'celebratory':
        return {
          particleCount: 20,
          particleSpeed: 2,
          glowColor: accentColor,
        };
      case 'relief':
        return {
          particleCount: 8,
          particleSpeed: 1,
          glowColor: '#4ade80',
        };
      case 'technical':
        return {
          particleCount: 5,
          particleSpeed: 0.5,
          glowColor: '#60a5fa',
        };
      case 'minor':
        return {
          particleCount: 0,
          particleSpeed: 0,
          glowColor: '#9ca3af',
        };
    }
  };

  const toneEffects = getToneEffects();

  // Generate floating particles based on tone
  const particles = Array.from({ length: toneEffects.particleCount }, (_, i) => {
    const particleSpring = spring({
      frame: frame - i * 2,
      fps,
      config: springs.gentle,
    });
    const baseX = (i * 137.5) % 100; // Golden angle distribution
    const baseY = (i * 72) % 100;
    const floatX = Math.sin((frame + i * 50) * 0.02 * toneEffects.particleSpeed) * 30;
    const floatY = Math.cos((frame + i * 50) * 0.02 * toneEffects.particleSpeed) * 30;
    const opacity = interpolate(particleSpring, [0, 1], [0, 0.6], {
      extrapolateRight: 'clamp',
    });

    return { x: baseX + floatX, y: baseY + floatY, opacity, size: 4 + (i % 3) * 2 };
  });

  // Exit animation
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.9], {
    easing: Easing.in(Easing.quad),
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // Background expanding circles
  const circles = Array.from({ length: 3 }, (_, i) => {
    const circleSpring = spring({
      frame: frame - i * 10,
      fps,
      config: springs.smooth,
    });
    const scale = interpolate(circleSpring, [0, 1], [0, 1 + i * 0.3]);
    const opacity = interpolate(frame, [i * 10, i * 10 + 30], [0, 0.15], {
      extrapolateRight: 'clamp',
    });
    return { scale, opacity };
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 50%, ${toneEffects.glowColor}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')} 0%, #1a1a2e 70%)`,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 50,
        transform: `scale(${exitScale})`,
        opacity: exitOpacity,
      }}
    >
      {/* Expanding background circles */}
      {circles.map((circle, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            border: `2px solid ${accentColor}`,
            transform: `scale(${circle.scale})`,
            opacity: circle.opacity,
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((particle, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            backgroundColor: accentColor,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px ${accentColor}`,
          }}
        />
      ))}

      {/* Emoji with entrance and continuous animation */}
      <div
        style={{
          fontSize: 160,
          transform: `scale(${emojiScale * emojiPulse}) rotate(${emojiRotate}deg) translateY(${emojiFloat}px)`,
          filter: `drop-shadow(0 0 30px ${accentColor}88)`,
        }}
      >
        {emoji}
      </div>

      {/* Headline with word-by-word highlight */}
      <h1
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: 'white',
          textAlign: 'center',
          maxWidth: 1400,
          lineHeight: 1.3,
          padding: '0 60px',
        }}
      >
        {highlightedWords.map((wordData, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: '0.3em',
              color: wordData.isHighlighted ? accentColor : 'white',
              textShadow: wordData.isHighlighted
                ? `0 0 40px ${accentColor}aa, 0 0 80px ${accentColor}66`
                : 'none',
              opacity: wordData.opacity,
              transform: wordData.isHighlighted ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.1s ease-out',
            }}
          >
            {wordData.word}
          </span>
        ))}
      </h1>

      {/* Decorative accent line below headline */}
      <div
        style={{
          width: interpolate(frame, [words.length * 8 + 20, words.length * 8 + 50], [0, 150], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          height: 4,
          backgroundColor: accentColor,
          borderRadius: 2,
          marginTop: 20,
          opacity: 0.7,
        }}
      />
    </AbsoluteFill>
  );
};
