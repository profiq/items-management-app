import { AdminService } from './admin.service';

describe('AdminService', (): void => {
  let service: AdminService;

  beforeEach((): void => {
    service = new AdminService();
  });

  describe('getTables', (): void => {
    it('returns only admin-protected registry endpoints', (): void => {
      const tables = service.getTables();

      expect(tables).toEqual([
        {
          name: 'categories',
          label: 'Kategorie',
          endpoint: '/admin/categories',
        },
        { name: 'cities', label: 'Města', endpoint: '/admin/cities' },
        { name: 'tags', label: 'Tagy', endpoint: '/admin/tags' },
        { name: 'locations', label: 'Lokace', endpoint: '/admin/locations' },
        { name: 'items', label: 'Položky', endpoint: '/admin/items' },
      ]);
      expect(tables.every(table => table.endpoint.startsWith('/admin/'))).toBe(
        true
      );
    });
  });
});
