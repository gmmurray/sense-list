import { HttpModule, Module } from '@nestjs/common';
import { GoogleBooksController } from './googleBooks.controller';
import { GoogleBooksService } from './googlebooks.service';

@Module({
  imports: [HttpModule],
  controllers: [GoogleBooksController],
  providers: [GoogleBooksService],
  exports: [GoogleBooksService],
})
export class GoogleBooksModule {}
