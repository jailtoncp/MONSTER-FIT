const BASE_URL = import.meta.env.BASE_URL;
const isGitHubPagesBuild = BASE_URL === "/MONSTER-FIT/";

export function appAssetUrl(path: string): string {
  return `${BASE_URL}${path.replace(/^\/+/, "")}`;
}

export const HERO_IMAGE_URL = isGitHubPagesBuild
  ? appAssetUrl("media/monster-fit-training-hero.webp")
  : "/media/monster-fit-training-hero.webp";

export function exerciseImageUrl(key: string, manuscriptUrl: string): string {
  return isGitHubPagesBuild ? appAssetUrl(`media/exercises/${key}.gif`) : manuscriptUrl;
}
