import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getTables() {
    return [
      { name: 'categories', label: 'Kategorie', endpoint: '/categories' },
      { name: 'cities', label: 'Města', endpoint: '/cities' },
      { name: 'tags', label: 'Tagy', endpoint: '/tags' },
      { name: 'locations', label: 'Lokace', endpoint: '/locations' },
      { name: 'items', label: 'Položky', endpoint: '/items' },
      { name: 'item-copies', label: 'Kopie položek', endpoint: '/item-copies' },
      { name: 'loans', label: 'Půjčky', endpoint: '/loans' },
      {
        name: 'email-notifications',
        label: 'Email notifikace',
        endpoint: '/email-notifications',
      },
    ];
  }
}
