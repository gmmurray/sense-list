import { HttpModule, Module } from '@nestjs/common';
import { OpenLibraryController } from './openLibrary.controller';

import { OpenLibraryService } from './openLibrary.service';

@Module({
  imports: [HttpModule],
  controllers: [OpenLibraryController],
  providers: [OpenLibraryService],
  exports: [OpenLibraryService],
})
export class OpenLibraryModule {}
