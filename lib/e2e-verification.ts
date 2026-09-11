import 'server-only';

import { createHash } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const verificationDirectory = path.join(
  process.cwd(),
  '.e2e',
  'verification-emails',
);

const fileNameForEmail = (email: string) =>
  `${createHash('sha256').update(email.toLowerCase()).digest('hex')}.json`;

export const captureE2EVerificationEmail = async ({
  email,
  verificationUrl,
}: {
  email: string;
  verificationUrl: string;
}) => {
  if (process.env.E2E_TEST_MODE !== 'true' || !email.endsWith('@example.test')) {
    return false;
  }

  await mkdir(verificationDirectory, { recursive: true });
  await writeFile(
    path.join(verificationDirectory, fileNameForEmail(email)),
    JSON.stringify({ email, verificationUrl, capturedAt: new Date().toISOString() }),
    'utf8',
  );

  return true;
};
