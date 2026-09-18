import { SLOT_TYPE_LABELS, type ServiceMusicPlan, type Song } from '../types';
import { setListSuggestResponseSchema } from '../schemas/set-list-suggest.schemas';
import {
  formatRepertoireStatLine,
  type RepertoireSnapshot,
} from './repertoire.utils';

export type SetListSuggestionSlot = {
  slotId: string;
  songId: string | null;
  reason: string;
};

export type SetListSuggestion = {
  summary: string;
  slots: SetListSuggestionSlot[];
};

export type SetListSuggestPromptContext = {
  plan: ServiceMusicPlan;
  songs: Song[];
  snapshot: RepertoireSnapshot;
  occasionLabel?: string;
};

/** Extract a JSON object from raw model text (plain or fenced). */
export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? trimmed).trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end <= start) {
    throw new Error('AI response did not include a JSON object.');
  }
  return JSON.parse(candidate.slice(start, end + 1)) as unknown;
}

/**
 * Validate AI JSON and drop unknown slot/song IDs so apply stays safe.
 */
export function parseSetListSuggestResponse(
  text: string,
  plan: ServiceMusicPlan,
  catalogSongIds: ReadonlySet<string>,
): SetListSuggestion {
  const raw = extractJsonObject(text);
  const parsed = setListSuggestResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? 'AI suggestion format was invalid.',
    );
  }

  const planSlotIds = new Set(plan.songs.map((slot) => slot.id));
  const slots: SetListSuggestionSlot[] = [];

  for (const item of parsed.data.slots) {
    if (!planSlotIds.has(item.slotId)) continue;
    const songId =
      item.songId && catalogSongIds.has(item.songId) ? item.songId : null;
    slots.push({
      slotId: item.slotId,
      songId,
      reason: item.reason.trim(),
    });
  }

  if (slots.length === 0) {
    throw new Error('AI returned no suggestions matching this plan’s slots.');
  }

  return {
    summary: parsed.data.summary.trim(),
    slots,
  };
}

/** Build a Cursor ask-only prompt (song catalog + usage — no member PII). */
export function buildSetListSuggestPrompt(
  context: SetListSuggestPromptContext,
): string {
  const { plan, songs, snapshot, occasionLabel } = context;
  const catalogById = new Map(songs.map((song) => [song.id, song]));

  const occasion =
    occasionLabel?.trim() ||
    plan.occasion?.trim() ||
    plan.title.trim() ||
    'General worship service';

  const slotLines = [...plan.songs]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((slot) => {
      const current = slot.songId
        ? catalogById.get(slot.songId)?.title ?? slot.songId
        : slot.customTitle?.trim() || '(empty)';
      return `- slotId=${slot.id} · ${SLOT_TYPE_LABELS[slot.slotType]} · current: ${current}`;
    });

  const catalogLines = songs.map((song) => {
    const themes = song.themes.length > 0 ? song.themes.join(', ') : '—';
    return `- songId=${song.id} · ${song.title}${song.artist ? ` — ${song.artist}` : ''} · themes: ${themes}`;
  });

  const trendingLines =
    snapshot.trending.length > 0
      ? snapshot.trending.map((s) => `- ${formatRepertoireStatLine(s)}`)
      : ['- (none in the last 90 days)'];

  const restingLines =
    snapshot.resting.length > 0
      ? snapshot.resting.map((s) => `- ${formatRepertoireStatLine(s)}`)
      : ['- (none resting 60+ days)'];

  const neverLines =
    snapshot.neverSung.length > 0
      ? snapshot.neverSung.slice(0, 12).map((s) => `- ${formatRepertoireStatLine(s)}`)
      : ['- (every catalog song appears on at least one sent plan)'];

  return [
    'Suggest songs for each open service slot on this choir plan.',
    `Service date: ${plan.serviceDate}`,
    `Choir: ${plan.choirGroup}`,
    `Occasion / theme: ${occasion}`,
    plan.directorNotes?.trim()
      ? `Director notes: ${plan.directorNotes.trim().slice(0, 400)}`
      : null,
    '',
    'Goals:',
    '- Match the occasion and each slot type (welcome, worship, offering, sermonic, etc.).',
    '- Prefer variety: avoid overusing recently trending songs when resting/never-sung fits.',
    '- Prefer catalog songs with fitting themes when possible.',
    '- You may leave songId null for a slot if nothing fits well.',
    '- Do not assign the same songId to more than one slot.',
    '',
    'Slots to fill:',
    ...slotLines,
    '',
    'Catalog (only use these songId values):',
    ...catalogLines,
    '',
    'Usage — trending (sent plans, ~90 days):',
    ...trendingLines,
    '',
    'Usage — resting (60+ days since last sung):',
    ...restingLines,
    '',
    'Usage — never on a sent plan (sample):',
    ...neverLines,
    '',
    'Respond with JSON only (no markdown outside a json code fence if you fence):',
    '{',
    '  "summary": "1–3 sentences explaining the overall set choice for this occasion",',
    '  "slots": [',
    '    { "slotId": "...", "songId": "..." | null, "reason": "short reason for this slot" }',
    '  ]',
    '}',
    'Include one entry per slot listed above.',
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
}
