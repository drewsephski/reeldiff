import { AbsoluteFill, Audio } from 'remotion';
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
// import { LightLeak } from '@remotion/light-leaks';
import type { RepoVideoScript } from '../types';
import { RepoIntroScene } from './scenes/RepoIntroScene';
import { HeadlineScene } from './scenes/HeadlineScene';
import { BulletScene } from './scenes/BulletScene';
import { RepoOutroScene } from './scenes/RepoOutroScene';
import { CinematicOverlays } from './components/CinematicOverlays';
import {
  INTRO_DURATION,
  HEADLINE_DURATION,
  BULLET_DURATION,
  OUTRO_DURATION,
  TRANSITION_DURATION,
} from './durations';

export const RepoComposition: React.FC<RepoVideoScript> = (props) => {
  const { meta, summary, style } = props;

  // Map repo tone to headline tone (HeadlineScene supports superset)
  const headlineTone = style.tone as 'celebratory' | 'educational' | 'hype' | 'technical';

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a2e' }}>
      <TransitionSeries>
        {/* Intro Scene */}
        <TransitionSeries.Sequence durationInFrames={INTRO_DURATION}>
          <Audio src="/audio/whoosh.mp3" volume={0.6} />
          <RepoIntroScene
            repoName={meta.repoName}
            owner={meta.owner}
            ownerAvatar={meta.ownerAvatar}
            stars={meta.stars}
            forks={meta.forks}
            accentColor={style.accentColor}
          />
          <CinematicOverlays showFilmGrain={true} showVignette={true} vignetteIntensity={0.3} />
        </TransitionSeries.Sequence>

        {/* Intro to Headline: Slide from right */}
        <TransitionSeries.Transition
          presentation={slide({ direction: 'from-right' })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />

        {/* Headline Scene */}
        <TransitionSeries.Sequence durationInFrames={HEADLINE_DURATION}>
          <Audio src="/audio/impact.mp3" volume={0.5} />
          <HeadlineScene
            headline={summary.headline}
            emoji={summary.emoji}
            accentColor={style.accentColor}
            tone={headlineTone}
          />
          <CinematicOverlays showFilmGrain={true} showVignette={true} vignetteIntensity={0.35} />
        </TransitionSeries.Sequence>

        {/* Headline to Bullets: Wipe transition */}
        <TransitionSeries.Transition
          presentation={wipe({ direction: 'from-left' })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Bullet Scenes with alternating transitions */}
        {summary.bullets.map((bullet, i) => (
          <TransitionSeries.Sequence
            key={i}
            durationInFrames={BULLET_DURATION}
          >
            <Audio src="/audio/pop.mp3" volume={0.4} />
            <BulletScene text={bullet} index={i} accentColor={style.accentColor} />
            <CinematicOverlays showFilmGrain={true} showVignette={true} vignetteIntensity={0.3} />
          </TransitionSeries.Sequence>
        ))}

        {/* Bullets to Outro: Fade transition */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 150 }, durationInFrames: TRANSITION_DURATION })}
        />

        {/* Outro Scene */}
        <TransitionSeries.Sequence durationInFrames={OUTRO_DURATION}>
          <Audio src="/audio/chime.mp3" volume={0.5} />
          <RepoOutroScene
            repoName={meta.repoName}
            language={meta.language}
            topics={meta.topics}
            stars={meta.stars}
            accentColor={style.accentColor}
          />
          <CinematicOverlays showFilmGrain={true} showVignette={true} vignetteIntensity={0.4} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
