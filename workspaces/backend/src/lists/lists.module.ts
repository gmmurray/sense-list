import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ListItemsModule } from 'src/listItems/listItems.module';
import { UserListsModule } from 'src/userLists/userLists.module';

import { List, ListSchema } from './definitions/list.schema';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: List.name,
        schema: ListSchema,
      },
    ]),
    forwardRef(() => ListItemsModule),
    forwardRef(() => UserListsModule),
  ],
  controllers: [ListsController],
  providers: [ListsService],
  exports: [ListsService],
})
export class ListsModule {}
