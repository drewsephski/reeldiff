import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { springs } from '../animations';

interface RepoOutroSceneProps {
  repoName: string;
  language: string;
  topics: string[];
  stars: number;
  accentColor: string;
}

// Language colors for visual flair
const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3776ab',
  Rust: '#dea584',
  Go: '#00add8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  Swift: '#ffac45',
  Kotlin: '#a97bff',
  PHP: '#4f5d95',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  React: '#61dafb',
};

export const RepoOutroScene: React.FC<RepoOutroSceneProps> = ({
  repoName,
  language,
  topics,
  stars,
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

    const pseudoRandom1 = ((i * 997) % 1000) / 1000;
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

    const colors = [accentColor, '#fbbf24', '#4ade80', '#f87171', '#60a5fa'];
    const color = colors[i % colors.length];

    return { x, y, scale, opacity, color, size: 6 + (i % 4) * 2 };
  });

  // Language color
  const langColor = languageColors[language] || accentColor;

  // Topic pills animation
  const topicPills = topics.slice(0, 5).map((topic, i) => {
    const topicSpring = spring({
      frame: frame - (20 + i * 8),
      fps,
      config: springs.snappy,
    });
    const topicScale = interpolate(topicSpring, [0, 1], [0.8, 1]);
    const topicY = interpolate(topicSpring, [0, 1], [30, 0]);
    const topicOpacity = interpolate(
      frame,
      [20 + i * 8, 32 + i * 8],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    return { topic, scale: topicScale, y: topicY, opacity: topicOpacity };
  });

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

  // CTA animation
  const ctaSpring = spring({ frame: frame - 50, fps, config: springs.bouncy });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0, 1]);
  const ctaY = interpolate(ctaSpring, [0, 1], [30, 0]);

  // Star count animation
  const starSpring = spring({ frame: frame - 10, fps, config: springs.snappy });
  const starScale = interpolate(starSpring, [0, 1], [0.8, 1]);

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

      {/* Language badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 24px',
          backgroundColor: `${langColor}22`,
          border: `2px solid ${langColor}`,
          borderRadius: 50,
          transform: `translateY(${containerY}px) scale(${starScale})`,
          opacity: containerOpacity,
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: langColor,
            boxShadow: `0 0 10px ${langColor}`,
          }}
        />
        <span style={{ fontSize: 24, fontWeight: 600, color: langColor }}>
          {language}
        </span>
      </div>

      {/* Topic pills */}
      {topics.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
            maxWidth: 800,
            transform: `translateY(${containerY * 0.5}px)`,
            opacity: containerOpacity,
          }}
        >
          {topicPills.map((pill, i) => (
            <div
              key={i}
              style={{
                padding: '8px 16px',
                backgroundColor: `${accentColor}15`,
                border: `1px solid ${accentColor}44`,
                borderRadius: 20,
                fontSize: 18,
                color: '#ccc',
                transform: `scale(${pill.scale}) translateY(${pill.y}px)`,
                opacity: pill.opacity,
              }}
            >
              #{pill.topic}
            </div>
          ))}
        </div>
      )}

      {/* Star count */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          transform: `scale(${starScale})`,
          opacity: containerOpacity,
        }}
      >
        <span style={{ fontSize: 48 }}>⭐</span>
        <span
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: '#fbbf24',
            textShadow: `0 0 30px #fbbf2444`,
          }}
        >
          {stars >= 1000 ? `${(stars / 1000).toFixed(1)}K` : stars.toLocaleString()}
        </span>
        <span style={{ fontSize: 24, color: '#888' }}>stars</span>
      </div>

      {/* CTA */}
      <div
        style={{
          transform: `scale(${ctaScale}) translateY(${ctaY}px)`,
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
          Check it out on GitHub →
        </span>
      </div>

      {/* Repo name */}
      <div
        style={{
          transform: `translateY(${containerY * 0.3}px)`,
          opacity: containerOpacity,
          marginTop: 10,
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
