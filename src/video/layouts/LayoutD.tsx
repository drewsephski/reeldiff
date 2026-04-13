import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { springs } from '../animations';

interface LayoutProps {
  text: string;
  accentColor: string;
}

export const LayoutD: React.FC<LayoutProps> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();

  // Multi-layer clip-path reveals
  const baseSpring = spring({ frame, fps, config: springs.smooth });
  const accentClip = interpolate(baseSpring, [0, 1], [0, 60]);

  const secondarySpring = spring({ frame: frame - 8, fps, config: springs.gentle });
  const secondaryClip = interpolate(secondarySpring, [0, 1], [0, 40]);

  // Text entrance with wave effect
  const words = text.split(' ');

  // Floating diagonal lines decoration
  const lines = Array.from({ length: 4 }, (_, i) => {
    const lineSpring = spring({ frame: frame - i * 6, fps, config: springs.smooth });
    const lineX = interpolate(lineSpring, [0, 1], [width, 0]);
    const lineOpacity = interpolate(frame, [i * 6, 20 + i * 6], [0, 0.5], {
      extrapolateRight: 'clamp',
    });
    return { x: lineX, opacity: lineOpacity };
  });

  // Exit animation
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitClip = interpolate(exitProgress, [0, 1], [60, 100]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Background layers with clip-path reveals */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: accentColor,
          clipPath: `inset(0 ${100 - accentClip + exitClip}% 0 0)`,
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: `${accentColor}66`,
          clipPath: `inset(0 ${100 - secondaryClip + exitClip}% 0 0)`,
          opacity: 0.5,
        }}
      />

      {/* Floating diagonal lines */}
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 3,
            height: 200 + i * 50,
            backgroundColor: accentColor,
            right: 50 + i * 80,
            top: 20 + (i % 2) * 30,
            transform: `rotate(25deg) translateX(${line.x}px)`,
            opacity: line.opacity,
            borderRadius: 2,
          }}
        />
      ))}

      {/* Text with staggered word reveal */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          maxWidth: '80%',
          margin: '0 auto',
          left: 0,
          right: 0,
        }}
      >
        {words.map((word, i) => {
          const wordSpring = spring({
            frame: frame - (15 + i * 6),
            fps,
            config: springs.snappy,
          });
          const wordY = interpolate(wordSpring, [0, 1], [30, 0], {
            extrapolateLeft: 'clamp',
          });
          const wordOpacity = interpolate(
            frame,
            [15 + i * 6, 25 + i * 6],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const wordRotate = interpolate(wordSpring, [0, 1], [10, 0]);

          return (
            <span
              key={i}
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: 'white',
                mixBlendMode: 'difference',
                marginRight: '0.3em',
                transform: `translateY(${wordY}px) rotate(${wordRotate}deg)`,
                opacity: wordOpacity,
                textShadow: '0 2px 20px rgba(0,0,0,0.3)',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Animated accent shape */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: interpolate(frame, [30, 60], [0, 100], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          width: 80,
          height: 80,
          backgroundColor: accentColor,
          borderRadius: '50%',
          opacity: 0.3,
          transform: `scale(${Math.sin(frame * 0.1) * 0.2 + 0.8})`,
        }}
      />
    </div>
  );
};
