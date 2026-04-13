import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { springs } from '../animations';
import { typography, colors, spacing, radius } from '../designSystem';

interface LayoutProps {
  text: string;
  accentColor: string;
}

// Quote-style layout with large decorative quote marks
export const LayoutG: React.FC<LayoutProps> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Quote mark animations
  const openQuoteSpring = spring({ frame, fps, config: springs.bouncy });
  const openQuoteScale = interpolate(openQuoteSpring, [0, 1], [0, 1]);
  const openQuoteY = interpolate(openQuoteSpring, [0, 1], [40, 0]);

  const closeQuoteSpring = spring({ frame: frame - (text.length * 2), fps, config: springs.bouncy });
  const closeQuoteScale = interpolate(closeQuoteSpring, [0, 1], [0, 1]);
  const closeQuoteY = interpolate(closeQuoteSpring, [0, 1], [-40, 0]);

  // Text reveal
  const textOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Words stagger for subtle effect
  const words = text.split(' ');

  // Exit
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.95], {
    easing: Easing.in(Easing.quad),
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 1000,
        padding: `0 ${spacing.xl}px`,
        transform: `scale(${exitScale})`,
        opacity: exitOpacity,
      }}
    >
      {/* Opening quote */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          left: 0,
          fontSize: 180,
          fontWeight: typography.weight.black,
          color: accentColor,
          opacity: 0.25,
          lineHeight: 1,
          transform: `scale(${openQuoteScale}) translateY(${openQuoteY}px)`,
          fontFamily: 'Georgia, serif',
        }}
      >
        "
      </div>

      {/* Text content with staggered words */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: `${spacing.xl}px ${spacing['2xl']}px`,
          fontSize: typography.body.xl,
          fontWeight: typography.weight.medium,
          color: colors.text.primary,
          lineHeight: typography.leading.relaxed,
          textAlign: 'center',
          opacity: textOpacity,
        }}
      >
        {words.map((word, i) => {
          const wordDelay = 15 + i * 4;
          const wordSpring = spring({
            frame: frame - wordDelay,
            fps,
            config: springs.gentle,
          });
          const wordY = interpolate(wordSpring, [0, 1], [20, 0]);
          const wordOpacity = interpolate(
            frame,
            [wordDelay, wordDelay + 10],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.25em',
                opacity: wordOpacity,
                transform: `translateY(${wordY}px)`,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Closing quote */}
      <div
        style={{
          position: 'absolute',
          bottom: -60,
          right: 20,
          fontSize: 180,
          fontWeight: typography.weight.black,
          color: accentColor,
          opacity: 0.25,
          lineHeight: 1,
          transform: `scale(${closeQuoteScale}) translateY(${closeQuoteY}px)`,
          fontFamily: 'Georgia, serif',
        }}
      >
        "
      </div>

      {/* Decorative line below */}
      <div
        style={{
          width: interpolate(frame, [50, 80], [0, 200], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          height: 2,
          backgroundColor: accentColor,
          margin: `${spacing.lg}px auto 0`,
          opacity: 0.5,
          borderRadius: radius.full,
        }}
      />
    </div>
  );
};
