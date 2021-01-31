import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { DataTotalResponse } from 'src/common/types/responseWrappers';
import {
  CreateUserListDto,
  PatchUserListDto,
  UserListDto,
} from './definitions/userList.dto';
import { UserListsService } from './userLists.service';

@Controller('user-lists')
export class UserListsController {
  constructor(private readonly userListsService: UserListsService) {}

  /**
   * Gets all accessible user lists. Requires user-specific read access
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get()
  @Permissions(UserListApiPermissions.read)
  async index(
    @Req() { user }: AuthRequest,
  ): Promise<DataTotalResponse<UserListDto>> {
    const userId = user.sub;
    return await this.userListsService.findAll(userId);
  }

  /**
   * Gets an accessible fully populated user list. Requires user-specific read access
   *
   * @param userListId
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get(':userListId')
  @Permissions(
    UserListApiPermissions.read,
    ListApiPermissions.read,
    ListItemApiPermissions.read,
    UserListItemApiPermissions.read,
  )
  async getPopulatedUserList(
    @Req() { user }: AuthRequest,
    @Param('userListId') userListId: string,
  ): Promise<UserListDto> {
    const userId = user.sub;
    return await this.userListsService.getPopulatedUserList(userId, userListId);
  }

  /**
   * Creates a user list. Requires user-specific write access
   *
   * @param createDto
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post()
  @Permissions(UserListApiPermissions.write)
  async create(
    @Req() { user }: AuthRequest,
    @Body() createDto: CreateUserListDto,
  ): Promise<UserListDto> {
    const userId = user.sub;
    return await this.userListsService.create(userId, createDto);
  }

  /**
   * Updates an accessible user list. Requires user-specific write access
   *
   * @param userListId
   * @param updates
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Patch(':userListId')
  @Permissions(UserListApiPermissions.write)
  async patch(
    @Req() { user }: AuthRequest,
    @Param('userListId') userListId: string,
    @Body() updates: PatchUserListDto,
  ): Promise<void> {
    const userId = user.sub;
    return await this.userListsService.patch(
      userId,
      userListId,
      new PatchUserListDto(updates),
    );
  }

  /**
   * Deletes an accessible user list. Requires user-specific write access
   *
   * @param param0
   * @param userListId
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Delete(':userListId')
  @Permissions(UserListApiPermissions.delete, UserListItemApiPermissions.delete)
  async delete(
    @Req() { user }: AuthRequest,
    @Param('userListId') userListId: string,
  ): Promise<void> {
    const userId = user.sub;
    return await this.userListsService.delete(userId, userListId);
  }
}
