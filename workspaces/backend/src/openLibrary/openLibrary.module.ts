import { HttpModule, Module } from '@nestjs/common';

import { OpenLibraryService } from './openLibrary.service';

@Module({
  imports: [HttpModule],
  providers: [OpenLibraryService],
  exports: [OpenLibraryService],
})
export class OpenLibraryModule {}
