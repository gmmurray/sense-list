import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ListsModule } from 'src/lists/lists.module';
import {
  BookListItem,
  BookListItemSchema,
} from './books/definitions/bookListItem.schema';
import { BookListItemsService } from './books/bookListItem.service';
import { BookListItemsController } from './books/bookListItems.controller';
import { OpenLibraryModule } from '../openLibrary/openLibrary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BookListItem.name, schema: BookListItemSchema },
    ]),
    ListsModule,
    OpenLibraryModule,
  ],
  controllers: [BookListItemsController],
  providers: [BookListItemsService],
})
export class ListItemsModule {}
