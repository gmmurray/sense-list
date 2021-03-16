import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserPermissions } from 'src/authz/ApiPermissions';
import { AuthRequest } from 'src/authz/authzUser';
import { Permissions } from 'src/authz/permissions.decorator';
import { PermissionsGuard } from 'src/authz/permissions.guard';
import { DataTotalResponse } from 'src/common/types/responseWrappers';
import { UserListDto } from 'src/userLists/definitions/userList.dto';
import { RecentActivity } from '../definitions/recentActivity';
import { BookUsersService } from './bookUsers.service';

@Controller('books/users')
export class BookUsersController {
  constructor(private readonly bookUsersService: BookUsersService) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get('activity/:count')
  @Permissions(UserPermissions.read)
  async getRecentActivity(
    @Req() { user }: AuthRequest,
    @Param('count') count: string,
  ): Promise<DataTotalResponse<RecentActivity>> {
    const userId = user.sub;
    return await this.bookUsersService.getRecentActivity(userId, count);
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get('active-lists/:count')
  @Permissions(UserPermissions.read)
  async getActiveLists(
    @Req() { user }: AuthRequest,
    @Param('count') count: string,
  ): Promise<DataTotalResponse<UserListDto>> {
    const userId = user.sub;
    return await this.bookUsersService.getActiveLists(userId, count);
  }
}
