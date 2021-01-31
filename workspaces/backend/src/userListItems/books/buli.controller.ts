import {
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  UserListApiPermissions,
  UserListItemApiPermissions,
} from 'src/authz/ApiPermissions';
import { AuthRequest } from 'src/authz/authzUser';
import { Permissions } from 'src/authz/permissions.decorator';
import { PermissionsGuard } from 'src/authz/permissions.guard';
import { DataTotalResponse } from 'src/common/types/responseWrappers';
import { BULIService } from './buli.service';
import { BULIDto, CreateBULIDto, PatchBULIDto } from './definitions/buli.dto';

@Controller('books/user-list-items')
export class BULIController {
  constructor(private readonly buliService: BULIService) {}

  /**
   * Gets all accessible BULI. Requires user-specific read access
   *
   * @param query
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get()
  @Permissions(UserListApiPermissions.read, UserListItemApiPermissions.read)
  async index(
    @Req() { user }: AuthRequest,
    @Query() query: { userListId: string },
  ): Promise<DataTotalResponse<BULIDto>> {
    const userId = user.sub;
    if (query.userListId) {
      return await this.buliService.findAllByUserList(userId, query.userListId);
    } else return await this.buliService.findAll(userId);
  }

  /**
   * Gets an accessible BULI by id. Requires user-specific read access
   *
   * @param buliId
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get(':buliId')
  @Permissions(UserListItemApiPermissions.read)
  async getById(
    @Req() { user }: AuthRequest,
    @Param('buliId') buliId: string,
  ): Promise<BULIDto> {
    const userId = user.sub;
    return await this.buliService.findById(userId, buliId);
  }

  /**
   * Creates a BULI. Requires user-specific write access
   *
   * @param createDto
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post()
  @Permissions(UserListApiPermissions.write, UserListItemApiPermissions.write)
  async create(
    @Req() { user }: AuthRequest,
    @Body() createDto: CreateBULIDto,
  ): Promise<BULIDto> {
    const userId = user.sub;
    return await this.buliService.create(userId, createDto);
  }

  /**
   * Updates a BULI. Requires user-specific write access
   *
   * @param buliId
   * @param updates
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Patch(':buliId')
  @Permissions(UserListItemApiPermissions.write)
  async patch(
    @Req() { user }: AuthRequest,
    @Param('buliId') buliId: string,
    @Body() updates: PatchBULIDto,
  ): Promise<void> {
    const userId = user.sub;
    return await this.buliService.patch(
      userId,
      buliId,
      new PatchBULIDto(updates),
    );
  }

  /**
   * Deletes an accessible BULI. Requires user-specific delete access
   *
   * @param buliId
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Delete(':buliId')
  @Permissions(UserListItemApiPermissions.delete)
  async delete(
    @Req() { user }: AuthRequest,
    @Param('buliId') buliId: string,
  ): Promise<void> {
    const userId = user.sub;
    return await this.buliService.delete(userId, buliId);
  }
}
