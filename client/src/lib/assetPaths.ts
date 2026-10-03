import { LOCAL_EXERCISE_ASSETS } from "./localExerciseAssets";

const BASE_URL = import.meta.env.BASE_URL;
const isGitHubPagesBuild = BASE_URL === "/MONSTER-FIT/";

export function appAssetUrl(path: string): string {
  return `${BASE_URL}${path.replace(/^\/+/, "")}`;
}

export const HERO_IMAGE_URL = isGitHubPagesBuild
  ? appAssetUrl("media/monster-fit-training-hero.webp")
  : "/media/monster-fit-training-hero.webp";

export function exerciseImageUrl(key: string, manuscriptUrl: string): string {
  // Prefer the bundled file when it exists; external URLs are only a fallback
  // for exercises that still need a manually supplied demonstration.
  return isGitHubPagesBuild && LOCAL_EXERCISE_ASSETS.has(key)
    ? appAssetUrl(`media/exercises/${key}.gif`)
    : manuscriptUrl;
}
