import { richTextToPlainText } from '@/components/ui/RichTextEditor';

import type { PlanPractice, PlanSongSlot, ServiceMusicPlan, Song } from '../types';
import { SLOT_TYPE_LABELS } from '../types';
import { getChoirName } from './choir.utils';
import { formatSundayLabel } from './choir-schedule.utils';
import { getPlanPractices } from './plan-practice.utils';
import {
  formatPlanServiceRole,
  isPlanServiceRoleNa,
  planServiceRolesCallout,
} from './plan-service-role.utils';

export function formatServiceDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatPracticeEntry(practice: PlanPractice): string | null {
  if (!practice.date) return null;

  const date = new Date(`${practice.date}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (!practice.startTime) return date;

  const start = formatTime12h(practice.startTime);
  if (practice.endTime) {
    return `${date} at ${start} to ${formatTime12h(practice.endTime)}`;
  }

  return `${date} at ${start}`;
}

export function formatPracticeDateTime(plan: ServiceMusicPlan): string | null {
  const practices = getPlanPractices(plan)
    .map(formatPracticeEntry)
    .filter((value): value is string => Boolean(value));
  if (practices.length === 0) return null;
  return practices.join('; ');
}

function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${period}` : `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

function formatServiceTimeRange(plan: ServiceMusicPlan): string | null {
  if (plan.serviceStartTime && plan.serviceEndTime) {
    return `${formatTime12h(plan.serviceStartTime)}–${formatTime12h(plan.serviceEndTime)}`;
  }
  if (plan.serviceStartTime) return formatTime12h(plan.serviceStartTime);
  if (plan.serviceEndTime) return `until ${formatTime12h(plan.serviceEndTime)}`;
  return null;
}

export function resolveSlotTitle(
  slot: PlanSongSlot,
  songsById: Map<string, Song>,
): string {
  if (slot.customTitle) return slot.customTitle;
  if (slot.songId) {
    const song = songsById.get(slot.songId);
    if (song) return song.title;
  }
  return 'Untitled song';
}

export function resolveSlotArtist(
  slot: PlanSongSlot,
  songsById: Map<string, Song>,
): string | undefined {
  if (slot.songId) return songsById.get(slot.songId)?.artist;
  return undefined;
}

export function resolveSlotYoutube(
  slot: PlanSongSlot,
  songsById: Map<string, Song>,
): string | undefined {
  if (slot.youtubeUrl) return slot.youtubeUrl;
  if (slot.songId) return songsById.get(slot.songId)?.youtubeUrl;
  return undefined;
}

export function buildPlanGreeting(plan: ServiceMusicPlan): string {
  const choir = getChoirName(plan.choirGroup);
  if (plan.sundayOfMonth) {
    return `Good evening, ${formatSundayLabel(plan.sundayOfMonth)} ${choir}!`;
  }
  return `Good evening, ${choir}!`;
}

export type BuildPlanEmailBodyOptions = {
  /** Venue / address (e.g. from linked church event). */
  location?: string;
  /** App link appended for share notifications. */
  appHref?: string;
};

/**
 * Plain-text choir message used in preview “copy” and Share with choir delivery.
 */
export function buildPlanEmailBody(
  plan: ServiceMusicPlan,
  songs: Song[],
  options: BuildPlanEmailBodyOptions = {},
): string {
  const songsById = new Map(songs.map((s) => [s.id, s]));
  const lines: string[] = [];

  lines.push(buildPlanGreeting(plan));
  if (plan.title.trim()) {
    lines.push(plan.title.trim());
  }
  lines.push('');

  lines.push(`Service: ${formatServiceDate(plan.serviceDate)}`);
  const serviceTimes = formatServiceTimeRange(plan);
  if (serviceTimes) {
    lines.push(`Time: ${serviceTimes}`);
  }
  if (options.location?.trim()) {
    lines.push(`Location: ${options.location.trim()}`);
  }
  lines.push('');

  if (plan.arrivalTime) {
    lines.push(`Arrival time: ${formatTime12h(plan.arrivalTime)}.`);
    lines.push('');
  }

  const practices = getPlanPractices(plan);
  if (practices.length === 1) {
    const practice = formatPracticeEntry(practices[0]!);
    if (practice) {
      lines.push(`Our choir practice will be ${practice}.`);
      if (practices[0]?.location) {
        lines.push(`Location: ${practices[0].location}.`);
      }
      lines.push('');
    }
  } else if (practices.length > 1) {
    lines.push('Choir practices:');
    practices.forEach((practice, index) => {
      const label = formatPracticeEntry(practice);
      if (!label) return;
      const location = practice.location ? ` (${practice.location})` : '';
      lines.push(`${index + 1}. ${label}${location}`);
    });
    lines.push('');
  }

  if (plan.occasion) {
    lines.push(plan.occasion);
    lines.push('');
  }

  if (plan.attire) {
    lines.push(`Attire — ${plan.attire}`);
    lines.push('');
  }

  const hasScripture =
    Boolean(plan.scriptureReader?.trim()) || isPlanServiceRoleNa(plan.scriptureReader);
  const hasPrayer =
    Boolean(plan.prayerLeader?.trim()) || isPlanServiceRoleNa(plan.prayerLeader);
  /** Chapel Sunday plans keep blank scripture/prayer lines; off-site skips when unused. */
  const showServiceRoles =
    plan.sundayOfMonth != null || hasScripture || hasPrayer;
  if (showServiceRoles) {
    const rolesCallout = planServiceRolesCallout(
      plan.scriptureReader,
      plan.prayerLeader,
    );
    if (rolesCallout) {
      lines.push(rolesCallout);
      lines.push('');
    }
    lines.push(`Scripture: ${formatPlanServiceRole(plan.scriptureReader)}`);
    lines.push(`Prayer: ${formatPlanServiceRole(plan.prayerLeader)}`);
    lines.push('');
  }

  const sorted = [...plan.songs].sort((a, b) => a.sortOrder - b.sortOrder);
  if (sorted.length > 0) {
    lines.push('Song selections');
    sorted.forEach((slot, index) => {
      const title = resolveSlotTitle(slot, songsById);
      const artist = resolveSlotArtist(slot, songsById);
      const youtube = resolveSlotYoutube(slot, songsById);
      const slotLabel = SLOT_TYPE_LABELS[slot.slotType];
      const prefix =
        slot.slotType === 'congregational_hymn' ||
        slot.slotType === 'offering' ||
        slot.slotType === 'sermonic' ||
        slot.slotType === 'last_song'
          ? `${slotLabel} — `
          : '';

      lines.push(
        `${index + 1}. ${prefix}${title}${artist ? ` — ${artist}` : ''}${
          slot.assignments ? ` (${slot.assignments})` : ''
        }`,
      );
      if (youtube) lines.push(`   ${youtube}`);
      if (slot.sectionNotes) lines.push(`   ${slot.sectionNotes}`);
      if (slot.notes) lines.push(`   Note: ${slot.notes}`);
    });
    lines.push('');
  }

  const directorNotes = richTextToPlainText(plan.directorNotes);
  if (directorNotes) {
    lines.push(directorNotes);
    lines.push('');
  }

  lines.push('Start learning!');
  lines.push('Be blessed,');
  lines.push(plan.directorName);

  if (options.appHref?.trim()) {
    lines.push('');
    lines.push(`Open in the app: ${options.appHref.trim()}`);
  }

  return lines.join('\n');
}

export function songsToMap(songs: Song[]): Map<string, Song> {
  return new Map(songs.map((s) => [s.id, s]));
}
