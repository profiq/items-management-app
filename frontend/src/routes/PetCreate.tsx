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
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createPet,
  type OfficePetCreateType,
} from '@/services/office_pets/create_pet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { getEmployees, type Employee } from '@/services/employees/employees';
import { StatusSpinning } from '@/components/status/status-spinning';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { fileSchema } from '@/lib/fileschema';
import { useRef } from 'react';
import DropZone from '@/components/drop-zone';
import { HoverInfo } from '@/components/hover-info';

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Pet's name must be at least two characters long.")
    .max(20, "Pet's name must be at most twenty characters long."),
  owner_id: z.string().nonempty('Write the ID'),
  species: z.string().min(2, 'Write a species'),
  race: z.string().min(2, 'Write a race'),
  image_file: fileSchema,
});

export default function PetCreate() {
  const { user } = useAuth();
  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      owner_id: '',
      species: '',
      race: '',
    },
  });
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationKey: ['pet-create'],
    mutationFn: async (data: OfficePetCreateType) => createPet(data, user),
    onSuccess: data => {
      toast.success('Pet created successfully', { position: 'bottom-right' });
      navigate(`/pets/${data.id}`);
    },
    onError: error => {
      toast.error(`Failed at creating pet: ${error.message}`, {
        position: 'bottom-right',
      });
    },
  });
  const query = useQuery({
    queryKey: ['employees'],
    queryFn: async () => getEmployees(user),
  });

  const employees: Employee[] = query.data ?? [];

  const fileRef = useRef<HTMLInputElement | null>(null);
  return (
    <div data-testid='pet-create-page'>
      {mutation.isPending && <StatusSpinning />}
      <h1 className='p-3' data-testid='pet-create-title'>
        Create a Pet{' '}
        <HoverInfo
          text='For the form validation, we use zod and the form itself uses ReactHookForm.'
          iconSize={10}
          inline={true}
          readmeSection={{ label: 'Forms', id: 'forms' }}
        />
      </h1>
      <div className='w-full border-solid border-2 p-3'>
        <form
          id='form-pet-create'
          onSubmit={form.handleSubmit(data => mutation.mutate(data))}
          data-testid='pet-create-form'
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
                    data-testid='pet-create-name-input'
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
                    Pet owner ID{' '}
                    <HoverInfo
                      iconSize={4}
                      text='For ensuring we create the requested user in the database, we use an interceptor.'
                      inline={true}
                      readmeSection={{
                        label: 'Interceptors',
                        id: 'interceptors',
                      }}
                    />
                  </FieldLabel>
                  <Combobox
                    onValueChange={(employee: Employee | null) => {
                      field.onChange(employee ? employee.id : '');
                    }}
                    items={employees}
                    itemToStringValue={(employee: Employee) => employee.name}
                    itemToStringLabel={(employee: Employee) => employee.name}
                    data-testid='pet-create-owner-combobox'
                  >
                    <ComboboxInput
                      placeholder='Please select an employee'
                      id='form-pet-create-owner'
                      data-testid='pet-create-owner-input'
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>
                        {query.isLoading
                          ? 'Loading employees'
                          : 'No employees found'}
                      </ComboboxEmpty>
                      <ComboboxList>
                        {(employee: Employee) => (
                          <ComboboxItem key={employee.id} value={employee}>
                            {employee.name}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
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
                    data-testid='pet-create-species-input'
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
                    data-testid='pet-create-race-input'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name='image_file'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='form-pet-create-image'>
                    Pet image{' '}
                    <HoverInfo
                      text='We use Google Cloud Storage to save the image.'
                      iconSize={4}
                      inline={true}
                      readmeSection={{
                        label: 'Google Cloud Storage',
                        id: 'google-cloud-storage',
                      }}
                    />
                  </FieldLabel>

                  <DropZone
                    field={field}
                    fieldState={fieldState}
                    fileRef={fileRef}
                    resetField={form.resetField}
                    id='form-pet-create-image'
                    data-testid='pet-create-image-dropzone'
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <FieldGroup className='mt-3'>
          <Field orientation='horizontal'>
            <Button
              className='cursor-pointer'
              type='button'
              variant='destructive'
              onClick={() => form.reset()}
              data-testid='pet-create-reset-button'
            >
              Reset
            </Button>
            <Button
              className='cursor-pointer'
              type='submit'
              form='form-pet-create'
              variant='default'
              data-testid='pet-create-submit-button'
            >
              Submit
            </Button>
          </Field>
        </FieldGroup>
      </div>
    </div>
  );
}
