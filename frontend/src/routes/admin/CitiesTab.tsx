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
import { StatusSpinning } from '@/components/status/status-spinning';
import { useAuth } from '@/lib/providers/auth/useAuth';
import type { User } from '@/lib/contexts';
import {
  archiveAdminCity,
  createAdminCity,
  getAdminCities,
  updateAdminCity,
  type AdminCity,
  type AdminCityPayload,
} from '@/services/admin/locations';

export default function CitiesTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<AdminCity | null>(null);
  const [form, setForm] = useState<AdminCityPayload>({ name: '' });
  const [cityToArchive, setCityToArchive] = useState<AdminCity | null>(null);

  const resetEditorState = () => {
    setEditingCity(null);
    setForm({ name: '' });
  };

  const closeEditor = () => {
    setEditorOpen(false);
    resetEditorState();
  };

  const citiesQuery = useQuery({
    queryKey: ['admin-cities'],
    queryFn: () => getAdminCities(user as User),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: AdminCityPayload) =>
      editingCity
        ? updateAdminCity(user as User, editingCity.id, payload)
        : createAdminCity(user as User, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
      closeEditor();
      toast.success(editingCity ? 'Město aktualizováno' : 'Město vytvořeno');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: number) => archiveAdminCity(user as User, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
      setCityToArchive(null);
      toast.success('Město archivováno');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openCreateEditor = () => {
    resetEditorState();
    setEditorOpen(true);
  };

  const openEditEditor = useCallback((city: AdminCity) => {
    setEditingCity(city);
    setForm({ name: city.name });
    setEditorOpen(true);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error('Název je povinný');
      return;
    }
    saveMutation.mutate({ name: form.name.trim() });
  };

  const columns = useMemo<ColumnDef<AdminCity>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Název',
      },
      {
        id: 'archived',
        header: 'Archivováno',
        cell: ({ row }) => (
          <Badge
            variant={row.original.archived_at ? 'secondary' : 'outline'}
            title={row.original.archived_at ? 'Archivováno' : 'Aktivní'}
          />
        ),
      },
      {
        id: 'actions',
        header: 'Akce',
        cell: ({ row }) => (
          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              size='icon-sm'
              ariaLabel={`Upravit ${row.original.name}`}
              onClick={() => openEditEditor(row.original)}
            >
              <Pencil aria-hidden='true' />
            </Button>
            <Button
              type='button'
              variant='destructive'
              size='icon-sm'
              ariaLabel={`Archivovat ${row.original.name}`}
              disabled={
                archiveMutation.isPending || row.original.archived_at !== null
              }
              onClick={() => setCityToArchive(row.original)}
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
          Celkem: {citiesQuery.data?.length ?? 0}
        </Text>
        <Button type='button' onClick={openCreateEditor}>
          <Plus aria-hidden='true' />
          Přidat město
        </Button>
      </div>

      {citiesQuery.isLoading && <StatusSpinning />}

      {citiesQuery.isError && (
        <Alert
          variant='destructive'
          title='Nepodařilo se načíst města'
          description={
            citiesQuery.error instanceof Error
              ? citiesQuery.error.message
              : 'Neznámá chyba'
          }
        />
      )}

      {citiesQuery.data && (
        <div className='overflow-x-auto rounded-lg border'>
          <Table
            columns={columns}
            data={citiesQuery.data}
            dataTestId='admin-cities-table'
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
            {editingCity ? 'Upravit město' : 'Přidat město'}
          </span>
        }
        description='Spravujte název města.'
        className='text-card-foreground'
        footer={
          <>
            <Button
              type='button'
              variant='outline'
              onClick={closeEditor}
              disabled={saveMutation.isPending}
            >
              Zrušit
            </Button>
            <Button
              type='submit'
              form='admin-city-editor-form'
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Ukládám...' : 'Uložit'}
            </Button>
          </>
        }
      >
        <form id='admin-city-editor-form' onSubmit={handleSubmit}>
          <InputField
            fieldLabel='Název'
            fieldPlaceholder='Název města'
            fieldDescription=''
            type='text'
            value={form.name}
            onChange={value => setForm({ name: value })}
            isRequired
            isDisabled={saveMutation.isPending}
          />
        </form>
      </Dialog>

      <AlertDialog
        open={cityToArchive !== null}
        onOpenChange={open => {
          if (!open) setCityToArchive(null);
        }}
        title='Archivovat město'
        description={
          cityToArchive
            ? `Archivovat ${cityToArchive.name}? Město zůstane viditelné v tomto seznamu.`
            : ''
        }
        actionLabel={archiveMutation.isPending ? 'Archivuji...' : 'Archivovat'}
        cancelLabel='Zrušit'
        onAction={() => {
          if (cityToArchive) {
            archiveMutation.mutate(cityToArchive.id);
          }
        }}
      />
    </section>
  );
}
