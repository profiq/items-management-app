import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Archive, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, Badge, Button, Table, Text } from '@profiq/ui';
import { Label } from '@profiq/ui/components/ui/form';
import { StatusSpinning } from '@/components/status/status-spinning';
import { useAuth } from '@/lib/providers/auth/useAuth';
import type { User } from '@/lib/contexts';
import {
  archiveAdminCopy,
  createAdminCopy,
  getAdminItem,
  getAdminLocations,
  updateAdminCopy,
  type AdminCopy,
  type AdminCopyPayload,
} from '@/services/admin/items';

const CONDITIONS = ['good', 'damaged', 'lost'] as const;
type Condition = (typeof CONDITIONS)[number];

type CopyFormState = {
  location_id: string;
  condition: string;
};

const emptyCopyForm: CopyFormState = { location_id: '', condition: '' };

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

function conditionLabel(condition: string | null): string {
  if (!condition) return '—';
  return condition.charAt(0).toUpperCase() + condition.slice(1);
}

type CopiesSectionProps = {
  itemId: number;
};

export function CopiesSection({ itemId }: CopiesSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [copyForm, setCopyForm] = useState<CopyFormState>(emptyCopyForm);
  const [editingCopyId, setEditingCopyId] = useState<number | null>(null);
  const [formVisible, setFormVisible] = useState(false);

  const itemQuery = useQuery({
    queryKey: ['admin-item', itemId],
    queryFn: () => getAdminItem(user as User, itemId),
  });

  const locationsQuery = useQuery({
    queryKey: ['admin-locations'],
    queryFn: () => getAdminLocations(user as User),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-item', itemId] });
    queryClient.invalidateQueries({ queryKey: ['admin-items'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: AdminCopyPayload) =>
      createAdminCopy(user as User, itemId, payload),
    onSuccess: () => {
      invalidate();
      setFormVisible(false);
      setCopyForm(emptyCopyForm);
      toast.success('Copy added');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      copyId,
      payload,
    }: {
      copyId: number;
      payload: AdminCopyPayload;
    }) => updateAdminCopy(user as User, itemId, copyId, payload),
    onSuccess: () => {
      invalidate();
      setFormVisible(false);
      setEditingCopyId(null);
      setCopyForm(emptyCopyForm);
      toast.success('Copy updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const archiveMutation = useMutation({
    mutationFn: (copyId: number) =>
      archiveAdminCopy(user as User, itemId, copyId),
    onSuccess: () => {
      invalidate();
      toast.success('Copy archived');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    archiveMutation.isPending;

  const closeForm = () => {
    setFormVisible(false);
    setEditingCopyId(null);
    setCopyForm(emptyCopyForm);
  };

  const openAddForm = () => {
    setEditingCopyId(null);
    setCopyForm(emptyCopyForm);
    setFormVisible(true);
  };

  const openEditForm = useCallback((copy: AdminCopy) => {
    setEditingCopyId(copy.id);
    setCopyForm({
      location_id: String(copy.location_id),
      condition: copy.condition ?? '',
    });
    setFormVisible(true);
  }, []);

  const handleArchiveCopy = useCallback(
    (copyId: number) => archiveMutation.mutate(copyId),
    [archiveMutation]
  );

  const handleSubmit = () => {
    const locationId = Number(copyForm.location_id);
    if (!locationId) {
      toast.error('Location is required');
      return;
    }
    const payload: AdminCopyPayload = {
      location_id: locationId,
      condition: (copyForm.condition as Condition) || null,
    };
    if (editingCopyId !== null) {
      updateMutation.mutate({ copyId: editingCopyId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const copies = itemQuery.data?.copies ?? [];
  const locations = (locationsQuery.data ?? []).filter(l => !l.archived_at);

  const columns = useMemo<ColumnDef<AdminCopy>[]>(
    () => [
      {
        id: 'location',
        header: 'Location',
        cell: ({ row }) =>
          row.original.location?.name ?? `ID ${row.original.location_id}`,
      },
      {
        id: 'condition',
        header: 'Condition',
        cell: ({ row }) => (
          <Badge
            variant='outline'
            title={conditionLabel(row.original.condition)}
          />
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              size='icon-sm'
              ariaLabel={`Edit copy ${row.original.id}`}
              disabled={isMutating}
              onClick={() => openEditForm(row.original)}
            >
              <Pencil aria-hidden='true' />
            </Button>
            <Button
              type='button'
              variant='destructive'
              size='icon-sm'
              ariaLabel={`Archive copy ${row.original.id}`}
              disabled={isMutating}
              onClick={() => handleArchiveCopy(row.original.id)}
            >
              <Archive aria-hidden='true' />
            </Button>
          </div>
        ),
      },
    ],
    [isMutating, openEditForm, handleArchiveCopy]
  );

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <Text as='h3' size='sm' weight='semibold'>
          Copies ({copies.length})
        </Text>
        <Button
          type='button'
          size='sm'
          disabled={isMutating}
          onClick={openAddForm}
        >
          <Plus aria-hidden='true' />
          Add copy
        </Button>
      </div>

      {itemQuery.isLoading && <StatusSpinning />}

      {itemQuery.isError && (
        <Alert variant='destructive' description='Failed to load copies.' />
      )}

      {copies.length > 0 && (
        <div className='rounded-lg border'>
          <Table columns={columns} data={copies} />
        </div>
      )}

      {copies.length === 0 && !itemQuery.isLoading && (
        <Text as='p' size='sm' className='text-muted-foreground'>
          No copies yet.
        </Text>
      )}

      {formVisible && (
        <div className='space-y-3 rounded-lg border p-4'>
          <Text as='h4' size='sm' weight='medium'>
            {editingCopyId !== null ? 'Edit copy' : 'New copy'}
          </Text>

          <div className='space-y-2'>
            <Label htmlFor='copy-location'>Location</Label>
            <select
              id='copy-location'
              value={copyForm.location_id}
              disabled={isMutating || locationsQuery.isLoading}
              onChange={e =>
                setCopyForm(f => ({ ...f, location_id: e.target.value }))
              }
              className={selectClass}
            >
              <option value=''>Select location…</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='copy-condition'>Condition</Label>
            <select
              id='copy-condition'
              value={copyForm.condition}
              disabled={isMutating}
              onChange={e =>
                setCopyForm(f => ({ ...f, condition: e.target.value }))
              }
              className={selectClass}
            >
              <option value=''>None</option>
              {CONDITIONS.map(c => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={isMutating}
              onClick={closeForm}
            >
              Cancel
            </Button>
            <Button
              type='button'
              size='sm'
              disabled={isMutating}
              onClick={handleSubmit}
            >
              {isMutating ? 'Saving…' : 'Save copy'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
