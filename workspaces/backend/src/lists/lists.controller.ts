import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from 'src/authz/authzUser';
import { Permissions } from 'src/permissions.decorator';
import { PermissionsGuard } from 'src/permissions.guard';
import {
  CreateListDto,
  ListDto,
  PatchListDto,
  QueryListDto,
} from './definitions/list';
import { ListService } from './lists.service';

@Controller('lists')
export class ListsController {
  constructor(private readonly listService: ListService) {}

  /**
   * Gets all accessible lists. Requires list-specific user read access
   *
   * @param query
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get()
  @Permissions('read:lists')
  async index(@Req() { user }: AuthRequest, @Query() query?: QueryListDto) {
    const userId = user.sub;
    if (query) {
      return this.listService.findByQuery(new QueryListDto(query), userId);
    }
    return this.listService.findAll(userId);
  }

  /**
   * Gets list by id. Requires list-specific user read access
   *
   * @param id
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get(':id')
  @Permissions('read:lists')
  async getById(
    @Req() { user }: AuthRequest,
    @Param('id') id: string,
  ): Promise<ListDto> {
    const userId = user.sub;
    return await this.listService.findById(id, userId);
  }

  /**
   * Creates a new list. Requires general user read access
   *
   * @param createListDto
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post()
  @Permissions('write:lists')
  async create(
    @Req() { user }: AuthRequest,
    @Body() createListDto: CreateListDto,
  ): Promise<ListDto> {
    const userId = user.sub;
    return await this.listService.create(createListDto, userId);
  }

  /**
   * Updates one to many available fields on a List. Requires list-specific user write access
   *
   * @param id
   * @param updates
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Patch(':id')
  @Permissions('write:lists')
  async patch(
    @Req() { user }: AuthRequest,
    @Param('id') id: string,
    @Body() updates: PatchListDto,
  ): Promise<void> {
    const userId = user.sub;
    return await this.listService.patch(id, new PatchListDto(updates), userId);
  }

  /**
   * Deletes a list. Requires list-specific user delete access
   * @param id
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Delete(':id')
  @Permissions('delete:lists')
  async delete(
    @Req() { user }: AuthRequest,
    @Param('id') id: string,
  ): Promise<void> {
    const userId = user.sub;
    return await this.listService.delete(id, userId);
  }
}
