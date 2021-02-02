import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleBooksApiPermissions } from 'src/authz/ApiPermissions';
import { Permissions } from 'src/authz/permissions.decorator';
import { PermissionsGuard } from 'src/authz/permissions.guard';
import { DataTotalResponse } from 'src/common/types/responseWrappers';
import { GoogleApiBook } from './GoogleApiBook';
import { GoogleApiBookSearchOptions } from './GoogleApiBookSearch';
import { GoogleBooksService } from './googlebooks.service';

@Controller('books/google')
export class GoogleBooksController {
  constructor(private readonly googleBooksService: GoogleBooksService) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post()
  @HttpCode(200)
  @Permissions(GoogleBooksApiPermissions.read)
  async search(
    @Body() searchOptions: GoogleApiBookSearchOptions,
  ): Promise<DataTotalResponse<GoogleApiBook>> {
    return await this.googleBooksService.searchBooks(searchOptions);
  }
}
