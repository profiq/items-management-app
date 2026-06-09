import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Alert,
  AlertDialog,
  Button,
  Dialog,
  InputField,
  Table,
  Text,
} from '@profiq/ui';
import { AdminBackButton } from '@/components/AdminBackButton';
import { StatusSpinning } from '@/components/status/status-spinning';
import { useAuth } from '@/lib/providers/auth/useAuth';
import type { User } from '@/lib/contexts';
import {
  createAdminTag,
  deleteAdminTag,
  getAdminTags,
  updateAdminTag,
  type AdminTag,
  type AdminTagPayload,
} from '@/services/admin/tags';

export default function AdminTags() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<AdminTag | null>(null);
  const [form, setForm] = useState<AdminTagPayload>({ name: '' });
  const [tagToDelete, setTagToDelete] = useState<AdminTag | null>(null);

  const resetEditorState = () => {
    setEditingTag(null);
    setForm({ name: '' });
  };

  const closeEditor = () => {
    setEditorOpen(false);
    resetEditorState();
  };

  const tagsQuery = useQuery({
    queryKey: ['admin-tags'],
    queryFn: () => getAdminTags(user as User),
  });

  const saveMutation = useMutation({
    // Capture the edit target in the mutation variables so onSuccess does not
    // depend on the mutable `editingTag` state, which could change before the
    // request resolves.
    mutationFn: ({
      tag,
      payload,
    }: {
      tag: AdminTag | null;
      payload: AdminTagPayload;
    }) =>
      tag
        ? updateAdminTag(user as User, tag.id, payload)
        : createAdminTag(user as User, payload),
    onSuccess: (_data, { tag }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      closeEditor();
      toast.success(tag ? 'Tag updated' : 'Tag created');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminTag(user as User, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      setTagToDelete(null);
      toast.success('Tag deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openCreateEditor = () => {
    resetEditorState();
    setEditorOpen(true);
  };

  const openEditEditor = useCallback((tag: AdminTag) => {
    setEditingTag(tag);
    setForm({ name: tag.name });
    setEditorOpen(true);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    saveMutation.mutate({
      tag: editingTag,
      payload: { name: form.name.trim() },
    });
  };

  const columns = useMemo<ColumnDef<AdminTag>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
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
              ariaLabel={`Delete ${row.original.name}`}
              disabled={deleteMutation.isPending}
              onClick={() => setTagToDelete(row.original)}
            >
              <Trash2 aria-hidden='true' />
            </Button>
          </div>
        ),
      },
    ],
    [deleteMutation.isPending, openEditEditor]
  );

  return (
    <section className='mx-auto flex w-full max-w-7xl flex-col gap-6 p-4'>
      <AdminBackButton />
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <Text as='h1' size='2xl' weight='bold' className='heading-accent'>
            Tag management
          </Text>
          <Text as='p' size='sm' className='text-muted-foreground'>
            Total: {tagsQuery.data?.length ?? 0}
          </Text>
        </div>
        <Button type='button' onClick={openCreateEditor}>
          <Plus aria-hidden='true' />
          Add tag
        </Button>
      </div>

      {tagsQuery.isLoading && <StatusSpinning />}

      {tagsQuery.isError && (
        <Alert
          variant='destructive'
          title='Failed to load tags'
          description={
            tagsQuery.error instanceof Error
              ? tagsQuery.error.message
              : 'Unknown error'
          }
        />
      )}

      {tagsQuery.data && (
        <div className='overflow-x-auto rounded-lg border'>
          <Table
            columns={columns}
            data={tagsQuery.data}
            dataTestId='admin-tags-table'
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
            {editingTag ? 'Edit tag' : 'Add tag'}
          </span>
        }
        description='Manage the tag name.'
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
              form='admin-tag-editor-form'
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        <form id='admin-tag-editor-form' onSubmit={handleSubmit}>
          <InputField
            fieldLabel='Name'
            fieldPlaceholder='Tag name'
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
        open={tagToDelete !== null}
        onOpenChange={open => {
          if (!open) setTagToDelete(null);
        }}
        title='Delete tag'
        description={
          tagToDelete
            ? `Delete "${tagToDelete.name}"? This will remove the tag from all items.`
            : ''
        }
        actionLabel={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        cancelLabel='Cancel'
        onAction={() => {
          if (tagToDelete) {
            deleteMutation.mutate(tagToDelete.id);
          }
        }}
      />
    </section>
  );
}
