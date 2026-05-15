import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { RolesGuard } from '@/auth/roles.guard';
import { ItemsModule } from '@/items/items.module';
import { CategoriesModule } from '@/categories/categories.module';
import { TagsModule } from '@/tags/tags.module';
import { CitiesModule } from '@/cities/cities.module';
import { LocationsModule } from '@/locations/locations.module';
import { ItemCopiesModule } from '@/item-copies/item-copies.module';
import { LoansModule } from '@/loans/loans.module';
import { ItemsAdminController } from './items.admin.controller';
import { CategoriesAdminController } from './categories.admin.controller';
import { TagsAdminController } from './tags.admin.controller';
import { CitiesAdminController } from './cities.admin.controller';
import { LocationsAdminController } from './locations.admin.controller';
import { ItemCopiesAdminController } from './item-copies.admin.controller';
import { LoansAdminController } from './loans.admin.controller';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ItemsModule,
    CategoriesModule,
    TagsModule,
    CitiesModule,
    LocationsModule,
    ItemCopiesModule,
    LoansModule,
  ],
  controllers: [
    AdminController,
    ItemsAdminController,
    CategoriesAdminController,
    TagsAdminController,
    CitiesAdminController,
    LocationsAdminController,
    ItemCopiesAdminController,
    LoansAdminController,
  ],
  providers: [AdminService, RolesGuard],
})
export class AdminModule {}
