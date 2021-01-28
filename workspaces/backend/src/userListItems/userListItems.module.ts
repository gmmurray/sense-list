import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserListsModule } from 'src/userLists/userLists.module';
import { AllUserListItemsService } from './allUserListItems.service';
import { BULIController } from './books/buli.controller';
import { BULIService } from './books/buli.service';
import {
  BookUserListItem,
  BookUserListItemSchema,
} from './books/definitions/bookUserListItem.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BookUserListItem.name, schema: BookUserListItemSchema },
    ]),
    forwardRef(() => UserListsModule),
  ],
  controllers: [BULIController],
  providers: [BULIService, AllUserListItemsService],
  exports: [AllUserListItemsService, BULIService],
})
export class UserListItemsModule {}
