import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserPermissions } from 'src/authz/ApiPermissions';
import { AuthRequest } from 'src/authz/authzUser';
import { Permissions } from 'src/authz/permissions.decorator';
import { PermissionsGuard } from 'src/authz/permissions.guard';
import { DataTotalResponse } from 'src/common/types/responseWrappers';
import { UserActivityDto } from '../definitions/userActivity.dto';
import { BookUsersService } from './bookUsers.service';

@Controller('books/users')
export class BookUsersController {
  constructor(private readonly bookUsersService: BookUsersService) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get('activity')
  @Permissions(UserPermissions.read)
  async getRecentActivity(
    @Req() { user }: AuthRequest,
  ): Promise<DataTotalResponse<UserActivityDto>> {
    const userId = user.sub;
    return await this.bookUsersService.getRecentActivity(userId);
  }
}
