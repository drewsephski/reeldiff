import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { springs } from '../animations';
import { typography, colors, spacing, radius } from '../designSystem';

interface LayoutProps {
  text: string;
  accentColor: string;
}

// Card-style layout with number badge
export const LayoutE: React.FC<LayoutProps> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Card entrance
  const cardSpring = spring({ frame, fps, config: springs.smooth });
  const cardY = interpolate(cardSpring, [0, 1], [80, 0]);
  const cardScale = interpolate(cardSpring, [0, 1], [0.9, 1]);
  const cardOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Number badge
  const badgeSpring = spring({ frame: frame - 8, fps, config: springs.bouncy });
  const badgeScale = interpolate(badgeSpring, [0, 1], [0, 1]);
  const badgeRotate = interpolate(badgeSpring, [0, 1], [-180, 0]);

  // Word reveal for text
  const words = text.split(' ');

  // Exit animation
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitX = interpolate(exitProgress, [0, 1], [0, 100], {
    easing: Easing.in(Easing.quad),
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 1000,
        transform: `translateY(${cardY}px) translateX(${exitX}px) scale(${cardScale})`,
        opacity: cardOpacity * exitOpacity,
      }}
    >
      {/* Number badge */}
      <div
        style={{
          position: 'absolute',
          top: -30,
          left: 40,
          width: 60,
          height: 60,
          borderRadius: radius.xl,
          backgroundColor: accentColor,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${badgeScale}) rotate(${badgeRotate}deg)`,
          boxShadow: `0 8px 32px ${accentColor}50`,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: typography.weight.black,
            color: colors.bg.primary,
          }}
        >
          ✦
        </span>
      </div>

      {/* Main card */}
      <div
        style={{
          backgroundColor: colors.bg.secondary,
          border: `1px solid ${accentColor}30`,
          borderRadius: radius['2xl'],
          padding: `${spacing.xl}px ${spacing['2xl']}px`,
          paddingTop: spacing.xl + 20,
          boxShadow: `0 24px 80px ${accentColor}15, inset 0 1px 0 ${colors.text.primary}10`,
        }}
      >
        {/* Text content */}
        <div
          style={{
            fontSize: typography.body.xl,
            fontWeight: typography.weight.medium,
            color: colors.text.primary,
            lineHeight: typography.leading.relaxed,
            letterSpacing: typography.tracking.normal,
          }}
        >
          {words.map((word, i) => {
            const wordDelay = 15 + i * 5;
            const wordOpacity = interpolate(
              frame,
              [wordDelay, wordDelay + 10],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            const wordY = interpolate(
              frame,
              [wordDelay, wordDelay + 12],
              [15, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }
            );

            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  marginRight: '0.3em',
                  opacity: wordOpacity,
                  transform: `translateY(${wordY}px)`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
