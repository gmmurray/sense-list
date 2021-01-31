import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OpenLibraryApiPermissions } from 'src/authz/ApiPermissions';
import { Permissions } from 'src/authz/permissions.decorator';
import { PermissionsGuard } from 'src/authz/permissions.guard';
import { DataTotalResponse } from 'src/common/types/responseWrappers';
import { OpenLibraryService } from './openLibrary.service';
import {
  OpenLibrarySearchItem,
  OpenLibrarySearchOptions,
} from './OpenLibrarySearch';

@Controller('books/open-library')
export class OpenLibraryController {
  constructor(private readonly openLibraryService: OpenLibraryService) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post()
  @HttpCode(200)
  @Permissions(OpenLibraryApiPermissions.read)
  async search(
    @Body() searchOptions: OpenLibrarySearchOptions,
  ): Promise<DataTotalResponse<OpenLibrarySearchItem>> {
    return await this.openLibraryService.searchBooks(searchOptions);
  }
}
