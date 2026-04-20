import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getTables() {
    return [
      {
        name: 'categories',
        label: 'Kategorie',
        endpoint: '/admin/categories',
      },
      { name: 'cities', label: 'Města', endpoint: '/admin/cities' },
      { name: 'tags', label: 'Tagy', endpoint: '/admin/tags' },
      { name: 'locations', label: 'Lokace', endpoint: '/admin/locations' },
      { name: 'items', label: 'Položky', endpoint: '/admin/items' },
      {
        name: 'item-copies',
        label: 'Kopie položek',
        endpoint: '/admin/item-copies',
      },
      { name: 'loans', label: 'Půjčky', endpoint: '/loans' },
      {
        name: 'email-notifications',
        label: 'Email notifikace',
        endpoint: '/email-notifications',
      },
    ];
  }
}
