const BASE_URL = import.meta.env.BASE_URL;
const isGitHubPagesBuild = BASE_URL === "/MONSTER-FIT/";

export function appAssetUrl(path: string): string {
  return `${BASE_URL}${path.replace(/^\/+/, "")}`;
}

export const HERO_IMAGE_URL = isGitHubPagesBuild
  ? appAssetUrl("media/monster-fit-training-hero.webp")
  : "/media/monster-fit-training-hero.webp";

export function exerciseImageUrl(_key: string, manuscriptUrl: string): string {
  // Exercise GIFs are hosted by their configured source URL.
  // GitHub Pages must not rewrite them to /media/exercises unless the binary
  // file actually exists in the repository.
  return manuscriptUrl;
}
