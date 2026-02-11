import { Controller, useForm } from 'react-hook-form';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { useMutation } from '@tanstack/react-query';
import {
  createPet,
  type OfficePetCreateType,
} from '@/services/office_pets/create_pet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Pet's name must be at least two characters long.")
    .max(20, "Pet's name must be at most twenty characters long."),
  owner_id: z.string().nonempty('Write the ID'),
  species: z.string().min(2, 'Write a species'),
  race: z.string().min(2, 'Write a race'),
});

export default function PetCreate() {
  const { user } = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      owner_id: '',
      species: '',
      race: '',
    },
  });
  const mutation = useMutation({
    mutationKey: ['pet-create'],
    mutationFn: async (data: OfficePetCreateType) => createPet(data, user),
  });

  return (
    <>
      <h1 className='p-3'>Create a Pet</h1>
      <div className='w-full border-solid border-2 p-3'>
        <form
          id='form-pet-create'
          onSubmit={form.handleSubmit(data => mutation.mutate(data))}
        >
          <FieldGroup>
            <Controller
              name='name'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='form-pet-create-name'>
                    Pet Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id='form-pet-create-name'
                    aria-invalid={fieldState.invalid}
                    autoComplete='off'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name='owner_id'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='form-pet-create-owner'>
                    Pet owner ID
                  </FieldLabel>
                  <Input {...field} id='form-pet-create-owner' />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name='species'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='form-pet-create-species'>
                    Pet Species
                  </FieldLabel>
                  <Input
                    {...field}
                    id='form-pet-create-species'
                    aria-invalid={fieldState.invalid}
                    autoComplete='off'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name='race'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='form-pet-create-race'>
                    Pet Race
                  </FieldLabel>
                  <Input
                    {...field}
                    id='form-pet-create-race'
                    aria-invalid={fieldState.invalid}
                    autoComplete='off'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <FieldGroup>
          <Field orientation='horizontal'>
            <Button
              type='button'
              variant='outline'
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button type='submit' form='form-pet-create' variant='outline'>
              Submit
            </Button>
          </Field>
        </FieldGroup>
      </div>
    </>
  );
}
