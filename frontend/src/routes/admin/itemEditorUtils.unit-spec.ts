import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildStorageObjectName,
  isHttpImageUrl,
  toPayload,
  type ItemFormState,
} from './itemEditorUtils';

function buildFile(name: string, type: string): File {
  return new File(['image'], name, { type });
}

describe('itemEditorUtils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isHttpImageUrl', () => {
    it('allows http and https URLs', () => {
      expect(isHttpImageUrl('https://example.com/image.png')).toBe(true);
      expect(isHttpImageUrl('http://example.com/image.png')).toBe(true);
    });

    it('rejects non-http URLs', () => {
      expect(isHttpImageUrl('data:image/svg+xml,<svg></svg>')).toBe(false);
      expect(isHttpImageUrl('javascript:alert(1)')).toBe(false);
      expect(isHttpImageUrl('/images/item.png')).toBe(false);
      expect(isHttpImageUrl('images/item.png')).toBe(false);
      expect(isHttpImageUrl('not a url')).toBe(false);
      expect(isHttpImageUrl('')).toBe(false);
    });
  });

  describe('buildStorageObjectName', () => {
    it.each([
      ['image/jpeg', 'jpg'],
      ['image/png', 'png'],
      ['image/webp', 'webp'],
    ])('uses a UUID and the %s extension', (type, extension) => {
      vi.spyOn(crypto, 'randomUUID').mockReturnValue(
        '00000000-0000-4000-8000-000000000001'
      );

      expect(buildStorageObjectName(buildFile('../foo.png', type))).toBe(
        `items/00000000-0000-4000-8000-000000000001.${extension}`
      );
    });

    it('does not include the user-controlled file name', () => {
      vi.spyOn(crypto, 'randomUUID').mockReturnValue(
        '00000000-0000-4000-8000-000000000002'
      );

      const objectName = buildStorageObjectName(
        buildFile('../nested/evil name.png', 'image/png')
      );

      expect(objectName).toBe('items/00000000-0000-4000-8000-000000000002.png');
      expect(objectName).not.toContain('evil');
      expect(objectName).not.toContain('..');
      expect(objectName.slice('items/'.length)).not.toContain('/');
    });
  });

  describe('toPayload', () => {
    it('trims text fields and converts blank optional fields to null', () => {
      const form: ItemFormState = {
        name: '  Laptop  ',
        description: '   ',
        imageUrl: '  https://example.com/laptop.png  ',
        defaultLoanDays: '14',
        categoryIds: [1],
        tagIds: [2],
      };

      expect(toPayload(form)).toEqual({
        name: 'Laptop',
        description: null,
        image_url: 'https://example.com/laptop.png',
        default_loan_days: 14,
        categoryIds: [1],
        tagIds: [2],
      });
    });

    it('uses null for blank image URLs', () => {
      const form: ItemFormState = {
        name: 'Projector',
        description: 'Video',
        imageUrl: '   ',
        defaultLoanDays: '7',
        categoryIds: [],
        tagIds: [],
      };

      expect(toPayload(form).image_url).toBeNull();
    });
  });
});
