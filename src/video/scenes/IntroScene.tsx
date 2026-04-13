import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  Easing,
} from 'remotion';
import { springs } from '../animations';

interface IntroSceneProps {
  repoName: string;
  prNumber: number;
  author: string;
  authorAvatar: string;
  accentColor: string;
}

export const IntroScene: React.FC<IntroSceneProps> = ({
  repoName,
  prNumber,
  author,
  authorAvatar,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Staggered entrance animations
  const repoNameSpring = spring({ frame, fps, config: springs.snappy });
  const repoNameY = interpolate(repoNameSpring, [0, 1], [80, 0]);
  const repoNameOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // PR number bounces in with delay
  const prSpring = spring({ frame: frame - 8, fps, config: springs.bouncy });
  const prScale = interpolate(prSpring, [0, 1], [0.5, 1]);
  const prOpacity = interpolate(frame, [8, 18], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Avatar with rotation and scale
  const avatarSpring = spring({ frame: frame - 15, fps, config: springs.smooth });
  const avatarScale = interpolate(avatarSpring, [0, 1], [0, 1]);
  const avatarRotate = interpolate(avatarSpring, [0, 1], [-180, 0]);

  // Floating animation for the whole container
  const floatY = Math.sin(frame * 0.08) * 8;

  // Decorative particles/lines
  const particleCount = 5;
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const particleSpring = spring({
      frame: frame - (20 + i * 4),
      fps,
      config: springs.gentle,
    });
    const particleX = interpolate(particleSpring, [0, 1], [-200 + i * 80, 0]);
    const particleOpacity = interpolate(
      frame,
      [20 + i * 4, 30 + i * 4],
      [0, 0.6],
      { extrapolateRight: 'clamp' }
    );
    return { x: particleX, opacity: particleOpacity, delay: 20 + i * 4 };
  });

  // Exit animation
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitY = interpolate(exitProgress, [0, 1], [0, -100], {
    easing: Easing.in(Easing.quad),
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${accentColor}22 0%, #1a1a2e 50%, ${accentColor}11 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 30,
        opacity: exitOpacity,
      }}
    >
      {/* Decorative background particles */}
      {particles.map((particle, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 4,
            height: 60 + i * 20,
            backgroundColor: accentColor,
            borderRadius: 2,
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            transform: `translateX(${particle.x}px)`,
            opacity: particle.opacity,
          }}
        />
      ))}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          transform: `translateY(${repoNameY + floatY + exitY}px)`,
          opacity: repoNameOpacity,
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: 'white',
            textShadow: `0 4px 30px ${accentColor}44`,
          }}
        >
          {repoName}
        </span>
        <span
          style={{
            fontSize: 48,
            fontWeight: 600,
            color: accentColor,
            opacity: prOpacity,
            transform: `scale(${prScale})`,
            textShadow: `0 0 20px ${accentColor}66`,
          }}
        >
          #{prNumber}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          transform: `scale(${avatarScale}) rotate(${avatarRotate}deg) translateY(${exitY}px)`,
        }}
      >
        <Img
          src={authorAvatar}
          style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            border: `4px solid ${accentColor}`,
            boxShadow: `0 0 30px ${accentColor}44`,
          }}
        />
        <span
          style={{
            fontSize: 32,
            color: '#ccc',
            fontWeight: 500,
          }}
        >
          @{author}
        </span>
      </div>

      {/* Bottom decorative line */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          width: interpolate(frame, [30, 60], [0, 200], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          height: 3,
          backgroundColor: accentColor,
          borderRadius: 2,
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};
