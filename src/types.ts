export interface VideoScript {
  meta: {
    repoName: string;
    prNumber: number;
    prTitle: string;
    author: string;
    ownerAvatar: string;  // Renamed from authorAvatar for consistency with RepoVideoScript
    filesChanged: number;
    additions: number;
    deletions: number;
  };
  summary: {
    headline: string;
    vibe: 'feature' | 'fix' | 'refactor' | 'docs' | 'chore';
    bullets: string[];
    emoji: string;
  };
  style: {
    accentColor: string;
    tone: 'celebratory' | 'relief' | 'technical' | 'minor';
  };
}

export interface RepoVideoScript {
  meta: {
    repoName: string;
    owner: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
    topics: string[];
    ownerAvatar: string;
  };
  summary: {
    headline: string;
    bullets: string[];
    emoji: string;
  };
  style: {
    accentColor: string;
    tone: 'celebratory' | 'educational' | 'hype' | 'technical';
  };
}

export type VideoData = VideoScript | RepoVideoScript;

export function isRepoVideoScript(data: VideoData): data is RepoVideoScript {
  return 'stars' in data.meta;
}
