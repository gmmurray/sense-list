import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ListItemsModule } from 'src/listItems/listItems.module';
import { ListsModule } from 'src/lists/lists.module';
import { UserList, UserListSchema } from './definitions/userList.schema';
import { UserListsController } from './userLists.controller';
import { UserListsService } from './userLists.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserList.name, schema: UserListSchema },
    ]),
    forwardRef(() => ListsModule),
    ListItemsModule,
  ],
  controllers: [UserListsController],
  providers: [UserListsService],
  exports: [UserListsService],
})
export class UserListsModule {}
