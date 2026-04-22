import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';
import { UserRole } from '@/user/user.entity';
import { ItemCopiesService } from '@/item-copies/item-copies.service';
import { ItemsService } from '@/items/items.service';
import { CreateItemCopyBodyDto } from '@/item-copies/dto/create-item-copy-body.dto';
import { ItemCopyResponseDto } from '@/item-copies/dto/item-copy-response.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.Admin)
@Controller('admin/items/:itemId/copies')
export class ItemCopiesAdminController {
  constructor(
    private readonly itemCopiesService: ItemCopiesService,
    private readonly itemsService: ItemsService
  ) {}

  @Post()
  async create(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() body: CreateItemCopyBodyDto
  ): Promise<ItemCopyResponseDto> {
    await this.itemsService.findOne(itemId);
    return this.itemCopiesService.create({ ...body, item_id: itemId });
  }

  @Put(':copyId')
  async update(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('copyId', ParseIntPipe) copyId: number,
    @Body() body: CreateItemCopyBodyDto
  ): Promise<ItemCopyResponseDto> {
    const copy = await this.itemCopiesService.findOne(copyId);
    if (copy.item_id !== itemId) {
      throw new NotFoundException(
        `ItemCopy #${copyId} not found for item #${itemId}`
      );
    }
    return this.itemCopiesService.update(copyId, body);
  }

  @Delete(':copyId')
  async archive(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('copyId', ParseIntPipe) copyId: number
  ): Promise<ItemCopyResponseDto> {
    const copy = await this.itemCopiesService.findOne(copyId);
    if (copy.item_id !== itemId) {
      throw new NotFoundException(
        `ItemCopy #${copyId} not found for item #${itemId}`
      );
    }
    return this.itemCopiesService.archive(copyId);
  }
}
