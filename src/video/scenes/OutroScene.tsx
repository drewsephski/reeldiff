import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { springs } from '../animations';

interface OutroSceneProps {
  repoName: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  accentColor: string;
}

export const OutroScene: React.FC<OutroSceneProps> = ({
  repoName,
  filesChanged,
  additions,
  deletions,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Container entrance
  const containerSpring = spring({ frame, fps, config: springs.smooth });
  const containerY = interpolate(containerSpring, [0, 1], [50, 0]);
  const containerOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Celebration particles burst
  const particleCount = 30;
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const particleDelay = 10 + (i % 5) * 3;
    const particleSpring = spring({
      frame: frame - particleDelay,
      fps,
      config: springs.snappy,
    });

    // Deterministic pseudo-random based on index for consistent renders
    const pseudoRandom1 = ((i * 997) % 1000) / 1000; // Prime-based distribution
    const pseudoRandom2 = ((i * 773) % 1000) / 1000;
    const angle = (i / particleCount) * Math.PI * 2 + pseudoRandom1 * 0.5;
    const distance = 150 + pseudoRandom2 * 200;

    const startX = Math.cos(angle) * 50;
    const startY = Math.sin(angle) * 50;
    const endX = Math.cos(angle) * distance;
    const endY = Math.sin(angle) * distance;

    const x = interpolate(particleSpring, [0, 1], [startX, endX]);
    const y = interpolate(particleSpring, [0, 1], [startY, endY]);
    const scale = interpolate(particleSpring, [0, 0.5, 1], [0, 1, 0]);
    const opacity = interpolate(particleSpring, [0, 0.3, 1], [0, 1, 0]);

    const colors = [accentColor, '#4ade80', '#f87171', '#fbbf24', '#60a5fa'];
    const color = colors[i % colors.length];

    return { x, y, scale, opacity, color, size: 6 + (i % 4) * 2 };
  });

  // Staggered stat box reveals
  const statConfigs = [
    { label: 'Files', value: filesChanged, color: '#888', delay: 10 },
    { label: 'Additions', value: additions, color: '#4ade80', delay: 20, prefix: '+' },
    { label: 'Deletions', value: deletions, color: '#f87171', delay: 30, prefix: '-' },
  ];

  // Animated counters with easing
  const getAnimatedValue = (target: number, startFrame: number, duration: number = 35) => {
    const rawProgress = interpolate(
      frame,
      [startFrame, startFrame + duration],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    // Apply easing for smoother counter animation
    const easedProgress = Easing.out(Easing.cubic)(rawProgress);
    return Math.round(easedProgress * target);
  };

  // Exit animation
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.9], {
    easing: Easing.in(Easing.quad),
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // Success text animation
  const successSpring = spring({ frame: frame - 50, fps, config: springs.bouncy });
  const successScale = interpolate(successSpring, [0, 1], [0, 1]);
  const successY = interpolate(successSpring, [0, 1], [30, 0]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #1a1a2e 0%, ${accentColor}15 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 40,
        transform: `scale(${exitScale})`,
        opacity: exitOpacity,
      }}
    >
      {/* Celebration particles */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {particles.map((particle, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: particle.size,
              height: particle.size,
              borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '20%' : '50% 0',
              backgroundColor: particle.color,
              transform: `translate(${particle.x}px, ${particle.y}px) scale(${particle.scale}) rotate(${i * 15}deg)`,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size}px ${particle.color}`,
            }}
          />
        ))}
      </div>

      {/* Stats container */}
      <div
        style={{
          display: 'flex',
          gap: 60,
          transform: `translateY(${containerY}px)`,
          opacity: containerOpacity,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {statConfigs.map((stat, i) => {
          const statSpring = spring({
            frame: frame - stat.delay,
            fps,
            config: springs.snappy,
          });
          const statScale = interpolate(statSpring, [0, 1], [0.8, 1]);
          const statY = interpolate(statSpring, [0, 1], [40, 0]);
          const statOpacity = interpolate(
            frame,
            [stat.delay, stat.delay + 12],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const animatedValue = getAnimatedValue(stat.value, stat.delay);

          return (
            <div
              key={i}
              style={{
                textAlign: 'center',
                transform: `scale(${statScale}) translateY(${statY}px)`,
                opacity: statOpacity,
              }}
            >
              <div
                style={{
                  fontSize: 80,
                  fontWeight: 800,
                  color: stat.color,
                  fontVariantNumeric: 'tabular-nums',
                  textShadow: `0 0 30px ${stat.color}44`,
                }}
              >
                {stat.prefix || ''}{animatedValue.toLocaleString()}
              </div>
              <div style={{ fontSize: 24, color: '#888', marginTop: 12, fontWeight: 500 }}>
                {stat.label}
              </div>
              {/* Underline accent */}
              <div
                style={{
                  width: interpolate(frame, [stat.delay + 20, stat.delay + 40], [0, 60], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }),
                  height: 3,
                  backgroundColor: stat.color,
                  borderRadius: 2,
                  margin: '12px auto 0',
                  opacity: 0.5,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Success message */}
      <div
        style={{
          transform: `scale(${successScale}) translateY(${successY}px)`,
          opacity: interpolate(frame, [50, 65], [0, 1], { extrapolateRight: 'clamp' }),
          marginTop: 20,
        }}
      >
        <span
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: accentColor,
            textShadow: `0 0 20px ${accentColor}66`,
          }}
        >
          ✓ Merged Successfully
        </span>
      </div>

      {/* Repo name with glow effect */}
      <div
        style={{
          transform: `translateY(${containerY * 0.5}px)`,
          opacity: containerOpacity,
        }}
      >
        <span
          style={{
            fontSize: 28,
            color: '#666',
            fontWeight: 500,
          }}
        >
          {repoName}
        </span>
      </div>

      {/* Bottom decorative rings */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          display: 'flex',
          gap: 20,
          opacity: interpolate(frame, [40, 60], [0, 0.3], { extrapolateRight: 'clamp' }),
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: accentColor,
              transform: `scale(${Math.sin(frame * 0.1 + i) * 0.3 + 0.7})`,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
