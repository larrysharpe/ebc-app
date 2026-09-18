import {
  ALLOWED_PATH_PREFIXES,
  APP_ROUTE_TARGETS,
  MINISTRY_ROUTE_TARGETS,
  MINISTRY_TABS,
} from './app-control.constants';
import type { AppAction, AppControlParseResult, AppNavigateAction } from './app-control.types';

const APP_ACTION_MARKER = /^APP_ACTION\s*$/im;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9/?'=\s-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeNavigation(text: string): boolean {
  return /^(open|go to|goto|show|take me to|navigate to|bring up|pull up)\b/.test(text);
}

function findMinistry(normalized: string): (typeof MINISTRY_ROUTE_TARGETS)[number] | null {
  const ranked = MINISTRY_ROUTE_TARGETS.map((ministry) => {
    const aliases = [...ministry.aliases].sort((a, b) => b.length - a.length);
    const hit = aliases.find((alias) => normalized.includes(alias));
    return hit ? { ministry, score: hit.length } : null;
  }).filter((entry): entry is { ministry: (typeof MINISTRY_ROUTE_TARGETS)[number]; score: number } =>
    Boolean(entry),
  );

  ranked.sort((a, b) => b.score - a.score);
  return ranked[0]?.ministry ?? null;
}

function findTab(normalized: string): string | null {
  for (const tab of MINISTRY_TABS) {
    if (tab.aliases.some((alias) => normalized.includes(alias))) {
      return tab.id;
    }
  }
  return null;
}

function findAppRoute(normalized: string): (typeof APP_ROUTE_TARGETS)[number] | null {
  const ranked = APP_ROUTE_TARGETS.map((route) => {
    const aliases = [...route.aliases].sort((a, b) => b.length - a.length);
    const hit = aliases.find((alias) => normalized.includes(alias));
    return hit ? { route, score: hit.length } : null;
  }).filter((entry): entry is { route: (typeof APP_ROUTE_TARGETS)[number]; score: number } =>
    Boolean(entry),
  );

  ranked.sort((a, b) => b.score - a.score);
  return ranked[0]?.route ?? null;
}

export function isAllowedAppPath(path: string): boolean {
  if (!path.startsWith('/')) return false;
  if (path.includes('://') || path.includes('..')) return false;

  const pathname = path.split('?')[0] ?? path;
  return ALLOWED_PATH_PREFIXES.some((prefix) => {
    if (prefix === '/') return pathname === '/';
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

export function createNavigateAction(path: string, label: string): AppNavigateAction | null {
  if (!isAllowedAppPath(path)) return null;
  return { type: 'navigate', path, label };
}

/**
 * Fast local parser for common "open / go to" commands.
 * Returns null when the prompt should go to the Cursor agent instead.
 */
export function parseAppControlIntent(prompt: string): AppControlParseResult | null {
  const normalized = normalize(prompt);
  if (!normalized || !looksLikeNavigation(normalized)) return null;

  const ministry = findMinistry(normalized);
  if (ministry) {
    const tab = findTab(normalized);
    const path = tab
      ? `/ministries/${ministry.slug}?tab=${tab}`
      : `/ministries/${ministry.slug}`;
    const label = tab
      ? `${ministry.name} · ${
          tab === 'sops'
            ? 'SOPs'
            : tab === 'media'
              ? 'Media'
              : tab === 'documents'
                ? 'Documents'
                : tab
        }`
      : ministry.name;
    const action = createNavigateAction(path, label);
    return action ? { action, confidence: 'high' } : null;
  }

  const route = findAppRoute(normalized);
  if (route) {
    const action = createNavigateAction(route.path, route.label);
    return action ? { action, confidence: 'high' } : null;
  }

  return null;
}

export function extractAppActionsFromText(text: string): AppAction[] {
  const match = APP_ACTION_MARKER.exec(text);
  if (!match || match.index === undefined) return [];

  const after = text.slice(match.index + match[0].length).trim();
  const jsonCandidate = after.split(/\n\s*\n/)[0]?.trim() ?? '';
  if (!jsonCandidate.startsWith('{')) return [];

  try {
    const parsed = JSON.parse(jsonCandidate) as { type?: string; path?: string; label?: string };
    if (parsed.type !== 'navigate' || typeof parsed.path !== 'string') return [];
    const action = createNavigateAction(
      parsed.path,
      typeof parsed.label === 'string' && parsed.label.trim()
        ? parsed.label.trim()
        : parsed.path,
    );
    return action ? [action] : [];
  } catch {
    return [];
  }
}

export function stripAppActionBlock(text: string): string {
  const match = APP_ACTION_MARKER.exec(text);
  if (!match || match.index === undefined) return text.trim();

  const before = text.slice(0, match.index).trim();
  const after = text.slice(match.index + match[0].length).trim();
  // Drop the JSON object that follows the marker
  const withoutJson = after.replace(/^\{[\s\S]*?\}\s*/, '').trim();
  return [before, withoutJson].filter(Boolean).join('\n\n').trim();
}

export function buildAppControlCatalogForPrompt(): string {
  const ministries = MINISTRY_ROUTE_TARGETS.map(
    (m) =>
      `- ${m.name} → /ministries/${m.slug} (tabs: calendar, overview, personnel, duties, sops, media, documents)`,
  ).join('\n');
  const routes = APP_ROUTE_TARGETS.map((r) => `- ${r.label} → ${r.path}`).join('\n');

  return [
    'When the user asks to open, go to, or show a screen in EBC APP, end your reply with:',
    'APP_ACTION',
    '{"type":"navigate","path":"/ministries/media-ministry?tab=sops","label":"Media Ministry · SOPs"}',
    'Use only real app paths. Ministry tabs: calendar | overview | personnel | duties | sops | media | documents.',
    '',
    'Known routes:',
    routes,
    '',
    'Ministries:',
    ministries,
  ].join('\n');
}
