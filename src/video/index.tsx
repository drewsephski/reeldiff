import { Composition } from "remotion";
import { PatchPlayComposition } from "./Composition";
import {
  INTRO_DURATION,
  HEADLINE_DURATION,
  BULLET_DURATION,
  OUTRO_DURATION,
  TRANSITION_DURATION,
} from "./durations";

// Calculate total duration
const TOTAL_DURATION =
  INTRO_DURATION +
  TRANSITION_DURATION +
  HEADLINE_DURATION +
  TRANSITION_DURATION +
  3 * BULLET_DURATION + // 3 bullet scenes
  TRANSITION_DURATION +
  OUTRO_DURATION;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PatchPlay"
      component={PatchPlayComposition}
      durationInFrames={TOTAL_DURATION}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        meta: {
          repoName: "example/repo",
          prNumber: 123,
          author: "developer",
          ownerAvatar: "https://github.com/github.png",
          filesChanged: 5,
          additions: 100,
          deletions: 50,
        },
        summary: {
          headline: "Example PR Title",
          emoji: "🚀",
          bullets: [
            "First change description",
            "Second change description",
            "Third change description",
          ],
        },
        style: {
          accentColor: "#6366f1",
          tone: "professional",
        },
      }}
    />
  );
};
