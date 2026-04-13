import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { springs } from '../animations';

interface LayoutProps {
  text: string;
  accentColor: string;
}

export const LayoutA: React.FC<LayoutProps> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Staggered icon animation
  const iconSpring = spring({ frame, fps, config: springs.bouncy });
  const iconScale = interpolate(iconSpring, [0, 1], [0, 1]);
  const iconRotate = interpolate(iconSpring, [0, 1], [-180, 0]);

  // Text slides in after icon
  const textSpring = spring({ frame: frame - 10, fps, config: springs.smooth });
  const textX = interpolate(textSpring, [0, 1], [100, 0]);

  // Continuous subtle float for the whole layout
  const floatY = Math.sin(frame * 0.1) * 4;

  // Decorative ring animation around icon
  const ringSpring = spring({ frame: frame - 5, fps, config: springs.gentle });
  const ringScale = interpolate(ringSpring, [0, 1], [0.8, 1.2]);
  const ringOpacity = interpolate(frame, [5, 25], [0.8, 0], { extrapolateRight: 'clamp' });

  // Exit animation
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitX = interpolate(exitProgress, [0, 1], [0, 200], {
    easing: Easing.in(Easing.quad),
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // Split text for word-by-word fade in
  const words = text.split(' ');

  // Background glow effect
  const glowIntensity = 0.15 + Math.sin(frame * 0.08) * 0.05;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 40,
        transform: `translateX(${exitX}px) translateY(${floatY}px)`,
        opacity: exitOpacity,
        padding: '60px 80px',
        position: 'relative',
      }}
    >
      {/* Ambient glow behind content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 20% 50%, ${accentColor}${Math.floor(glowIntensity * 100).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          zIndex: -1,
        }}
      />

      {/* Icon container with ring effect */}
      <div style={{ position: 'relative' }}>
        {/* Expanding ring */}
        <div
          style={{
            position: 'absolute',
            inset: -10,
            borderRadius: 28,
            border: `3px solid ${accentColor}`,
            transform: `scale(${ringScale})`,
            opacity: ringOpacity,
          }}
        />
        {/* Main icon with glow */}
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: 22,
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 44,
            transform: `scale(${iconScale}) rotate(${iconRotate}deg)`,
            boxShadow: `0 8px 32px ${accentColor}60, 0 0 60px ${accentColor}40, 0 0 0 4px ${accentColor}30`,
          }}
        >
          ✦
        </div>
      </div>

      {/* Text with word-by-word reveal */}
      <div
        style={{
          transform: `translateX(${textX}px)`,
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
          const wordY = interpolate(
            frame,
            [wordDelay, wordDelay + 10],
            [15, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }
          );

          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                fontSize: 48,
                fontWeight: 600,
                color: 'white',
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
    </div>
  );
};
