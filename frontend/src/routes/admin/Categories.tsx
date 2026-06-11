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
import { AdminBackButton } from '@/components/AdminBackButton';
import { StatusSpinning } from '@/components/status/status-spinning';
import { useAuth } from '@/lib/providers/auth/useAuth';
import type { User } from '@/lib/contexts';
import {
  archiveAdminCategory,
  createAdminCategory,
  getAdminCategories,
  updateAdminCategory,
  type AdminCategory,
  type AdminCategoryPayload,
} from '@/services/admin/categories';

export default function AdminCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(
    null
  );
  const [form, setForm] = useState<AdminCategoryPayload>({ name: '' });
  const [categoryToArchive, setCategoryToArchive] =
    useState<AdminCategory | null>(null);

  const resetEditorState = () => {
    setEditingCategory(null);
    setForm({ name: '' });
  };

  const closeEditor = () => {
    setEditorOpen(false);
    resetEditorState();
  };

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => getAdminCategories(user as User),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: AdminCategoryPayload) =>
      editingCategory
        ? updateAdminCategory(user as User, editingCategory.id, payload)
        : createAdminCategory(user as User, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      closeEditor();
      toast.success(editingCategory ? 'Category updated' : 'Category created');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: number) => archiveAdminCategory(user as User, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setCategoryToArchive(null);
      toast.success('Category archived');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openCreateEditor = () => {
    resetEditorState();
    setEditorOpen(true);
  };

  const openEditEditor = useCallback((category: AdminCategory) => {
    setEditingCategory(category);
    setForm({ name: category.name });
    setEditorOpen(true);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    saveMutation.mutate({ name: form.name.trim() });
  };

  const columns = useMemo<ColumnDef<AdminCategory>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
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
              disabled={row.original.archived_at !== null}
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
              onClick={() => setCategoryToArchive(row.original)}
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
    <section className='mx-auto flex w-full max-w-7xl flex-col gap-6 p-4'>
      <AdminBackButton />
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <Text as='h1' size='2xl' weight='bold' className='heading-accent'>
            Category management
          </Text>
          <Text as='p' size='sm' className='text-muted-foreground'>
            Total: {categoriesQuery.data?.length ?? 0}
          </Text>
        </div>
        <Button type='button' onClick={openCreateEditor}>
          <Plus aria-hidden='true' />
          Add category
        </Button>
      </div>

      {categoriesQuery.isLoading && <StatusSpinning />}

      {categoriesQuery.isError && (
        <Alert
          variant='destructive'
          title='Failed to load categories'
          description={
            categoriesQuery.error instanceof Error
              ? categoriesQuery.error.message
              : 'Unknown error'
          }
        />
      )}

      {categoriesQuery.data && (
        <div className='overflow-x-auto rounded-lg border'>
          <Table
            columns={columns}
            data={categoriesQuery.data}
            dataTestId='admin-categories-table'
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
            {editingCategory ? 'Edit category' : 'Add category'}
          </span>
        }
        description='Manage the category name.'
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
              form='admin-category-editor-form'
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        <form id='admin-category-editor-form' onSubmit={handleSubmit}>
          <InputField
            fieldLabel='Name'
            fieldPlaceholder='Category name'
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
        open={categoryToArchive !== null}
        onOpenChange={open => {
          if (!open) setCategoryToArchive(null);
        }}
        title='Archive category'
        description={
          categoryToArchive
            ? `Archive ${categoryToArchive.name}? The category will remain visible in this list.`
            : ''
        }
        actionLabel={archiveMutation.isPending ? 'Archiving...' : 'Archive'}
        cancelLabel='Cancel'
        onAction={() => {
          if (categoryToArchive) {
            archiveMutation.mutate(categoryToArchive.id);
          }
        }}
      />
    </section>
  );
}
