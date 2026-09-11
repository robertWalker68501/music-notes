import { randomUUID } from 'node:crypto';

import { Pool } from 'pg';

type ProjectRecord = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  ownerId: string;
};

const getPool = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required for E2E project checks.');
  }

  return new Pool({ connectionString });
};

const assertE2EEmail = (email: string) => {
  if (!email.endsWith('@example.test')) {
    throw new Error('Refusing to manage project fixtures for a non-E2E user.');
  }
};

export const getProjectByOwnerEmailAndName = async (
  email: string,
  name: string,
) => {
  assertE2EEmail(email);

  const pool = getPool();

  try {
    const result = await pool.query<ProjectRecord>(
      `
        SELECT
          p.id,
          p.name,
          p.description,
          p.type,
          p.status,
          p."ownerId"
        FROM "project" p
        INNER JOIN "user" u ON u.id = p."ownerId"
        WHERE u.email = $1
          AND p.name = $2
        LIMIT 1
      `,
      [email, name],
    );

    return result.rows[0] ?? null;
  } finally {
    await pool.end();
  }
};

export const createProjectIsolationFixture = async ({
  ownerEmail,
  ownerName,
  projectName,
}: {
  ownerEmail: string;
  ownerName: string;
  projectName: string;
}) => {
  assertE2EEmail(ownerEmail);

  const pool = getPool();
  const ownerId = randomUUID();
  const projectId = randomUUID();

  try {
    await pool.query('BEGIN');

    await pool.query(
      `
        INSERT INTO "user" (
          id,
          name,
          email,
          "emailVerified",
          role,
          "createdAt",
          "updatedAt"
        )
        VALUES ($1, $2, $3, true, 'USER', NOW(), NOW())
      `,
      [ownerId, ownerName, ownerEmail],
    );

    await pool.query(
      `
        INSERT INTO "project" (
          id,
          name,
          description,
          type,
          status,
          "ownerId",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          $1,
          $2,
          'Project owned by another E2E user.',
          'ALBUM',
          'RECORDING',
          $3,
          NOW(),
          NOW()
        )
      `,
      [projectId, projectName, ownerId],
    );

    await pool.query('COMMIT');

    return { ownerId, projectId };
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  } finally {
    await pool.end();
  }
};

export const deleteProjectIsolationFixture = async (ownerEmail: string) => {
  assertE2EEmail(ownerEmail);

  const pool = getPool();

  try {
    await pool.query(
      `
        DELETE FROM "user"
        WHERE email = $1
      `,
      [ownerEmail],
    );
  } finally {
    await pool.end();
  }
};


export const countProjectsByOwnerEmail = async (email: string) => {
  assertE2EEmail(email);

  const pool = getPool();

  try {
    const result = await pool.query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM "project" p
        INNER JOIN "user" u ON u.id = p."ownerId"
        WHERE u.email = $1
      `,
      [email],
    );

    return Number(result.rows[0]?.count ?? 0);
  } finally {
    await pool.end();
  }
};


export const createProjectForExistingUser = async ({
  ownerEmail,
  name,
  description = null,
  type = 'OTHER',
  status = 'PLANNING',
}: {
  ownerEmail: string;
  name: string;
  description?: string | null;
  type?: 'ALBUM' | 'EP' | 'SINGLE' | 'DEMO' | 'OTHER';
  status?: 'PLANNING' | 'RECORDING' | 'MIXING' | 'MASTERING' | 'COMPLETE';
}) => {
  assertE2EEmail(ownerEmail);

  const pool = getPool();
  const projectId = randomUUID();

  try {
    const ownerResult = await pool.query<{ id: string }>(
      `
        SELECT id
        FROM "user"
        WHERE email = $1
        LIMIT 1
      `,
      [ownerEmail],
    );

    const ownerId = ownerResult.rows[0]?.id;

    if (!ownerId) {
      throw new Error(`Unable to find E2E user for ${ownerEmail}.`);
    }

    await pool.query(
      `
        INSERT INTO "project" (
          id,
          name,
          description,
          type,
          status,
          "ownerId",
          "createdAt",
          "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `,
      [projectId, name, description, type, status, ownerId],
    );

    return projectId;
  } finally {
    await pool.end();
  }
};
