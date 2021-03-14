import { Module } from '@nestjs/common';
import { UserListItemsModule } from 'src/userListItems/userListItems.module';
import { UserListsModule } from 'src/userLists/userLists.module';
import { BookUsersController } from './bookUsers.controller';
import { BookUsersService } from './bookUsers.service';

@Module({
  imports: [UserListsModule, UserListItemsModule],
  controllers: [BookUsersController],
  providers: [BookUsersService],
})
export class BookUsersModule {}
