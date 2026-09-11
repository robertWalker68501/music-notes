import * as z from 'zod';

export const projectTypes = ['ALBUM', 'EP', 'SINGLE', 'DEMO', 'OTHER'] as const;
export const projectStatuses = [
  'PLANNING',
  'RECORDING',
  'MIXING',
  'MASTERING',
  'COMPLETE',
] as const;

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(120, 'Project name must be 120 characters or fewer'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description must be 2,000 characters or fewer')
    .optional()
    .default(''),
  type: z.enum(projectTypes),
  status: z.enum(projectStatuses),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const projectTypeOptions = [
  { value: 'ALBUM', label: 'Album' },
  { value: 'EP', label: 'EP' },
  { value: 'SINGLE', label: 'Single' },
  { value: 'DEMO', label: 'Demo' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const projectStatusOptions = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'RECORDING', label: 'Recording' },
  { value: 'MIXING', label: 'Mixing' },
  { value: 'MASTERING', label: 'Mastering' },
  { value: 'COMPLETE', label: 'Complete' },
] as const;

export function projectTypeLabel(value: string) {
  return projectTypeOptions.find((option) => option.value === value)?.label ?? value;
}

export function projectStatusLabel(value: string) {
  return projectStatusOptions.find((option) => option.value === value)?.label ?? value;
}
