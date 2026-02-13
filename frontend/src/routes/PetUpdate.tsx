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
import { useParams } from 'react-router';
import { getEmployees, type Employee } from '@/services/employees/employees';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Pet's name must be at least two characters long.")
    .max(20, "Pet's name must be at most twenty characters long."),
  owner_id: z.string().nonempty('Write an ID'),
});

export default function PetUpdate() {
  const { user } = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      owner_id: '',
    },
  });
  const params = useParams();
  const id: number = Number(params.id);
  const mutation = useMutation({
    mutationKey: [`pet-detail-${id}`],
    mutationFn: async (data: OfficePetUpdateType) => updatePet(id, data, user),
  });
  const query = useQuery({
    queryKey: ['employees'],
    queryFn: async () => getEmployees(user),
  });
  const employees = query.data ?? [];
  return (
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
                    onValueChange={(employee: Employee | null) => {
                      field.onChange(employee ? employee.id : '');
                    }}
                    items={employees}
                    itemToStringValue={(employee: Employee) => employee.name}
                    itemToStringLabel={(employee: Employee) => employee.name}
                  >
                    <ComboboxInput
                      placeholder='Please select an employee'
                      id='form-pet-create-owner'
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>No employees found</ComboboxEmpty>
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
            <Button type='submit' form='form-pet-update' variant='outline'>
              Submit
            </Button>
          </Field>
        </FieldGroup>
      </div>
    </>
  );
}
