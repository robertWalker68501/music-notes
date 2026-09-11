'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { projectSchema, type ProjectInput } from '@/lib/schemas/ProjectSchema';

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id || !session.user.emailVerified) {
    throw new Error('You must be signed in with a verified account.');
  }

  return session.user.id;
}

export type ProjectActionResult =
  | { success: true; projectId: string }
  | { success: false; error: string };

export async function createProjectAction(
  input: ProjectInput,
): Promise<ProjectActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = projectSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid project.' };
    }

    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        type: parsed.data.type,
        status: parsed.data.status,
        ownerId: userId,
      },
      select: { id: true },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/projects');

    return { success: true, projectId: project.id };
  } catch {
    return { success: false, error: 'Unable to create the project. Please try again.' };
  }
}

export async function updateProjectAction(
  projectId: string,
  input: ProjectInput,
): Promise<ProjectActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = projectSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid project.' };
    }

    const existing = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true },
    });

    if (!existing) {
      return { success: false, error: 'Project not found.' };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        type: parsed.data.type,
        status: parsed.data.status,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/projects');
    revalidatePath(`/dashboard/projects/${projectId}`);

    return { success: true, projectId };
  } catch {
    return { success: false, error: 'Unable to update the project. Please try again.' };
  }
}

export async function deleteProjectAction(projectId: string) {
  try {
    const userId = await requireUserId();

    const result = await prisma.project.deleteMany({
      where: { id: projectId, ownerId: userId },
    });

    if (result.count !== 1) {
      return { success: false as const, error: 'Project not found.' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/projects');

    return { success: true as const };
  } catch {
    return { success: false as const, error: 'Unable to delete the project. Please try again.' };
  }
}
