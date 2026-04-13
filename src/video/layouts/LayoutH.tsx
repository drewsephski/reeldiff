import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { springs } from '../animations';
import { typography, colors, spacing, radius } from '../designSystem';

interface LayoutProps {
  text: string;
  accentColor: string;
}

// Minimalist code-comment style layout
export const LayoutH: React.FC<LayoutProps> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Line numbers
  const lineCount = 4;

  // Container entrance
  const containerSpring = spring({ frame, fps, config: springs.smooth });
  const containerX = interpolate(containerSpring, [0, 1], [60, 0]);
  const containerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Comment symbol animation
  const commentSpring = spring({ frame: frame - 5, fps, config: springs.bouncy });
  const commentScale = interpolate(commentSpring, [0, 1], [0, 1]);
  const commentRotate = interpolate(commentSpring, [0, 1], [90, 0]);

  // Text typing effect
  const words = text.split(' ');

  // Exit
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitX = interpolate(exitProgress, [0, 1], [0, 80], {
    easing: Easing.in(Easing.quad),
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // Blinking cursor
  const cursorBlink = Math.floor(frame / 8) % 2 === 0 ? 1 : 0;
  const showCursor = frame > 15 + words.length * 4;

  return (
    <div
      style={{
        display: 'flex',
        gap: spacing.lg,
        maxWidth: 1000,
        backgroundColor: `${colors.bg.secondary}80`,
        borderRadius: radius.lg,
        padding: `${spacing.lg}px ${spacing.xl}px`,
        border: `1px solid ${accentColor}20`,
        transform: `translateX(${containerX + exitX}px)`,
        opacity: containerOpacity * exitOpacity,
        boxShadow: `0 16px 48px ${colors.bg.primary}`,
      }}
    >
      {/* Line numbers gutter */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.sm,
          paddingRight: spacing.md,
          borderRight: `1px solid ${colors.text.muted}30`,
        }}
      >
        {Array.from({ length: lineCount }, (_, i) => {
          const lineOpacity = interpolate(frame, [5 + i * 3, 15 + i * 3], [0, 0.4], {
            extrapolateRight: 'clamp',
          });

          return (
            <span
              key={i}
              style={{
                fontSize: typography.body.sm,
                fontWeight: typography.weight.regular,
                color: colors.text.muted,
                fontFamily: 'monospace',
                opacity: lineOpacity,
                textAlign: 'right',
                width: 30,
              }}
            >
              {i + 1}
            </span>
          );
        })}
      </div>

      {/* Code content area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          gap: spacing.md,
          paddingTop: spacing.sm,
        }}
      >
        {/* Comment symbol */}
        <div
          style={{
            fontSize: typography.body.lg,
            fontWeight: typography.weight.bold,
            color: accentColor,
            transform: `scale(${commentScale}) rotate(${commentRotate}deg)`,
            fontFamily: 'monospace',
          }}
        >
          //
        </div>

        {/* Text content */}
        <div
          style={{
            fontSize: typography.body.lg,
            fontWeight: typography.weight.medium,
            color: colors.text.secondary,
            lineHeight: typography.leading.relaxed,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {words.map((word, i) => {
            const wordDelay = 15 + i * 4;
            const wordOpacity = interpolate(
              frame,
              [wordDelay, wordDelay + 8],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            // Highlight special keywords
            const isHighlight = ['new', 'fix', 'add', 'update', 'improve', 'feature'].some(
              kw => word.toLowerCase().includes(kw)
            );

            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  marginRight: '0.3em',
                  color: isHighlight ? accentColor : colors.text.secondary,
                  fontWeight: isHighlight ? typography.weight.semibold : typography.weight.medium,
                  opacity: wordOpacity,
                }}
              >
                {word}
              </span>
            );
          })}

          {/* Blinking cursor */}
          {showCursor && (
            <span
              style={{
                display: 'inline-block',
                width: 3,
                height: '1.3em',
                backgroundColor: accentColor,
                marginLeft: 4,
                opacity: cursorBlink,
                verticalAlign: 'middle',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
