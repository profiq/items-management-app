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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  updatePet,
  type OfficePetUpdateType,
} from '@/services/office_pets/update_pet';
import { useNavigate, useParams } from 'react-router';
import { getEmployees, type Employee } from '@/services/employees/employees';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { StatusSpinning } from '@/components/status/status-spinning';
import { toast } from 'sonner';
import { getOfficePet } from '@/services/office_pets/office_pet';
import { getOfficePetOwner } from '@/services/office_pets/pet_owner';
import { useEffect, useMemo, useRef, useState } from 'react';
import { fileSchema } from '@/lib/fileschema';
import DropZone from '@/components/drop-zone';

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Pet's name must be at least two characters long.")
    .max(20, "Pet's name must be at most twenty characters long."),
  owner_id: z.string().nonempty('Write an ID'),
  species: z.string().min(2, 'Write a species'),
  race: z.string().min(2, 'Write a race'),
  image_file: fileSchema,
});

export default function PetUpdate() {
  const { user } = useAuth();
  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      owner_id: '',
      image_file: undefined,
    },
  });
  const params = useParams();
  const id: number = Number(params.id);
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationKey: [`pet-detail-${id}`],
    mutationFn: async (data: OfficePetUpdateType) => updatePet(id, data, user),
    onSuccess: data => {
      toast.success('Successfully updated pet', { position: 'bottom-right' });
      navigate(`/pets/${data.id}`);
    },
    onError: error => {
      toast.error(`Could not update pet: ${error.message}`, {
        position: 'bottom-right',
      });
    },
  });
  const employees_query = useQuery({
    queryKey: ['employees'],
    queryFn: async () => getEmployees(user),
  });

  const employees = useMemo(
    () => employees_query.data ?? [],
    [employees_query.data]
  );

  const pet_query = useQuery({
    queryKey: [`pet-detail-${id}`],
    queryFn: async () => getOfficePet(id, user),
  });
  const pet = pet_query.data;

  const pet_owner_query = useQuery({
    queryKey: [`pet-owner-${id}`],
    queryFn: async () => getOfficePetOwner(id, user),
  });
  const pet_owner = pet_owner_query.data;

  const [defaultOwner, setDefaultOwner] = useState<Employee>();

  useEffect(() => {
    if (pet && pet_owner) {
      form.setValue('name', pet.name);
      form.setValue('owner_id', pet_owner.employee_id);
      form.setValue('species', pet.species);
      form.setValue('race', pet.race);
      (async () =>
        setDefaultOwner(
          employees.find(el => el.id == pet_owner.employee_id)
        ))();
    }
  }, [pet_owner, pet, employees, form]);

  const fileRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      {((mutation.isPending || !defaultOwner) && <StatusSpinning />) || (
        <>
          <h1 className='p-3'>Update a Pet</h1>
          <div className='w-full border-solid border-2 p-3'>
            <form
              id='form-pet-update'
              onSubmit={form.handleSubmit(data => mutation.mutate(data))}
            >
              <FieldGroup>
                <Controller
                  name='name'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='form-pet-update-name'>
                        Pet Name
                      </FieldLabel>
                      <Input
                        {...field}
                        id='form-pet-update-name'
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
                      <FieldLabel htmlFor='form-pet-update-owner'>
                        Pet Owner ID
                      </FieldLabel>
                      <Combobox
                        defaultInputValue={defaultOwner?.name}
                        onValueChange={(employee: Employee | null) => {
                          field.onChange(employee ? employee.id : '');
                        }}
                        items={employees}
                        itemToStringValue={(employee: Employee) =>
                          employee.name
                        }
                        itemToStringLabel={(employee: Employee) =>
                          employee.name
                        }
                      >
                        <ComboboxInput
                          placeholder='Please select an employee'
                          id='form-pet-create-owner'
                        />
                        <ComboboxContent>
                          <ComboboxEmpty>
                            {employees_query.isLoading
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
                      <FieldLabel htmlFor='form-pet-update-name'>
                        Pet species
                      </FieldLabel>
                      <Input
                        {...field}
                        id='form-pet-update-name'
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
                      <FieldLabel htmlFor='form-pet-update-name'>
                        Pet Race
                      </FieldLabel>
                      <Input
                        {...field}
                        id='form-pet-update-name'
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
                  name='image_file'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='form-pet-update-image'>
                        Pet image
                      </FieldLabel>

                      <DropZone
                        fieldState={fieldState}
                        field={field}
                        fileRef={fileRef}
                        id='form-pet-update-image'
                        resetField={form.resetField}
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
                >
                  Reset
                </Button>
                <Button
                  className='cursor-pointer'
                  type='submit'
                  form='form-pet-update'
                  variant='default'
                >
                  Submit
                </Button>
              </Field>
            </FieldGroup>
          </div>
        </>
      )}
    </>
  );
}
