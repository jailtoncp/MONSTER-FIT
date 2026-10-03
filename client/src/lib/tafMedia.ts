import type { TafDemoKind } from "./tafService";

export interface TafMediaAsset {
  /** File copied from github-pages-assets/taf during the Pages build. */
  file: string;
  posterFile: string;
  /** Uploaded copy served by the Manus preview. */
  storageFile: string;
  posterStorageFile: string;
  /** Human-like AI-generated illustration, original schematic, or externally sourced human demo. */
  kind: "original" | "sourced" | "generated-human";
  source?: string;
  credit?: string;
}

/**
 * Each TAF modality has a looping GIF. Generated-human files are original
 * storyboards converted to GIFs; Commons-sourced demonstrations retain visible credit.
 */
export const TAF_MEDIA: Record<TafDemoKind, TafMediaAsset> = {
  rower: { file: "rower-human.gif", posterFile: "rower-human-poster.webp", storageFile: "rower-human_80144c23.gif", posterStorageFile: "rower-human-poster_4d9ee3ef.webp", kind: "generated-human" },
  "distance-run": { file: "distance-run-human.gif", posterFile: "distance-run-human-poster.webp", storageFile: "distance-run-human_fb0eb89e.gif", posterStorageFile: "distance-run-human-poster_4c397fe0.webp", kind: "generated-human" },
  sprint: { file: "sprint-human.gif", posterFile: "sprint-human-poster.webp", storageFile: "sprint-human_195b2e6d.gif", posterStorageFile: "sprint-human-poster_ad646626.webp", kind: "generated-human" },
  "static-bar": { file: "static-bar-human.gif", posterFile: "static-bar-human-poster.webp", storageFile: "static-bar-human_dceace77.gif", posterStorageFile: "static-bar-human-poster_1fe50aa8.webp", kind: "generated-human" },
  "pull-up": { file: "pull-up-human.gif", posterFile: "pull-up-human-poster.webp", storageFile: "pull-up-human_ec27400a.gif", posterStorageFile: "pull-up-human-poster_bb254343.webp", kind: "generated-human" },
  jump: { file: "jump-human.gif", posterFile: "jump-human-poster.webp", storageFile: "jump-human_1ca3ee52.gif", posterStorageFile: "jump-human-poster_93c96205.webp", kind: "generated-human" },
  rope: { file: "rope-human.gif", posterFile: "rope-human-poster.webp", storageFile: "rope-human_a4976fec.gif", posterStorageFile: "rope-human-poster_81130f32.webp", kind: "generated-human" },
  shuttle: { file: "shuttle-human.gif", posterFile: "shuttle-human-poster.webp", storageFile: "shuttle-human_d605a4e7.gif", posterStorageFile: "shuttle-human-poster_eb253249.webp", kind: "generated-human" },
  "push-up": { file: "push-up-real.gif", posterFile: "push-up-real-poster.webp", storageFile: "push-up-real_2f1a59c1.gif", posterStorageFile: "push-up-real-poster_9cf1968a.webp", kind: "sourced", source: "https://commons.wikimedia.org/wiki/File:Navy-seal-buds-training-push-ups.ogv", credit: "United States Navy SEALs · domínio público nos EUA" },
};
