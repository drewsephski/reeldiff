import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { LightLeak } from '@remotion/light-leaks';
import { useAnimatedVignette } from '../cinematicEffects';
import { colors } from '../designSystem';

// Film grain overlay component
export const FilmGrainOverlay: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        zIndex: 1000,
        opacity: 0.5,
        mixBlendMode: 'overlay',
        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
};

// Animated vignette overlay
export const VignetteOverlay: React.FC<{ baseIntensity?: number }> = ({ baseIntensity = 0.4 }) => {
  const vignette = useAnimatedVignette(baseIntensity);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        zIndex: 999,
        background: vignette.background,
      }}
    />
  );
};

// Letterbox overlay for cinematic aspect ratio
export const LetterboxOverlay: React.FC = () => {
  const barHeight = 60; // 60px bars top and bottom for 2.39:1 aspect ratio

  return (
    <>
      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: barHeight,
          backgroundColor: colors.bg.primary,
          zIndex: 998,
          pointerEvents: 'none',
        }}
      />
      {/* Bottom bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: barHeight,
          backgroundColor: colors.bg.primary,
          zIndex: 998,
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

// Combined cinematic overlays
export const CinematicOverlays: React.FC<{
  showFilmGrain?: boolean;
  showVignette?: boolean;
  showLetterbox?: boolean;
  vignetteIntensity?: number;
}> = ({
  showFilmGrain = true,
  showVignette = true,
  showLetterbox = false,
  vignetteIntensity = 0.35,
}) => {
  return (
    <>
      {showVignette && <VignetteOverlay baseIntensity={vignetteIntensity} />}
      {showFilmGrain && <FilmGrainOverlay />}
      {showLetterbox && <LetterboxOverlay />}
    </>
  );
};

// Light leak transition overlay
export const CinematicLightLeak: React.FC<{
  seed?: number;
  hueShift?: number;
}> = ({ seed = 0, hueShift = 0 }) => {
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 50 }}>
      <LightLeak seed={seed} hueShift={hueShift} />
    </AbsoluteFill>
  );
};

// Scene separator with light leak
export const SceneSeparator: React.FC<{
  seed?: number;
  hueShift?: number;
  accentColor?: string;
}> = ({ seed = 0, hueShift, accentColor }) => {
  // Calculate hue shift from accent color if provided
  const calculatedHueShift = hueShift ?? (accentColor ? getHueFromColor(accentColor) : 0);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 100 }}>
      <LightLeak seed={seed} hueShift={calculatedHueShift} />
    </AbsoluteFill>
  );
};

// Helper function to approximate hue from hex color
function getHueFromColor(hexColor: string): number {
  // Remove # and parse hex
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return h * 360;
}

// Chromatic aberration overlay component
export const ChromaticAberrationOverlay: React.FC<{ intensity?: number }> = ({ intensity = 2 }) => {
  const frame = useCurrentFrame();
  const offset = intensity * (1 + Math.sin(frame * 0.08) * 0.3);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        zIndex: 997,
        mixBlendMode: 'screen',
        opacity: 0.5,
      }}
    >
      {/* Red channel offset */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(255, 0, 0, 0.03)',
          transform: `translateX(${offset}px)`,
          mixBlendMode: 'multiply',
        }}
      />
      {/* Blue channel offset */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 255, 0.03)',
          transform: `translateX(-${offset}px)`,
          mixBlendMode: 'multiply',
        }}
      />
    </AbsoluteFill>
  );
};

// Cinematic title card component
export const CinematicTitleCard: React.FC<{
  title: string;
  subtitle?: string;
  frame: number;
  accentColor: string;
}> = ({ title, subtitle, frame, accentColor }) => {
  const opacity = Math.min(1, frame / 20);
  const scale = 0.9 + Math.min(0.1, frame / 200);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg.primary,
        opacity,
        zIndex: 90,
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: colors.text.primary,
          letterSpacing: '-0.02em',
          textAlign: 'center',
          transform: `scale(${scale})`,
          textShadow: `0 4px 60px ${accentColor}30`,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: colors.text.secondary,
            marginTop: 16,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {subtitle}
        </div>
      )}
    </AbsoluteFill>
  );
};
