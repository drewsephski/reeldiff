import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { springs } from '../animations';

interface LayoutProps {
  text: string;
  accentColor: string;
}

export const LayoutB: React.FC<LayoutProps> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Main container scale with bouncy entrance
  const containerSpring = spring({ frame, fps, config: springs.bouncy });
  const containerScale = interpolate(containerSpring, [0, 1], [0.3, 1]);

  // Background glow pulse
  const glowSpring = spring({ frame: frame - 5, fps, config: springs.gentle });
  const glowScale = interpolate(glowSpring, [0, 1], [0.8, 1.3]);
  const glowOpacity = interpolate(frame, [5, 30], [0, 0.4], {
    extrapolateRight: 'clamp',
  });

  // Continuous pulse effect
  const pulseScale = Math.sin(frame * 0.1) * 0.02 + 1;

  // Split text into words for staggered reveal
  const words = text.split(' ');

  // Exit animation
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.8], {
    easing: Easing.in(Easing.quad),
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // Decorative corner accents
  const cornerOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        textAlign: 'center',
        position: 'relative',
        transform: `scale(${containerScale * pulseScale * exitScale})`,
        opacity: exitOpacity,
        padding: '60px 80px',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          inset: -40,
          background: `radial-gradient(circle, ${accentColor}${Math.floor(glowOpacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          transform: `scale(${glowScale})`,
          borderRadius: '50%',
        }}
      />

      {/* Corner accents */}
      {[
        { top: -20, left: -20, rotate: 0 },
        { top: -20, right: -20, rotate: 90 },
        { bottom: -20, right: -20, rotate: 180 },
        { bottom: -20, left: -20, rotate: 270 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 30,
            height: 30,
            borderTop: `4px solid ${accentColor}`,
            borderLeft: `4px solid ${accentColor}`,
            top: pos.top,
            left: pos.left,
            right: pos.right,
            bottom: pos.bottom,
            opacity: cornerOpacity,
            transform: `rotate(${pos.rotate}deg)`,
          }}
        />
      ))}

      {/* Text with staggered word reveal */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {words.map((word, i) => {
          const wordSpring = spring({
            frame: frame - (10 + i * 5),
            fps,
            config: springs.snappy,
          });
          const wordScale = interpolate(wordSpring, [0, 1], [0.5, 1]);
          const wordOpacity = interpolate(
            frame,
            [10 + i * 5, 18 + i * 5],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                fontSize: 56,
                fontWeight: 700,
                color: 'white',
                marginRight: '0.25em',
                textShadow: `0 0 40px ${accentColor}66`,
                transform: `scale(${wordScale})`,
                opacity: wordOpacity,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          width: interpolate(frame, [words.length * 5 + 15, words.length * 5 + 40], [0, 120], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          height: 3,
          backgroundColor: accentColor,
          borderRadius: 2,
          opacity: 0.6,
        }}
      />
    </div>
  );
};
