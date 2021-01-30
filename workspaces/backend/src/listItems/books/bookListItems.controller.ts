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
import { DataTotalResponse } from 'src/common/responseWrappers';
import { BookListItemsService } from './bookListItem.service';
import {
  BookListItemDto,
  CreateBookListItemDto,
  PatchBookListItemDto,
  QueryBookListItemDto,
} from './definitions/bookListItem.dto';

@Controller('books/list-items')
export class BookListItemsController {
  constructor(private readonly bookListItemsService: BookListItemsService) {}

  /**
   * Gets all accessible book list items. Requires list-specific user read access.
   *
   * @param user - provided by access token
   * @param listId
   * @param query
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get()
  @Permissions(ListItemApiPermissions.read)
  async index(
    @Req() { user }: AuthRequest,
    @Query() query?: QueryBookListItemDto,
  ): Promise<DataTotalResponse<BookListItemDto>> {
    const userId = user.sub;
    if (Object.keys(query).length > 1) {
      return this.bookListItemsService.findByQuery(
        userId,
        query.list,
        new QueryBookListItemDto(query),
      );
    }
    return await this.bookListItemsService.findAll(userId, query.list);
  }

  /**
   * Gets accessible book list item by id. Requires list-sepcific user read access
   *
   * @param user - provided by access token
   * @param listItemId
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get(':listItemId')
  @Permissions(ListItemApiPermissions.read)
  async getById(
    @Req() { user }: AuthRequest,
    @Param('listItemId') listItemId: string,
  ): Promise<BookListItemDto> {
    const userId = user.sub;
    return await this.bookListItemsService.findById(userId, listItemId);
  }

  /**
   * Creates a new book list item. Requires access to the list being added to
   *
   * @param user - provided by access token
   * @param createListItemDto
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post()
  @Permissions(ListItemApiPermissions.write, ListApiPermissions.write)
  async create(
    @Req() { user }: AuthRequest,
    @Body() createListItemDto: CreateBookListItemDto,
  ): Promise<BookListItemDto> {
    const userId = user.sub;
    return await this.bookListItemsService.create(createListItemDto, userId);
  }

  /**
   * Updates one to many available fields on a book List item. Requires list-specific user write access
   * @param user - provided by access token
   * @param listItemId
   * @param updates
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Patch(':listItemId')
  @Permissions(ListItemApiPermissions.write)
  async patch(
    @Req() { user }: AuthRequest,
    @Param('listItemId') listItemId: string,
    @Body() updates: PatchBookListItemDto,
  ): Promise<void> {
    const userId = user.sub;
    return await this.bookListItemsService.patch(
      userId,
      listItemId,
      new PatchBookListItemDto(updates),
    );
  }

  /**
   * Deletes a book list item. Requires list-specific user delete access
   *
   * @param user - provided by access token
   * @param listItemId
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Delete(':listItemId')
  @Permissions(
    ListItemApiPermissions.delete,
    ListApiPermissions.write,
    UserListItemApiPermissions.delete,
    UserListApiPermissions.write,
  )
  async delete(
    @Req() { user }: AuthRequest,
    @Param('listItemId') listItemId: string,
  ): Promise<void> {
    const userId = user.sub;
    return await this.bookListItemsService.delete(userId, listItemId);
  }
}
