import type { AdminItemPayload } from '@/services/admin/items';

export const ALLOWED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
]);

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export type ItemFormState = {
  name: string;
  description: string;
  imageUrl: string;
  defaultLoanDays: string;
  categoryIds: number[];
  tagIds: number[];
};

export const emptyForm: ItemFormState = {
  name: '',
  description: '',
  imageUrl: '',
  defaultLoanDays: '14',
  categoryIds: [],
  tagIds: [],
};

export function toPayload(form: ItemFormState): AdminItemPayload {
  const imageUrl = form.imageUrl.trim();

  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    image_url: imageUrl || null,
    default_loan_days: Number(form.defaultLoanDays),
    categoryIds: form.categoryIds,
    tagIds: form.tagIds,
  };
}

export function isHttpImageUrl(url: string): boolean {
  if (!url) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
  } catch {
    return false;
  }
}

export function buildStorageObjectName(file: File): string {
  const extension = IMAGE_EXTENSIONS[file.type] ?? 'img';

  return `items/${crypto.randomUUID()}.${extension}`;
}
