import type { CursorStreamEvent } from '../types/cursor.types';

/** Parse Server-Sent Events from `/api/cursor/prompt`. */
export async function readCursorSseStream(
  response: Response,
  onEvent: (event: CursorStreamEvent) => void,
): Promise<void> {
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error('No response stream available.');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() ?? '';

    for (const chunk of chunks) {
      const lines = chunk.split('\n');
      let eventName = 'message';
      let dataLine = '';

      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataLine = line.slice(5).trim();
        }
      }

      if (!dataLine) continue;

      const payload = JSON.parse(dataLine) as CursorStreamEvent;
      if (payload.type === eventName || payload.type) {
        onEvent(payload);
      }
    }
  }
}
