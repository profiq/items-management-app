import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';
import { UserRole } from '@/user/user.entity';
import { ItemsService } from '@/items/items.service';
import { CreateItemDto } from '@/items/dto/create-item.dto';
import { UpdateItemDto } from '@/items/dto/update-item.dto';
import { FindItemsQueryDto } from '@/items/dto/find-items-query.dto';
import { PaginatedItemsResponseDto } from '@/items/dto/paginated-items-response.dto';
import { Item } from '@/items/entities/item.entity';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.Admin)
@Controller('admin/items')
export class ItemsAdminController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll(
    @Query() query: FindItemsQueryDto
  ): Promise<PaginatedItemsResponseDto> {
    return this.itemsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Item> {
    return this.itemsService.findOne(id);
  }

  @Post()
  create(@Body() createItemDto: CreateItemDto): Promise<Item> {
    return this.itemsService.create(createItemDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemDto: UpdateItemDto
  ): Promise<Item> {
    return this.itemsService.update(id, updateItemDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.itemsService.remove(id);
  }
}
