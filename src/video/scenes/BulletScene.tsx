import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { LayoutA } from '../layouts/LayoutA';
import { LayoutB } from '../layouts/LayoutB';
import { LayoutC } from '../layouts/LayoutC';
import { LayoutD } from '../layouts/LayoutD';
import { LayoutE } from '../layouts/LayoutE';
import { LayoutF } from '../layouts/LayoutF';
import { LayoutG } from '../layouts/LayoutG';
import { LayoutH } from '../layouts/LayoutH';
import { colors } from '../designSystem';

interface BulletSceneProps {
  text: string;
  index: number;
  accentColor: string;
}

// All 8 layouts for rich variety
const layouts = [LayoutA, LayoutB, LayoutC, LayoutD, LayoutE, LayoutF, LayoutG, LayoutH];

// Background decoration component
const SubtleGrid: React.FC<{ accentColor: string; frame: number }> = ({
  accentColor,
  frame,
}) => {
  const opacity = interpolate(frame, [0, 30], [0, 0.05], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle, ${accentColor} 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

export const BulletScene: React.FC<BulletSceneProps> = ({
  text,
  index,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const Layout = layouts[index % layouts.length];

  // Calculate scene position (0-indexed after intro and headline)
  const sceneIndex = index + 2;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg.primary,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 80,
        overflow: 'hidden',
      }}
    >
      {/* Subtle background grid */}
      <SubtleGrid accentColor={accentColor} frame={frame} />

      {/* Vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 0%, ${colors.bg.primary}90 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Main layout */}
      <div style={{ zIndex: 10, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Layout text={text} accentColor={accentColor} />
      </div>

      {/* Bottom progress indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 48,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 8,
          zIndex: 20,
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const isActive = i === sceneIndex;
          const dotOpacity = interpolate(frame, [10 + i * 3, 20 + i * 3], [0, isActive ? 1 : 0.3], {
            extrapolateRight: 'clamp',
          });

          return (
            <div
              key={i}
              style={{
                width: isActive ? 32 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isActive ? accentColor : colors.text.muted,
                opacity: dotOpacity,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
