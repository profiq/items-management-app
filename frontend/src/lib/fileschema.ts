import * as z from 'zod';

const MAX_FILE_SIZE = 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

// schema is long, so it is in its own variable
export const fileSchema = z
  .union([z.instanceof(File), z.instanceof(FileList), z.undefined()])
  .optional()
  .transform(val => {
    if (val instanceof File) return val;
    if (val instanceof FileList)
      return val.length ? (val.item(0) ?? undefined) : undefined;
    return undefined;
  })
  .pipe(
    z
      .instanceof(File)
      .optional()
      .superRefine((file, ctx) => {
        if (!file) {
          return;
        }

        if (file.size > MAX_FILE_SIZE) {
          ctx.addIssue({
            code: 'too_big',
            maximum: MAX_FILE_SIZE,
            message: 'File is too big',
            origin: 'file',
            input: file,
          });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
          ctx.addIssue({
            code: 'custom',
            input: file,
            message: 'File of this type is not allowed',
          });
        }
      })
  );
