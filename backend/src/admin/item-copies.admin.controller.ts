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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';
import { UserRole } from '@/user/user.entity';
import { ItemCopiesService } from '@/item-copies/item-copies.service';
import { CreateItemCopyDto } from '@/item-copies/dto/create-item-copy.dto';
import { UpdateItemCopyDto } from '@/item-copies/dto/update-item-copy.dto';
import { ItemCopy } from '@/item-copies/entities/item-copy.entity';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.Admin)
@Controller('admin/item-copies')
export class ItemCopiesAdminController {
  constructor(private readonly itemCopiesService: ItemCopiesService) {}

  @Get()
  findAll(): Promise<ItemCopy[]> {
    return this.itemCopiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ItemCopy> {
    return this.itemCopiesService.findOne(id);
  }

  @Post()
  create(@Body() createItemCopyDto: CreateItemCopyDto): Promise<ItemCopy> {
    return this.itemCopiesService.create(createItemCopyDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemCopyDto: UpdateItemCopyDto
  ): Promise<ItemCopy> {
    return this.itemCopiesService.update(id, updateItemCopyDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.itemCopiesService.remove(id);
  }
}
