import { LOCAL_EXERCISE_ASSETS } from "./localExerciseAssets";

const BASE_URL = import.meta.env.BASE_URL;
const isGitHubPagesBuild = BASE_URL === "/MONSTER-FIT/";

export function appAssetUrl(path: string): string {
  return `${BASE_URL}${path.replace(/^\/+/, "")}`;
}

export const HERO_IMAGE_URL = isGitHubPagesBuild
  ? appAssetUrl("media/monster-fit-training-hero.webp")
  : "/media/monster-fit-training-hero.webp";

export function exerciseImageUrl(_key: string, manuscriptUrl: string): string {
  if (!isGitHubPagesBuild) return manuscriptUrl;

  if (manuscriptUrl.startsWith("/exercises/")) {
    const filename = manuscriptUrl.replace(/^\/exercises\//, "");
    return appAssetUrl(`media/exercises/${filename}`);
  }

  if (manuscriptUrl.startsWith("/manus-storage/")) {
    const filename = manuscriptUrl
      .replace(/^\/manus-storage\//, "")
      .replace(/_[a-f0-9]+(?=\.gif$)/i, "");
    return appAssetUrl(`media/exercises/${filename}`);
  }

  return manuscriptUrl;
}
