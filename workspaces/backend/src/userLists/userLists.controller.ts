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
import {
  CreateUserListDto,
  PatchUserListDto,
  UserListDto,
} from './definitions/userList.dto';
import { UserListsService } from './userLists.service';

@Controller('user-lists')
export class UserListsController {
  constructor(private readonly userListsService: UserListsService) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get()
  @Permissions(UserListApiPermissions.read)
  async index(
    @Req() { user }: AuthRequest,
  ): Promise<DataTotalResponse<UserListDto<any>>> {
    const userId = user.sub;
    return await this.userListsService.findAll(userId);
  }

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
  ): Promise<UserListDto<any>> {
    const userId = user.sub;
    return await this.userListsService.getPopulatedUserList(userId, userListId);
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post()
  @Permissions(UserListApiPermissions.write)
  async create(
    @Req() { user }: AuthRequest,
    @Body() createDto: CreateUserListDto,
  ): Promise<UserListDto<any>> {
    const userId = user.sub;
    return await this.userListsService.create(userId, createDto);
  }

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
