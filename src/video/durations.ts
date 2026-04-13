export const INTRO_DURATION = 105; // 3.5s at 30fps - extended for richer animations
export const HEADLINE_DURATION = 120; // 4s - extended for word highlighting
export const BULLET_DURATION = 90; // 3s each - extended for word-by-word reveals
export const OUTRO_DURATION = 105; // 3.5s - extended for celebration effects
export const TRANSITION_DURATION = 15; // 0.5s transitions between scenes

export const calculateDuration = (bulletCount: number): number => {
  // Account for transitions (each transition reduces total duration as they overlap)
  const transitionCount = 3; // Intro->Headline, Headline->Bullets, Bullets->Outro
  const totalTransitions = transitionCount * TRANSITION_DURATION;
  return INTRO_DURATION + HEADLINE_DURATION + bulletCount * BULLET_DURATION + OUTRO_DURATION - totalTransitions;
};
