import { createHash } from 'crypto';
import { readFile, rm } from 'fs/promises';
import path from 'path';

import { expect } from '@playwright/test';
import { Pool } from 'pg';

const verificationDirectory = path.join(
  process.cwd(),
  '.e2e',
  'verification-emails',
);

const fileNameForEmail = (email: string) =>
  `${createHash('sha256').update(email.toLowerCase()).digest('hex')}.json`;

const verificationFileForEmail = (email: string) =>
  path.join(verificationDirectory, fileNameForEmail(email));

export const clearCapturedVerificationEmail = async (email: string) => {
  await rm(verificationFileForEmail(email), { force: true });
};

export const waitForVerificationUrl = async (email: string) => {
  let verificationUrl = '';

  await expect
    .poll(
      async () => {
        try {
          const raw = await readFile(verificationFileForEmail(email), 'utf8');
          const payload = JSON.parse(raw) as { verificationUrl?: string };
          verificationUrl = payload.verificationUrl ?? '';
          return Boolean(verificationUrl);
        } catch {
          return false;
        }
      },
      {
        message: `waiting for the verification email captured for ${email}`,
        timeout: 10_000,
      },
    )
    .toBe(true);

  return verificationUrl;
};

export const deleteE2EAuthUser = async (email: string) => {
  if (!email.endsWith('@example.test')) {
    throw new Error('Refusing to delete a non-E2E user.');
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required for E2E auth cleanup.');
  }

  const pool = new Pool({ connectionString });

  try {
    await pool.query('DELETE FROM "user" WHERE email = $1', [email]);
  } finally {
    await pool.end();
  }
};
