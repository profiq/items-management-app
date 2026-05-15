import { useMemo, useState, type FormEvent } from 'react';
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
  Pagination,
  Table,
  Text,
} from '@profiq/ui';
import { Checkbox, Label, Textarea } from '@profiq/ui/components/ui/form';
import { StatusSpinning } from '@/components/status/status-spinning';
import { useAuth } from '@/lib/providers/auth/useAuth';
import type { User } from '@/lib/contexts';
import {
  archiveAdminItem,
  createAdminItem,
  getAdminCategories,
  getAdminItems,
  getAdminTags,
  updateAdminItem,
  type AdminCategory,
  type AdminItem,
  type AdminItemPayload,
  type AdminTag,
} from '@/services/admin/items';

const PAGE_SIZE = 10;

type ItemFormState = {
  name: string;
  description: string;
  imageUrl: string;
  defaultLoanDays: string;
  categoryIds: number[];
  tagIds: number[];
};

const emptyForm: ItemFormState = {
  name: '',
  description: '',
  imageUrl: '',
  defaultLoanDays: '14',
  categoryIds: [],
  tagIds: [],
};

function idsFromItems(items: Array<{ id: number }>): number[] {
  return items.map(item => item.id);
}

function formFromItem(item: AdminItem): ItemFormState {
  return {
    name: item.name,
    description: item.description ?? '',
    imageUrl: item.image_url ?? '',
    defaultLoanDays: String(item.default_loan_days),
    categoryIds: idsFromItems(item.categories),
    tagIds: idsFromItems(item.tags),
  };
}

function toPayload(form: ItemFormState): AdminItemPayload {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    image_url: form.imageUrl.trim() || null,
    default_loan_days: Number(form.defaultLoanDays),
    categoryIds: form.categoryIds,
    tagIds: form.tagIds,
  };
}

function toggleId(ids: number[], id: number, checked: boolean): number[] {
  if (checked) {
    return ids.includes(id) ? ids : [...ids, id];
  }

  return ids.filter(itemId => itemId !== id);
}

function formatCategories(categories: AdminCategory[]): string {
  if (categories.length === 0) {
    return 'None';
  }

  return categories.map(category => category.name).join(', ');
}

function formatAvailability(item: AdminItem): string {
  if (
    typeof item.available_copies_count === 'number' &&
    typeof item.copies_count === 'number'
  ) {
    return `${item.available_copies_count} / ${item.copies_count}`;
  }

  return 'Unknown';
}

type ItemEditorProps = {
  form: ItemFormState;
  item: AdminItem | null;
  categories: AdminCategory[];
  tags: AdminTag[];
  isSaving: boolean;
  onChange: (form: ItemFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function ItemEditor({
  form,
  item,
  categories,
  tags,
  isSaving,
  onChange,
  onSubmit,
}: ItemEditorProps) {
  const setField = (field: keyof ItemFormState, value: string | number[]) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <form id='admin-item-editor-form' className='space-y-4' onSubmit={onSubmit}>
      <InputField
        fieldLabel='Name'
        fieldPlaceholder='Item name'
        fieldDescription=''
        type='text'
        value={form.name}
        onChange={value => setField('name', value)}
        isRequired
        isDisabled={isSaving}
      />
      <InputField
        fieldLabel='Default loan days'
        fieldPlaceholder='14'
        fieldDescription=''
        type='number'
        value={form.defaultLoanDays}
        onChange={value => setField('defaultLoanDays', value)}
        isRequired
        isDisabled={isSaving}
      />
      <InputField
        fieldLabel='Image URL'
        fieldPlaceholder='https://example.com/image.jpg'
        fieldDescription=''
        type='url'
        value={form.imageUrl}
        onChange={value => setField('imageUrl', value)}
        isDisabled={isSaving}
      />
      <div className='space-y-2'>
        <Label htmlFor='admin-item-description'>Description</Label>
        <Textarea
          id='admin-item-description'
          value={form.description}
          onChange={event => setField('description', event.target.value)}
          placeholder='Item description'
          disabled={isSaving}
        />
      </div>
      <fieldset className='space-y-2'>
        <legend>
          <Text as='span' size='sm' weight='medium'>
            Categories
          </Text>
        </legend>
        <div className='grid gap-2 sm:grid-cols-2'>
          {categories.map(category => (
            <div key={category.id} className='flex items-center gap-2'>
              <Checkbox
                id={`admin-item-category-${category.id}`}
                name='categoryIds'
                checked={form.categoryIds.includes(category.id)}
                disabled={isSaving}
                onCheckedChange={checked =>
                  setField(
                    'categoryIds',
                    toggleId(form.categoryIds, category.id, checked === true)
                  )
                }
              />
              <Label htmlFor={`admin-item-category-${category.id}`}>
                {category.name}
              </Label>
            </div>
          ))}
          {categories.length === 0 && (
            <Text as='p' size='sm' className='text-muted-foreground'>
              No categories available.
            </Text>
          )}
        </div>
      </fieldset>
      <fieldset className='space-y-2'>
        <legend>
          <Text as='span' size='sm' weight='medium'>
            Tags
          </Text>
        </legend>
        <div className='grid gap-2 sm:grid-cols-2'>
          {tags.map(tag => (
            <div key={tag.id} className='flex items-center gap-2'>
              <Checkbox
                id={`admin-item-tag-${tag.id}`}
                name='tagIds'
                checked={form.tagIds.includes(tag.id)}
                disabled={isSaving}
                onCheckedChange={checked =>
                  setField(
                    'tagIds',
                    toggleId(form.tagIds, tag.id, checked === true)
                  )
                }
              />
              <Label htmlFor={`admin-item-tag-${tag.id}`}>{tag.name}</Label>
            </div>
          ))}
          {tags.length === 0 && (
            <Text as='p' size='sm' className='text-muted-foreground'>
              No tags available.
            </Text>
          )}
        </div>
      </fieldset>
      {item?.archived_at && (
        <Alert
          variant='default'
          description='This item is archived. Saving changes keeps it archived.'
        />
      )}
    </form>
  );
}

export default function AdminItems() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminItem | null>(null);
  const [form, setForm] = useState<ItemFormState>(emptyForm);
  const [itemToArchive, setItemToArchive] = useState<AdminItem | null>(null);

  const itemsQuery = useQuery({
    queryKey: ['admin-items', page, PAGE_SIZE],
    queryFn: () => getAdminItems(user as User, { page, limit: PAGE_SIZE }),
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => getAdminCategories(user as User),
  });

  const tagsQuery = useQuery({
    queryKey: ['admin-tags'],
    queryFn: () => getAdminTags(user as User),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: AdminItemPayload) =>
      editingItem
        ? updateAdminItem(user as User, editingItem.id, payload)
        : createAdminItem(user as User, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      setEditorOpen(false);
      setEditingItem(null);
      setForm(emptyForm);
      toast.success(editingItem ? 'Item updated' : 'Item created');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: number) => archiveAdminItem(user as User, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      setItemToArchive(null);
      toast.success('Item archived');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openCreateEditor = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setEditorOpen(true);
  };

  const openEditEditor = (item: AdminItem) => {
    setEditingItem(item);
    setForm(formFromItem(item));
    setEditorOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = toPayload(form);

    if (!payload.name) {
      toast.error('Name is required');
      return;
    }

    if (
      !Number.isInteger(payload.default_loan_days) ||
      payload.default_loan_days < 1
    ) {
      toast.error('Default loan days must be a positive whole number');
      return;
    }

    saveMutation.mutate(payload);
  };

  const columns = useMemo<ColumnDef<AdminItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        id: 'categories',
        header: 'Categories',
        cell: ({ row }) => formatCategories(row.original.categories),
      },
      {
        id: 'availability',
        header: 'Availability',
        cell: ({ row }) => formatAvailability(row.original),
      },
      {
        id: 'archived',
        header: 'Archived',
        cell: ({ row }) => (
          <Badge
            variant={row.original.archived_at ? 'secondary' : 'outline'}
            title={row.original.archived_at ? 'Archived' : 'Active'}
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
              onClick={() => setItemToArchive(row.original)}
            >
              <Archive aria-hidden='true' />
            </Button>
          </div>
        ),
      },
    ],
    [archiveMutation.isPending]
  );

  const total = itemsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className='mx-auto flex w-full max-w-7xl flex-col gap-6 p-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <Text as='h1' size='2xl' weight='bold'>
            Admin Items
          </Text>
          <Text as='p' size='sm' className='text-muted-foreground'>
            {total} item{total === 1 ? '' : 's'}
          </Text>
        </div>
        <Button type='button' onClick={openCreateEditor}>
          <Plus aria-hidden='true' />
          Create Item
        </Button>
      </div>

      {itemsQuery.isLoading && <StatusSpinning />}

      {itemsQuery.isError && (
        <Alert
          variant='destructive'
          title='Items could not be loaded'
          description={
            itemsQuery.error instanceof Error
              ? itemsQuery.error.message
              : 'Unknown error'
          }
        />
      )}

      {itemsQuery.data && (
        <>
          <div className='overflow-x-auto rounded-lg border'>
            <Table
              columns={columns}
              data={itemsQuery.data.data}
              dataTestId='admin-items-table'
            />
          </div>
          <div className='flex justify-end'>
            <Pagination
              totalPages={totalPages}
              currentPage={page}
              onPageChange={setPage}
              dataTestId='admin-items-pagination'
            />
          </div>
        </>
      )}

      <Dialog
        open={editorOpen}
        onOpenChange={open => {
          setEditorOpen(open);
          if (!open) {
            setEditingItem(null);
            setForm(emptyForm);
          }
        }}
        title={
          <span className='text-foreground'>
            {editingItem ? 'Edit Item' : 'Create Item'}
          </span>
        }
        description='Manage catalog item details, categories, and tags.'
        className='max-h-[90vh] overflow-y-auto text-card-foreground sm:max-w-2xl'
        footer={
          <>
            <Button
              type='button'
              variant='outline'
              onClick={() => setEditorOpen(false)}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              form='admin-item-editor-form'
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        {(categoriesQuery.isLoading || tagsQuery.isLoading) && (
          <StatusSpinning />
        )}
        {(categoriesQuery.isError || tagsQuery.isError) && (
          <Alert
            variant='destructive'
            title='Editor data could not be loaded'
            description='Categories or tags are unavailable.'
          />
        )}
        {categoriesQuery.data && tagsQuery.data && (
          <ItemEditor
            form={form}
            item={editingItem}
            categories={categoriesQuery.data}
            tags={tagsQuery.data}
            isSaving={saveMutation.isPending}
            onChange={setForm}
            onSubmit={handleSubmit}
          />
        )}
      </Dialog>

      <AlertDialog
        open={itemToArchive !== null}
        onOpenChange={open => {
          if (!open) {
            setItemToArchive(null);
          }
        }}
        title='Archive item'
        description={
          itemToArchive
            ? `Archive ${itemToArchive.name}? It will remain visible in this admin list.`
            : ''
        }
        actionLabel={archiveMutation.isPending ? 'Archiving...' : 'Archive'}
        cancelLabel='Cancel'
        onAction={() => {
          if (itemToArchive) {
            archiveMutation.mutate(itemToArchive.id);
          }
        }}
      />
    </section>
  );
}
