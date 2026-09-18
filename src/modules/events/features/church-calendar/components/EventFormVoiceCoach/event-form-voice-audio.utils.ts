/** Tiny silent wav used to unlock HTMLAudioElement inside a user gesture. */
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

let sharedAudio: HTMLAudioElement | null = null;
let objectUrl: string | null = null;

function getSharedAudio(): HTMLAudioElement {
  if (typeof window === 'undefined') {
    throw new Error('Audio is only available in the browser.');
  }
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = 'auto';
  }
  return sharedAudio;
}

export function unlockHtmlAudio(): void {
  if (typeof window === 'undefined') return;
  try {
    const audio = getSharedAudio();
    audio.src = SILENT_WAV;
    void audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
    });
  } catch {
    // Ignore unlock failures — later play() may still work.
  }
}

export function stopHtmlAudio(): void {
  if (!sharedAudio) return;
  try {
    sharedAudio.onended = null;
    sharedAudio.onerror = null;
    sharedAudio.pause();
    sharedAudio.currentTime = 0;
  } catch {
    // Ignore.
  }
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
}

export async function fetchEventFormTtsBlob(
  text: string,
  signal?: AbortSignal,
): Promise<Blob> {
  const response = await fetch('/api/events/voice-tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    signal,
  });
  if (!response.ok) {
    throw new Error('Natural voice request failed.');
  }
  return response.blob();
}

export function playHtmlAudioBlob(
  blob: Blob,
  signal?: AbortSignal,
): Promise<void> {
  const audio = getSharedAudio();
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  objectUrl = URL.createObjectURL(blob);
  audio.src = objectUrl;

  return new Promise((resolve, reject) => {
    const onAbort = (): void => {
      stopHtmlAudio();
      reject(new DOMException('Aborted', 'AbortError'));
    };

    if (signal?.aborted) {
      onAbort();
      return;
    }

    signal?.addEventListener('abort', onAbort, { once: true });

    audio.onended = () => {
      signal?.removeEventListener('abort', onAbort);
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
      resolve();
    };
    audio.onerror = () => {
      signal?.removeEventListener('abort', onAbort);
      reject(new Error('Audio playback failed.'));
    };

    void audio.play().catch((error: unknown) => {
      signal?.removeEventListener('abort', onAbort);
      reject(error instanceof Error ? error : new Error('Audio play failed.'));
    });
  });
}
