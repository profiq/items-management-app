import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
import { ItemCopyResponseDto } from '@/item-copies/dto/item-copy-response.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.Admin)
@Controller('admin/items/:itemId/copies')
export class ItemCopiesAdminController {
  constructor(private readonly itemCopiesService: ItemCopiesService) {}

  @Post()
  create(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() createItemCopyDto: CreateItemCopyDto
  ): Promise<ItemCopyResponseDto> {
    return this.itemCopiesService.create({
      ...createItemCopyDto,
      item_id: itemId,
    });
  }

  @Put(':copyId')
  update(
    @Param('copyId', ParseIntPipe) copyId: number,
    @Body() updateItemCopyDto: UpdateItemCopyDto
  ): Promise<ItemCopyResponseDto> {
    return this.itemCopiesService.update(copyId, updateItemCopyDto);
  }

  @Delete(':copyId')
  archive(
    @Param('copyId', ParseIntPipe) copyId: number
  ): Promise<ItemCopyResponseDto> {
    return this.itemCopiesService.archive(copyId);
  }
}
