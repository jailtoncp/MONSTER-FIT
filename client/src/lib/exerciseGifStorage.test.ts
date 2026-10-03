import { describe, expect, it } from "vitest";
import { MAX_EXERCISE_GIF_BYTES, validateAnimatedExerciseGif, validateExerciseGif, validateExerciseMedia } from "./exerciseGifStorage";

function makeFile(contents: BlobPart[], name = "exercise.gif"): File {
  return new File(contents, name, { type: "image/gif" });
}

describe("local exercise GIF uploads", () => {
  it("accepts a GIF87a header", async () => {
    await expect(validateExerciseGif(makeFile(["GIF87a", new Uint8Array([0, 0, 0])]))).resolves.toBeUndefined();
  });

  it("accepts a GIF89a header", async () => {
    await expect(validateExerciseGif(makeFile(["GIF89a", new Uint8Array([0, 0, 0])]))).resolves.toBeUndefined();
  });

  it("requires an animated GIF for a new exercise demonstration", async () => {
    await expect(validateAnimatedExerciseGif(makeFile(["GIF89a", new Uint8Array([0, 0, 0])]))).resolves.toBeUndefined();
    const png = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "exercise.png", { type: "image/png" });
    await expect(validateAnimatedExerciseGif(png)).rejects.toThrow("GIF animado");
  });

  it("accepts a PNG image for an exercise", async () => {
    const png = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "exercise.png", { type: "image/png" });
    await expect(validateExerciseMedia(png)).resolves.toBeUndefined();
  });

  it("rejects empty and unsupported files", async () => {
    await expect(validateExerciseGif(makeFile([]))).rejects.toThrow("vazio");
    await expect(validateExerciseGif(makeFile(["not a gif"]))).rejects.toThrow("GIF válido");
  });

  it("rejects files larger than 12 MB", async () => {
    const file = makeFile(["GIF89a", new Uint8Array(MAX_EXERCISE_GIF_BYTES)]);
    await expect(validateExerciseGif(file)).rejects.toThrow("até 12 MB");
  });
});
