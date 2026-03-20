import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
  UseFormResetField,
} from 'react-hook-form';
import { Input } from './ui/input';
import { useState, type RefObject } from 'react';
import { Button } from './ui/button';
import { Trash } from 'lucide-react';

type DropZoneProps<T extends FieldValues> = {
  fieldState: ControllerFieldState;
  field: ControllerRenderProps<T, Path<T>>;
  fileRef: RefObject<HTMLInputElement | null>;
  id: string;
  resetField: UseFormResetField<T>;
  'data-testid'?: string;
};

export default function DropZone<T extends FieldValues>({
  fileRef,
  field,
  fieldState,
  id,
  resetField,
  'data-testid': testId,
}: DropZoneProps<T>) {
  const [dragging, setDragging] = useState<boolean>(false);
  return (
    <>
      <div
        role='button'
        data-testid={testId}
        data-invalid={fieldState.invalid}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => {
          e.preventDefault();
        }}
        onDragEnter={() => {
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) field.onChange(file);
          setDragging(false);
        }}
        className={[
          'flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 text-center transition',
          'hover:bg-muted/50',
          fieldState.invalid
            ? 'border-destructive/60 bg-destructive/5'
            : 'border-muted-foreground/25',
          dragging ? 'bg-muted/50' : '',
        ].join(' ')}
      >
        <div className='text-sm text-muted-foreground'>
          <span className='font-medium text-foreground'>Click to upload</span>{' '}
          or drag and drop
        </div>

        <div className='text-xs text-muted-foreground'>
          {field.value ? (
            <>
              Selected:{' '}
              <span className='text-foreground'>{field.value.name}</span>
            </>
          ) : (
            'Supported formats: PNG, JPG'
          )}
        </div>

        {field.value && (
          <Button
            id='deletion-button'
            type='button'
            variant={'outline'}
            onClick={e => {
              e.stopPropagation();
              resetField(field.name);
            }}
          >
            <Trash /> Reset image
          </Button>
        )}
      </div>

      <Input
        ref={fileRef}
        id={id}
        type='file'
        accept='image/jpg, image/jpeg, image/png'
        className='hidden'
        onChange={event => {
          const file = event.target.files?.[0];
          field.onChange(file);
        }}
      />
    </>
  );
}
