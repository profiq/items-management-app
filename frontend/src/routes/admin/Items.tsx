import { useCallback, useMemo, useRef, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Archive, Pencil, Plus } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '@/firebase';
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
import { Separator } from '@profiq/ui/components/ui/layout';
import { StatusSpinning } from '@/components/status/status-spinning';
import { CopiesSection } from './CopiesSection';
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
import {
  ALLOWED_IMAGE_TYPES,
  buildStorageObjectName,
  emptyForm,
  isHttpImageUrl,
  toPayload,
  type ItemFormState,
} from './itemEditorUtils';

const PAGE_SIZE = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

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

function toggleId(ids: number[], id: number, checked: boolean): number[] {
  if (checked) {
    return ids.includes(id) ? ids : [...ids, id];
  }

  return ids.filter(itemId => itemId !== id);
}

function formatCategories(categories: AdminCategory[]): string {
  if (categories.length === 0) {
    return 'Žádná';
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

  return 'Neznámá';
}

type ItemEditorProps = {
  form: ItemFormState;
  item: AdminItem | null;
  categories: AdminCategory[];
  tags: AdminTag[];
  isSaving: boolean;
  isUploading: boolean;
  onChange: (form: ItemFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onImageUpload: (file: File) => void;
};

function ItemEditor({
  form,
  item,
  categories,
  tags,
  isSaving,
  isUploading,
  onChange,
  onSubmit,
  onImageUpload,
}: ItemEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isDisabled = isSaving || isUploading;

  const setField = (field: keyof ItemFormState, value: string | number[]) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <form id='admin-item-editor-form' className='space-y-4' onSubmit={onSubmit}>
      <InputField
        fieldLabel='Název'
        fieldPlaceholder='Název položky'
        fieldDescription=''
        type='text'
        value={form.name}
        onChange={value => setField('name', value)}
        isRequired
        isDisabled={isDisabled}
      />
      <InputField
        fieldLabel='Výchozí počet dní výpůjčky'
        fieldPlaceholder='14'
        fieldDescription=''
        type='number'
        value={form.defaultLoanDays}
        onChange={value => setField('defaultLoanDays', value)}
        isRequired
        isDisabled={isDisabled}
      />
      <div className='space-y-2'>
        <div className='flex items-end gap-2'>
          <div className='flex-1'>
            <InputField
              fieldLabel='URL obrázku'
              fieldPlaceholder='https://example.com/image.jpg'
              fieldDescription=''
              type='url'
              value={form.imageUrl}
              onChange={value => setField('imageUrl', value)}
              isDisabled={isDisabled}
            />
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isDisabled}
            onClick={() => imageInputRef.current?.click()}
          >
            {isUploading ? 'Nahrávám…' : 'Nahrát'}
          </Button>
        </div>
        {isHttpImageUrl(form.imageUrl.trim()) && (
          <img
            src={form.imageUrl}
            alt='Náhled položky'
            className='h-24 w-24 rounded-md border object-cover'
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <input
          ref={imageInputRef}
          type='file'
          accept='image/png,image/jpeg,image/webp'
          className='hidden'
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) onImageUpload(file);
            e.target.value = '';
          }}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='admin-item-description'>Popis</Label>
        <Textarea
          id='admin-item-description'
          value={form.description}
          onChange={event => setField('description', event.target.value)}
          placeholder='Popis položky'
          disabled={isDisabled}
        />
      </div>
      <fieldset className='space-y-2'>
        <legend>
          <Text as='span' size='sm' weight='medium'>
            Kategorie
          </Text>
        </legend>
        <div className='grid gap-2 sm:grid-cols-2'>
          {categories.map(category => (
            <div key={category.id} className='flex items-center gap-2'>
              <Checkbox
                id={`admin-item-category-${category.id}`}
                name='categoryIds'
                checked={form.categoryIds.includes(category.id)}
                disabled={isDisabled}
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
              Žádné kategorie.
            </Text>
          )}
        </div>
      </fieldset>
      <fieldset className='space-y-2'>
        <legend>
          <Text as='span' size='sm' weight='medium'>
            Štítky
          </Text>
        </legend>
        <div className='grid gap-2 sm:grid-cols-2'>
          {tags.map(tag => (
            <div key={tag.id} className='flex items-center gap-2'>
              <Checkbox
                id={`admin-item-tag-${tag.id}`}
                name='tagIds'
                checked={form.tagIds.includes(tag.id)}
                disabled={isDisabled}
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
              Žádné štítky.
            </Text>
          )}
        </div>
      </fieldset>
      {item?.archived_at && (
        <Alert
          variant='default'
          description='Tato položka je archivovaná. Uložením změn zůstane archivovaná.'
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const resetEditorState = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setIsUploadingImage(false);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    resetEditorState();
  };

  const itemsQuery = useQuery({
    queryKey: ['admin-items', page, PAGE_SIZE],
    queryFn: () => getAdminItems(user as User, { page, limit: PAGE_SIZE }),
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories', 'active'],
    queryFn: async () => {
      const categories = await getAdminCategories(user as User);
      return categories.filter(c => c.archived_at === null);
    },
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
      closeEditor();
      toast.success(
        editingItem ? 'Položka aktualizována' : 'Položka vytvořena'
      );
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
      toast.success('Položka archivována');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleImageUpload = async (file: File) => {
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Obrázek musí být maximálně 5 MB');
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      toast.error('Obrázek musí být PNG, JPEG nebo WebP soubor');
      return;
    }

    setIsUploadingImage(true);
    try {
      await auth.currentUser?.getIdToken(true);
      const storageRef = ref(storage, buildStorageObjectName(file));
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm(f => ({ ...f, imageUrl: url }));
      toast.success('Obrázek nahrán');
    } catch {
      toast.error('Nahrání obrázku selhalo');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const openCreateEditor = () => {
    resetEditorState();
    setEditorOpen(true);
  };

  const openEditEditor = useCallback((item: AdminItem) => {
    setEditingItem(item);
    setForm(formFromItem(item));
    setEditorOpen(true);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = toPayload(form);

    if (!payload.name) {
      toast.error('Název je povinný');
      return;
    }

    if (payload.image_url && !isHttpImageUrl(payload.image_url)) {
      toast.error('URL obrázku musí začínat http:// nebo https://');
      return;
    }

    if (
      !Number.isInteger(payload.default_loan_days) ||
      payload.default_loan_days < 1
    ) {
      toast.error('Výchozí počet dní výpůjčky musí být kladné celé číslo');
      return;
    }

    saveMutation.mutate(payload);
  };

  const columns = useMemo<ColumnDef<AdminItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Název',
      },
      {
        id: 'categories',
        header: 'Kategorie',
        cell: ({ row }) => formatCategories(row.original.categories),
      },
      {
        id: 'availability',
        header: 'Dostupnost',
        cell: ({ row }) => formatAvailability(row.original),
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
              onClick={() => setItemToArchive(row.original)}
            >
              <Archive aria-hidden='true' />
            </Button>
          </div>
        ),
      },
    ],
    [archiveMutation.isPending, openEditEditor]
  );

  const total = itemsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className='mx-auto flex w-full max-w-7xl flex-col gap-6 p-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <Text as='h1' size='2xl' weight='bold'>
            Správa položek
          </Text>
          <Text as='p' size='sm' className='text-muted-foreground'>
            Celkem: {total}
          </Text>
        </div>
        <Button type='button' onClick={openCreateEditor}>
          <Plus aria-hidden='true' />
          Přidat položku
        </Button>
      </div>

      {itemsQuery.isLoading && <StatusSpinning />}

      {itemsQuery.isError && (
        <Alert
          variant='destructive'
          title='Nepodařilo se načíst položky'
          description={
            itemsQuery.error instanceof Error
              ? itemsQuery.error.message
              : 'Neznámá chyba'
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
            resetEditorState();
          }
        }}
        title={
          <span className='text-foreground'>
            {editingItem ? 'Upravit položku' : 'Přidat položku'}
          </span>
        }
        description='Spravujte detaily katalogové položky, kategorie a štítky.'
        className='max-h-[90vh] overflow-y-auto text-card-foreground sm:max-w-2xl'
        footer={
          <>
            <Button
              type='button'
              variant='outline'
              onClick={closeEditor}
              disabled={saveMutation.isPending || isUploadingImage}
            >
              Zrušit
            </Button>
            <Button
              type='submit'
              form='admin-item-editor-form'
              disabled={saveMutation.isPending || isUploadingImage}
            >
              {saveMutation.isPending ? 'Ukládám...' : 'Uložit'}
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
            title='Nepodařilo se načíst data editoru'
            description='Kategorie nebo štítky nejsou dostupné.'
          />
        )}
        {categoriesQuery.data && tagsQuery.data && (
          <>
            <ItemEditor
              form={form}
              item={editingItem}
              categories={categoriesQuery.data}
              tags={tagsQuery.data}
              isSaving={saveMutation.isPending}
              isUploading={isUploadingImage}
              onChange={setForm}
              onSubmit={handleSubmit}
              onImageUpload={handleImageUpload}
            />
            {editingItem && (
              <>
                <Separator />
                <CopiesSection itemId={editingItem.id} />
              </>
            )}
          </>
        )}
      </Dialog>

      <AlertDialog
        open={itemToArchive !== null}
        onOpenChange={open => {
          if (!open) {
            setItemToArchive(null);
          }
        }}
        title='Archivovat položku'
        description={
          itemToArchive
            ? `Archivovat ${itemToArchive.name}? Položka zůstane viditelná v tomto seznamu.`
            : ''
        }
        actionLabel={archiveMutation.isPending ? 'Archivuji...' : 'Archivovat'}
        cancelLabel='Zrušit'
        onAction={() => {
          if (itemToArchive) {
            archiveMutation.mutate(itemToArchive.id);
          }
        }}
      />
    </section>
  );
}
