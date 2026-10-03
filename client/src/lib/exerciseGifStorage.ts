const DATABASE_NAME = "monster-fit-local-media";
const DATABASE_VERSION = 1;
const STORE_NAME = "exercise-gifs";
export const MAX_EXERCISE_GIF_BYTES = 12 * 1024 * 1024;
export const MAX_EXERCISE_MEDIA_BYTES = MAX_EXERCISE_GIF_BYTES;

type StoredExerciseGif = {
  key: string;
  accountId: string;
  exerciseId: string;
  blob: Blob;
  updatedAt: string;
};

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("O armazenamento local de arquivos não está disponível neste navegador."));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      const store = database.objectStoreNames.contains(STORE_NAME)
        ? request.transaction?.objectStore(STORE_NAME)
        : database.createObjectStore(STORE_NAME, { keyPath: "key" });
      if (store && !store.indexNames.contains("by-account")) store.createIndex("by-account", "accountId", { unique: false });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Não foi possível abrir o armazenamento local de GIFs."));
    request.onblocked = () => reject(new Error("Feche outras abas do MONSTER FIT e tente novamente."));
  });
}

export async function validateExerciseMedia(file: File): Promise<void> {
  if (!file.size) throw new Error("O arquivo de imagem está vazio.");
  if (file.size > MAX_EXERCISE_MEDIA_BYTES) throw new Error("Escolha um GIF ou imagem de até 12 MB para manter o app leve no celular.");
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const text = new TextDecoder().decode(bytes);
  const isGif = text.startsWith("GIF87a") || text.startsWith("GIF89a");
  const isPng = bytes.length >= 8 && bytes[0] === 0x89 && text.slice(1, 4) === "PNG";
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isWebp = text.slice(0, 4) === "RIFF" && text.slice(8, 12) === "WEBP";
  if (!isGif && !isPng && !isJpeg && !isWebp) throw new Error("Esse arquivo não parece ser um GIF válido ou imagem válida. Escolha GIF, PNG, JPEG ou WEBP.");
}

/** Compatibilidade com chamadas antigas: agora também aceita imagens estáticas. */
export const validateExerciseGif = validateExerciseMedia;

/** Strict GIF validation for new exercises that promise an animated demo. */
export async function validateAnimatedExerciseGif(file: File): Promise<void> {
  if (!file.size) throw new Error("O arquivo GIF está vazio.");
  if (file.size > MAX_EXERCISE_GIF_BYTES) throw new Error("Escolha um GIF de até 12 MB para manter o app leve no celular.");
  const header = new TextDecoder().decode(new Uint8Array(await file.slice(0, 6).arrayBuffer()));
  if (header !== "GIF87a" && header !== "GIF89a") throw new Error("Escolha um arquivo GIF animado válido.");
}

export async function saveExerciseGif(accountId: string, exerciseId: string, blob: Blob): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({
      key: `${accountId}:${exerciseId}`,
      accountId,
      exerciseId,
      blob,
      updatedAt: new Date().toISOString(),
    } satisfies StoredExerciseGif);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Não foi possível salvar o GIF neste dispositivo."));
    transaction.onabort = () => reject(transaction.error ?? new Error("O salvamento do GIF foi interrompido."));
  }).finally(() => database.close());
}

export async function loadExerciseGifs(accountId: string): Promise<Record<string, Blob>> {
  const database = await openDatabase();
  return new Promise<Record<string, Blob>>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).index("by-account").getAll(accountId);
    request.onsuccess = () => {
      const stored = request.result as StoredExerciseGif[];
      resolve(Object.fromEntries(stored.filter((item) => item.blob instanceof Blob).map((item) => [item.exerciseId, item.blob])));
    };
    request.onerror = () => reject(request.error ?? new Error("Não foi possível carregar os GIFs deste perfil."));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => database.close();
    transaction.onabort = () => database.close();
  });
}
