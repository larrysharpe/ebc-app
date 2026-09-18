#!/usr/bin/env node
/**
 * Keep Prisma client + DB schema in sync before Next starts.
 * When prisma/schema.prisma changes, regenerate the client, push the DB,
 * and clear `.next` so Next does not keep a stale compiled Prisma wrapper.
 */
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaPath = path.join(root, 'prisma', 'schema.prisma');
const hashPath = path.join(root, 'node_modules', '.cache', 'ebc-prisma-schema.sha256');
const nextDir = path.join(root, '.next');

function readSchemaHash() {
  const source = fs.readFileSync(schemaPath, 'utf8');
  return createHash('sha256').update(source).digest('hex');
}

function readStoredHash() {
  try {
    return fs.readFileSync(hashPath, 'utf8').trim();
  } catch {
    return null;
  }
}

function writeStoredHash(hash) {
  fs.mkdirSync(path.dirname(hashPath), { recursive: true });
  fs.writeFileSync(hashPath, `${hash}\n`, 'utf8');
}

function run(command) {
  console.log(`\n[prisma] ${command}`);
  execSync(command, { cwd: root, stdio: 'inherit', env: process.env });
}

function removeNextCache() {
  if (!fs.existsSync(nextDir)) return;
  console.log('\n[prisma] schema changed — clearing .next so Next picks up the new client');
  fs.rmSync(nextDir, { recursive: true, force: true });
}

function main() {
  const force = process.argv.includes('--force');
  const hash = readSchemaHash();
  const previous = readStoredHash();
  const schemaChanged = force || previous !== hash;

  if (!schemaChanged) {
    const clientIndex = path.join(root, 'node_modules', '.prisma', 'client', 'index.js');
    if (fs.existsSync(clientIndex)) {
      console.log('[prisma] schema unchanged — client is current');
      return;
    }
  }

  if (schemaChanged && previous) {
    removeNextCache();
  }

  run('npx prisma generate');
  run('npx prisma db push');
  writeStoredHash(hash);
  console.log('[prisma] sync complete\n');
}

main();
