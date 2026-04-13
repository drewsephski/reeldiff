import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { springs } from '../animations';
import { typography, colors, spacing } from '../designSystem';

interface LayoutProps {
  text: string;
  accentColor: string;
}

// Split layout with colored left bar and animated text
export const LayoutF: React.FC<LayoutProps> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Container entrance
  const containerSpring = spring({ frame, fps, config: springs.smooth });
  const containerX = interpolate(containerSpring, [0, 1], [-100, 0]);
  const containerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Left bar animation
  const barSpring = spring({ frame: frame - 5, fps, config: springs.snappy });
  const barHeight = interpolate(barSpring, [0, 1], [0, 100]);

  // Words stagger
  const words = text.split(' ');

  // Exit
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitX = interpolate(exitProgress, [0, 1], [0, -120], {
    easing: Easing.in(Easing.quad),
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.xl,
        maxWidth: 1100,
        transform: `translateX(${containerX + exitX}px)`,
        opacity: containerOpacity * exitOpacity,
        padding: `0 ${spacing.xl}px`,
      }}
    >
      {/* Animated left bar */}
      <div
        style={{
          position: 'relative',
          width: 8,
          height: 200,
          backgroundColor: `${accentColor}20`,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${barHeight}%`,
            backgroundColor: accentColor,
            borderRadius: 4,
          }}
        />
      </div>

      {/* Text content */}
      <div
        style={{
          flex: 1,
          fontSize: typography.body.xl,
          fontWeight: typography.weight.medium,
          color: colors.text.primary,
          lineHeight: typography.leading.normal,
          letterSpacing: typography.tracking.tight,
        }}
      >
        {words.map((word, i) => {
          const wordDelay = 18 + i * 4;
          const wordSpring = spring({
            frame: frame - wordDelay,
            fps,
            config: springs.snappy,
          });
          const wordX = interpolate(wordSpring, [0, 1], [30, 0]);
          const wordOpacity = interpolate(
            frame,
            [wordDelay, wordDelay + 10],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          // Highlight key words (first word and any word with capitals)
          const isKeyWord = i === 0 || /[A-Z]/.test(word);

          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.25em',
                fontWeight: isKeyWord ? typography.weight.bold : typography.weight.medium,
                color: isKeyWord ? accentColor : colors.text.primary,
                opacity: wordOpacity,
                transform: `translateX(${wordX}px)`,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Decorative accent */}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: `2px solid ${accentColor}40`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: interpolate(frame, [35, 50], [0, 0.6], {
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: accentColor,
          }}
        />
      </div>
    </div>
  );
};
