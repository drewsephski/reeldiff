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
import { typography, colors, spacing, radius } from '../designSystem';

interface IntroSceneProps {
  repoName: string;
  prNumber: number;
  author: string;
  ownerAvatar: string;
  accentColor: string;
}

// Subtle dot grid background pattern
const DotGrid: React.FC<{ color: string }> = ({ color }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: `radial-gradient(circle, ${color}15 1.5px, transparent 1.5px)`,
      backgroundSize: '48px 48px',
      opacity: 0.6,
    }}
  />
);

// Geometric accent shapes
const GeometricShapes: React.FC<{ frame: number; fps: number; accentColor: string }> = ({
  frame,
  fps,
  accentColor,
}) => {
  const shapes = [
    { size: 300, delay: 0, x: '5%', y: '10%', rotation: 45 },
    { size: 200, delay: 10, x: '85%', y: '70%', rotation: -30 },
    { size: 150, delay: 20, x: '75%', y: '15%', rotation: 60 },
  ];

  return (
    <>
      {shapes.map((shape, i) => {
        const shapeSpring = spring({
          frame: frame - shape.delay,
          fps,
          config: springs.gentle,
        });
        const scale = interpolate(shapeSpring, [0, 1], [0.8, 1]);
        const opacity = interpolate(frame, [shape.delay, shape.delay + 25], [0, 0.08], {
          extrapolateRight: 'clamp',
        });
        const rotation = shape.rotation + frame * 0.1;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: shape.x,
              top: shape.y,
              width: shape.size,
              height: shape.size,
              border: `2px solid ${accentColor}`,
              transform: `rotate(${rotation}deg) scale(${scale})`,
              opacity,
              borderRadius: i % 2 === 0 ? radius.lg : radius.none,
            }}
          />
        );
      })}
    </>
  );
};

// Animated corner brackets
const CornerBrackets: React.FC<{ frame: number; accentColor: string }> = ({
  frame,
  accentColor,
}) => {
  const corners = [
    { top: 40, left: 40, rotate: 0 },
    { top: 40, right: 40, rotate: 90 },
    { bottom: 40, right: 40, rotate: 180 },
    { bottom: 40, left: 40, rotate: 270 },
  ];

  return (
    <>
      {corners.map((corner, i) => {
        const cornerOpacity = interpolate(frame, [15 + i * 3, 30 + i * 3], [0, 0.4], {
          extrapolateRight: 'clamp',
        });

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 40,
              height: 40,
              borderTop: `3px solid ${accentColor}`,
              borderLeft: `3px solid ${accentColor}`,
              top: corner.top,
              left: corner.left,
              right: corner.right,
              bottom: corner.bottom,
              opacity: cornerOpacity,
              transform: `rotate(${corner.rotate}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

export const IntroScene: React.FC<IntroSceneProps> = ({
  repoName,
  prNumber,
  author,
  ownerAvatar,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Main title - dramatic entrance
  const titleSpring = spring({ frame, fps, config: springs.snappy });
  const titleY = interpolate(titleSpring, [0, 1], [100, 0], {
    extrapolateLeft: 'clamp',
  });
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // PR number - secondary element with bounce
  const prSpring = spring({ frame: frame - 12, fps, config: springs.bouncy });
  const prScale = interpolate(prSpring, [0, 1], [0.6, 1]);
  const prOpacity = interpolate(frame, [12, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Author section - elegant reveal
  const authorSpring = spring({ frame: frame - 25, fps, config: springs.smooth });
  const authorX = interpolate(authorSpring, [0, 1], [-60, 0], {
    extrapolateLeft: 'clamp',
  });
  const authorOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Avatar with subtle rotation on entrance
  const avatarSpring = spring({ frame: frame - 30, fps, config: springs.snappy });
  const avatarScale = interpolate(avatarSpring, [0, 1], [0, 1]);
  const avatarRotate = interpolate(avatarSpring, [0, 1], [-90, 0]);

  // Subtle floating animation (applied to container)
  const floatY = Math.sin(frame * 0.06) * 4;

  // Exit animation
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 25, durationInFrames - 5],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitY = interpolate(exitProgress, [0, 1], [0, -80], {
    easing: Easing.out(Easing.quad),
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg.primary,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background layers */}
      <DotGrid color={accentColor} />

      {/* Warm gradient vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 30% 20%, ${accentColor}10 0%, transparent 50%),
                       radial-gradient(ellipse at 70% 80%, ${accentColor}08 0%, transparent 50%)`,
        }}
      />

      {/* Geometric decorative shapes */}
      <GeometricShapes frame={frame} fps={fps} accentColor={accentColor} />

      {/* Corner brackets */}
      <CornerBrackets frame={frame} accentColor={accentColor} />

      {/* Main content container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing.xl,
          transform: `translateY(${floatY + exitY}px)`,
          opacity: exitOpacity,
          zIndex: 10,
        }}
      >
        {/* Repository name with PR number */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: spacing.md,
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
          }}
        >
          <span
            style={{
              fontSize: typography.display.lg,
              fontWeight: typography.weight.black,
              color: colors.text.primary,
              letterSpacing: typography.tracking.tight,
              lineHeight: typography.leading.tight,
            }}
          >
            {repoName}
          </span>
          <span
            style={{
              fontSize: typography.display.md,
              fontWeight: typography.weight.bold,
              color: accentColor,
              opacity: prOpacity,
              transform: `scale(${prScale})`,
              letterSpacing: typography.tracking.wide,
            }}
          >
            #{prNumber}
          </span>
        </div>

        {/* Author section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            transform: `translateX(${authorX}px)`,
            opacity: authorOpacity,
          }}
        >
          {/* Avatar with ring effect */}
          <div
            style={{
              position: 'relative',
              transform: `scale(${avatarScale}) rotate(${avatarRotate}deg)`,
            }}
          >
            {/* Outer ring */}
            <div
              style={{
                position: 'absolute',
                inset: -6,
                borderRadius: '50%',
                border: `2px solid ${accentColor}60`,
                transform: `scale(${1 + Math.sin(frame * 0.08) * 0.05})`,
              }}
            />
            <Img
              src={ownerAvatar}
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                border: `3px solid ${accentColor}`,
                boxShadow: `0 8px 32px ${accentColor}40`,
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                fontSize: typography.body.lg,
                fontWeight: typography.weight.medium,
                color: colors.text.secondary,
                letterSpacing: typography.tracking.wide,
              }}
            >
              PULL REQUEST BY
            </span>
            <span
              style={{
                fontSize: typography.body.xl,
                fontWeight: typography.weight.semibold,
                color: colors.text.primary,
              }}
            >
              @{author}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom progress indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: spacing.xl,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: spacing.sm,
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const isActive = i === 0;
          const dotOpacity = interpolate(frame, [40 + i * 5, 50 + i * 5], [0, isActive ? 1 : 0.4], {
            extrapolateRight: 'clamp',
          });

          return (
            <div
              key={i}
              style={{
                width: isActive ? 32 : 8,
                height: 8,
                borderRadius: radius.full,
                backgroundColor: isActive ? accentColor : colors.text.muted,
                opacity: dotOpacity,
                transition: 'width 0.3s ease',
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
