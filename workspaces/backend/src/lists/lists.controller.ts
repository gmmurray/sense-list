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

import {
  ListApiPermissions,
  ListItemApiPermissions,
  UserListApiPermissions,
  UserListItemApiPermissions,
} from 'src/authz/ApiPermissions';
import { AuthRequest } from 'src/authz/authzUser';
import { Permissions } from 'src/authz/permissions.decorator';
import { PermissionsGuard } from 'src/authz/permissions.guard';
import {
  CreateListDto,
  ListDto,
  PatchListDto,
  QueryListDto,
} from './definitions/list.dto';
import { ListsService } from './lists.service';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  /**
   * Gets all accessible lists. Requires list-specific user read access
   *
   * @param query
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get()
  @Permissions(ListApiPermissions.read)
  async index(@Req() { user }: AuthRequest, @Query() query?: QueryListDto) {
    const userId = user.sub;
    if (query) {
      return this.listsService.findByQuery(new QueryListDto(query), userId);
    }
    return await this.listsService.findAll(userId);
  }

  /**
   * Gets list by id. Requires list-specific user read access
   *
   * @param id
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get(':id')
  @Permissions(ListApiPermissions.read)
  async getById(
    @Req() { user }: AuthRequest,
    @Param('id') id: string,
  ): Promise<ListDto> {
    const userId = user.sub;
    return await this.listsService.findById(id, userId);
  }

  /**
   * Creates a new list. Requires general user write access
   *
   * @param createListDto
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post()
  @Permissions(ListApiPermissions.write)
  async create(
    @Req() { user }: AuthRequest,
    @Body() createListDto: CreateListDto,
  ): Promise<ListDto> {
    const userId = user.sub;
    return await this.listsService.create(createListDto, userId);
  }

  /**
   * Updates one to many available fields on a List. Requires list-specific user write access
   *
   * @param id
   * @param updates
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Patch(':id')
  @Permissions(ListApiPermissions.write)
  async patch(
    @Req() { user }: AuthRequest,
    @Param('id') id: string,
    @Body() updates: PatchListDto,
  ): Promise<void> {
    const userId = user.sub;
    return await this.listsService.patch(id, new PatchListDto(updates), userId);
  }

  /**
   * Deletes a list and its related entities. Requires list-specific user delete access
   *
   * @param id
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Delete(':id')
  @Permissions(
    ListApiPermissions.delete,
    ListItemApiPermissions.delete,
    UserListApiPermissions.delete,
    UserListItemApiPermissions.delete,
  )
  async delete(
    @Req() { user }: AuthRequest,
    @Param('id') id: string,
  ): Promise<void> {
    const userId = user.sub;
    return await this.listsService.delete(id, userId);
  }
}
