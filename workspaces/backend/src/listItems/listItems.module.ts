import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ListsModule } from 'src/lists/lists.module';
import {
  BookListItem,
  BookListItemSchema,
} from './books/definitions/bookListItem.schema';
import { BookListItemsService } from './books/bookListItem.service';
import { BookListItemsController } from './books/bookListItems.controller';
import { OpenLibraryModule } from '../openLibrary/openLibrary.module';
import { AllListItemsService } from './allListItems.service';
import { UserListItemsModule } from '../userListItems/userListItems.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BookListItem.name, schema: BookListItemSchema },
    ]),
    forwardRef(() => ListsModule),
    OpenLibraryModule,
    UserListItemsModule,
  ],
  controllers: [BookListItemsController],
  providers: [BookListItemsService, AllListItemsService],
  exports: [AllListItemsService],
})
export class ListItemsModule {}
