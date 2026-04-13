import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { springs, useTypewriter } from '../animations';

interface LayoutProps {
  text: string;
  accentColor: string;
}

export const LayoutC: React.FC<LayoutProps> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Container entrance
  const containerSpring = spring({ frame, fps, config: springs.smooth });
  const containerY = interpolate(containerSpring, [0, 1], [60, 0]);
  const containerOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Typewriter effect for text
  const { text: revealedText, isComplete } = useTypewriter(text, 10, 15);

  // Underline animation - starts after text is revealed
  const underlineSpring = spring({
    frame: frame - (10 + text.length * 1.5),
    fps,
    config: springs.snappy,
  });
  const underlineWidth = isComplete
    ? interpolate(underlineSpring, [0, 1], [0, 100])
    : 0;

  // Blinking cursor
  const cursorBlink = Math.floor(frame / 10) % 2 === 0 ? 1 : 0;

  // Floating decorative dots
  const dots = Array.from({ length: 3 }, (_, i) => {
    const dotSpring = spring({ frame: frame - i * 8, fps, config: springs.gentle });
    const dotY = Math.sin((frame + i * 30) * 0.08) * 15;
    const dotX = interpolate(dotSpring, [0, 1], [-100 + i * 50, 0]);
    const dotOpacity = interpolate(frame, [i * 8, 15 + i * 8], [0, 0.8], {
      extrapolateRight: 'clamp',
    });
    return { x: dotX, y: dotY, opacity: dotOpacity };
  });

  // Exit animation
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitY = interpolate(exitProgress, [0, 1], [0, 80], {
    easing: Easing.in(Easing.quad),
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        transform: `translateY(${containerY + exitY}px)`,
        opacity: containerOpacity * exitOpacity,
        position: 'relative',
        padding: '40px 80px',
      }}
    >
      {/* Floating decorative dots */}
      {dots.map((dot, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 8 + i * 4,
            height: 8 + i * 4,
            borderRadius: '50%',
            backgroundColor: accentColor,
            left: `${20 + i * 30}%`,
            top: `${30 + (i % 2) * 40}%`,
            transform: `translate(${dot.x}px, ${dot.y}px)`,
            opacity: dot.opacity,
            boxShadow: `0 0 ${12 + i * 4}px ${accentColor}66`,
          }}
        />
      ))}

      {/* Text with typewriter effect */}
      <div style={{ position: 'relative' }}>
        <span
          style={{
            fontSize: 54,
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.4,
          }}
        >
          {revealedText}
          <span
            style={{
              display: 'inline-block',
              width: 4,
              height: '1.2em',
              backgroundColor: accentColor,
              marginLeft: 4,
              opacity: cursorBlink,
              verticalAlign: 'middle',
            }}
          />
        </span>
      </div>

      {/* Animated underline with glow */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 500 }}>
        <div
          style={{
            height: 6,
            width: `${underlineWidth}%`,
            background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
            borderRadius: 3,
            margin: '0 auto',
            boxShadow: `0 0 20px ${accentColor}66`,
          }}
        />
        {/* Glow trail */}
        <div
          style={{
            position: 'absolute',
            top: -4,
            left: `${underlineWidth - 5}%`,
            width: 20,
            height: 14,
            backgroundColor: accentColor,
            borderRadius: 7,
            opacity: underlineWidth > 5 ? 0.6 : 0,
            filter: 'blur(8px)',
            transition: 'opacity 0.1s',
          }}
        />
      </div>
    </div>
  );
};
