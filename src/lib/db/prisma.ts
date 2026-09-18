import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton with stale-client detection.
 * Prefer `npm run dev` (runs scripts/ensure-prisma.mjs) after schema edits —
 * that regenerates the client, pushes the DB, and clears `.next` when needed.
 */

/** CamelCase Prisma client delegates that must exist. */
const REQUIRED_DELEGATES = [
  'user',
  'person',
  'household',
  'personHousehold',
  'choir',
  'bandMusician',
  'sundayService',
  'choirDirectorSettings',
  'churchEvent',
  'churchSpace',
  'ministryMediaAsset',
  'planAttendance',
  'planComment',
  'userUiPreference',
  'notificationChannelPreference',
] as const;

/** Field checks catch “Unknown argument …” style staleness after schema edits. */
const REQUIRED_MODEL_FIELDS: Record<string, readonly string[]> = {
  ChurchEvent: ['spaceId', 'activityRequest'],
  Person: ['suffix', 'dateOfBirth', 'isMinor', 'householdMembership'],
  Household: ['name', 'members'],
  PersonHousehold: ['householdId', 'personId', 'role'],
  Choir: ['members', 'leaders'],
  BandMusician: ['secondaryInstruments', 'depthOrder'],
  User: ['choirIds', 'ministryIds'],
  UserUiPreference: ['voiceCoachPreference'],
};

const STALE_CLIENT_HELP =
  'Prisma client is out of date. Stop the dev server, then run `npm run dev` (it auto-syncs Prisma and clears .next when the schema changed). If it still fails: `npm run dev:fresh`.';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  /** Fingerprint of the loaded client’s required shape (not a manual bump). */
  prismaShapeKey?: string;
};

type RuntimeField = { name: string };
type RuntimeModel = { fields?: RuntimeField[] };
type RuntimeDataModel = { models?: Record<string, RuntimeModel> };

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

function getRuntimeModels(client: PrismaClient): Record<string, RuntimeModel> {
  return (
    (client as unknown as { _runtimeDataModel?: RuntimeDataModel })._runtimeDataModel
      ?.models ?? {}
  );
}

function hasRequiredDelegates(client: PrismaClient): boolean {
  return REQUIRED_DELEGATES.every((name) => {
    const delegate = (client as unknown as Record<string, { findMany?: unknown }>)[
      name
    ];
    return typeof delegate?.findMany === 'function';
  });
}

function hasRequiredFields(client: PrismaClient): boolean {
  const models = getRuntimeModels(client);
  return Object.entries(REQUIRED_MODEL_FIELDS).every(([modelName, fields]) => {
    const model = models[modelName];
    if (!model?.fields?.length) return false;
    const names = new Set(model.fields.map((field) => field.name));
    return fields.every((field) => names.has(field));
  });
}

function shapeKeyFor(client: PrismaClient): string {
  const models = getRuntimeModels(client);
  const parts: string[] = [];
  for (const [modelName, fields] of Object.entries(REQUIRED_MODEL_FIELDS)) {
    const present = models[modelName]?.fields?.map((field) => field.name) ?? [];
    parts.push(`${modelName}:${fields.join(',')}|have:${present.join(',')}`);
  }
  for (const name of REQUIRED_DELEGATES) {
    parts.push(`delegate:${name}`);
  }
  return parts.join(';');
}

function assertClientHealthy(client: PrismaClient): void {
  if (!hasRequiredDelegates(client) || !hasRequiredFields(client)) {
    throw new Error(STALE_CLIENT_HELP);
  }
}

function getClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (
    cached &&
    globalForPrisma.prismaShapeKey &&
    hasRequiredDelegates(cached) &&
    hasRequiredFields(cached)
  ) {
    return cached;
  }

  if (cached) {
    void cached.$disconnect().catch(() => undefined);
  }

  const client = createPrismaClient();
  assertClientHealthy(client);

  globalForPrisma.prisma = client;
  globalForPrisma.prismaShapeKey = shapeKeyFor(client);
  return client;
}

/**
 * Lazy proxy so HMR always resolves through getClient()
 * instead of a one-shot client captured at import time.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getClient();
    const value = Reflect.get(client, property, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
