import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Archive, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Alert,
  AlertDialog,
  Badge,
  Button,
  Dialog,
  InputField,
  Table,
  Text,
} from '@profiq/ui';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@profiq/ui/components/ui/form';
import { StatusSpinning } from '@/components/status/status-spinning';
import { useAuth } from '@/lib/providers/auth/useAuth';
import type { User } from '@/lib/contexts';
import {
  archiveAdminLocation,
  createAdminLocation,
  getAdminCities,
  getAdminLocations,
  updateAdminLocation,
  type AdminCity,
  type AdminLocation,
  type AdminLocationPayload,
} from '@/services/admin/locations';

export default function LocationsTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<AdminLocation | null>(
    null
  );
  const [form, setForm] = useState<AdminLocationPayload>({
    name: '',
    city_id: 0,
  });
  const [locationToArchive, setLocationToArchive] =
    useState<AdminLocation | null>(null);

  const resetEditorState = () => {
    setEditingLocation(null);
    setForm({ name: '', city_id: 0 });
  };

  const closeEditor = () => {
    setEditorOpen(false);
    resetEditorState();
  };

  const locationsQuery = useQuery({
    queryKey: ['admin-locations'],
    queryFn: () => getAdminLocations(user as User),
  });

  const citiesQuery = useQuery({
    queryKey: ['admin-cities'],
    queryFn: () => getAdminCities(user as User),
  });

  const activeCities: AdminCity[] = useMemo(
    () => citiesQuery.data?.filter(c => c.archived_at === null) ?? [],
    [citiesQuery.data]
  );

  const saveMutation = useMutation({
    mutationFn: (payload: AdminLocationPayload) =>
      editingLocation
        ? updateAdminLocation(user as User, editingLocation.id, payload)
        : createAdminLocation(user as User, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
      closeEditor();
      toast.success(editingLocation ? 'Location updated' : 'Location created');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: number) => archiveAdminLocation(user as User, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
      setLocationToArchive(null);
      toast.success('Location archived');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openCreateEditor = () => {
    resetEditorState();
    setEditorOpen(true);
  };

  const openEditEditor = useCallback(
    (location: AdminLocation) => {
      setEditingLocation(location);
      const cityIsActive = activeCities.some(c => c.id === location.city_id);
      setForm({
        name: location.name,
        city_id: cityIsActive ? location.city_id : 0,
      });
      setEditorOpen(true);
    },
    [activeCities]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!form.city_id || !activeCities.some(c => c.id === form.city_id)) {
      toast.error('City is required');
      return;
    }
    saveMutation.mutate({ name: form.name.trim(), city_id: form.city_id });
  };

  const columns = useMemo<ColumnDef<AdminLocation>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        id: 'city',
        header: 'City',
        cell: ({ row }) => row.original.city?.name ?? '—',
      },
      {
        id: 'archived',
        header: 'Archived',
        cell: ({ row }) => (
          <Badge
            variant={row.original.archived_at ? 'secondary' : 'outline'}
            title={row.original.archived_at ? 'Archived' : 'Active'}
            isRounded
          />
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              size='icon-sm'
              ariaLabel={`Edit ${row.original.name}`}
              onClick={() => openEditEditor(row.original)}
            >
              <Pencil aria-hidden='true' />
            </Button>
            <Button
              type='button'
              variant='destructive'
              size='icon-sm'
              ariaLabel={`Archive ${row.original.name}`}
              disabled={
                archiveMutation.isPending || row.original.archived_at !== null
              }
              onClick={() => setLocationToArchive(row.original)}
            >
              <Archive aria-hidden='true' />
            </Button>
          </div>
        ),
      },
    ],
    [archiveMutation.isPending, openEditEditor]
  );

  return (
    <section className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <Text as='p' size='sm' className='text-muted-foreground'>
          Total: {locationsQuery.data?.length ?? 0}
        </Text>
        <Button type='button' onClick={openCreateEditor}>
          <Plus aria-hidden='true' />
          Add location
        </Button>
      </div>

      {locationsQuery.isLoading && <StatusSpinning />}

      {locationsQuery.isError && (
        <Alert
          variant='destructive'
          title='Failed to load locations'
          description={
            locationsQuery.error instanceof Error
              ? locationsQuery.error.message
              : 'Unknown error'
          }
        />
      )}

      {locationsQuery.data && (
        <div className='overflow-x-auto rounded-lg border'>
          <Table
            columns={columns}
            data={locationsQuery.data}
            dataTestId='admin-locations-table'
          />
        </div>
      )}

      <Dialog
        open={editorOpen}
        onOpenChange={open => {
          setEditorOpen(open);
          if (!open) resetEditorState();
        }}
        title={
          <span className='text-foreground'>
            {editingLocation ? 'Edit location' : 'Add location'}
          </span>
        }
        description='Manage the location name and assigned city.'
        className='text-card-foreground'
        footer={
          <>
            <Button
              type='button'
              variant='outline'
              onClick={closeEditor}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              form='admin-location-editor-form'
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        <form
          id='admin-location-editor-form'
          onSubmit={handleSubmit}
          className='flex flex-col gap-4'
        >
          <InputField
            fieldLabel='Name'
            fieldPlaceholder='Location name'
            fieldDescription=''
            type='text'
            value={form.name}
            onChange={value => setForm(prev => ({ ...prev, name: value }))}
            isRequired
            isDisabled={saveMutation.isPending}
          />
          <div className='flex flex-col gap-1'>
            <Text as='label' size='sm' weight='medium'>
              City
            </Text>
            <Select
              value={String(form.city_id)}
              onValueChange={(cityId: string) =>
                setForm(prev => ({ ...prev, city_id: Number(cityId) }))
              }
              disabled={saveMutation.isPending || citiesQuery.isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a city' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {activeCities.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </form>
      </Dialog>

      <AlertDialog
        open={locationToArchive !== null}
        onOpenChange={open => {
          if (!open) setLocationToArchive(null);
        }}
        title='Archive location'
        description={
          locationToArchive
            ? `Archive ${locationToArchive.name}? The location will remain visible in this list.`
            : ''
        }
        actionLabel={archiveMutation.isPending ? 'Archiving...' : 'Archive'}
        cancelLabel='Cancel'
        onAction={() => {
          if (locationToArchive) {
            archiveMutation.mutate(locationToArchive.id);
          }
        }}
      />
    </section>
  );
}
