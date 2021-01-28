import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { ListType } from 'src/common/listType';
import { getMultiUserListItemPropName } from 'src/common/mongooseTableHelpers';
import { BULIService } from './books/buli.service';
import {
  BookUserListItem,
  BookUserListItemDocument,
} from './books/definitions/bookUserListItem.schema';

@Injectable()
export class AllUserListItemsService {
  constructor(
    @InjectModel(BookUserListItem.name)
    readonly bookItems: Model<BookUserListItemDocument>,
    @Inject(forwardRef(() => BULIService))
    private readonly bookService: BULIService,
  ) {}
  async deleteAllUserItemsBySingleListItem(
    userId: string,
    listItemId: string | Types.ObjectId,
    listType: ListType,
    session: ClientSession,
  ): Promise<void> {
    let service: BULIService | undefined;
    let itemField: string | undefined;
    switch (listType) {
      case ListType.Book:
        service = this.bookService;
        itemField = getMultiUserListItemPropName(listType);
        break;
      default:
        throw new NotImplementedException();
    }
    const affectedUserItems = await service.findAllBySingleListItem(
      userId,
      listItemId,
    );
    await service.deleteAllUserItemsByIds(
      userId,
      affectedUserItems.map(doc => doc._id),
      itemField,
      session,
    );
  }

  async deleteAllUserItemsByListItems(
    userId: string,
    listItemIds: Types.ObjectId[],
    listType: ListType,
    session: ClientSession,
  ): Promise<void> {
    let service: BULIService | undefined;
    let itemField: string | undefined;
    switch (listType) {
      case ListType.Book:
        service = this.bookService;
        itemField = getMultiUserListItemPropName(listType);
        break;
      default:
        throw new NotImplementedException();
    }
    const affectedUserItems = await service.findAllByListItems(
      userId,
      listItemIds,
    );
    await service.deleteAllUserItemsByIds(
      userId,
      affectedUserItems.map(doc => doc._id),
      itemField,
      session,
    );
  }

  async deleteAllUserItemsByUserList(
    userListId: string | Types.ObjectId,
    listType: ListType,
    session: ClientSession,
  ): Promise<void> {
    let service: BULIService | undefined;
    switch (listType) {
      case ListType.Book:
        service = this.bookService;
        break;
      default:
        throw new NotImplementedException();
    }
    await service.deleteAllUserItemsByUserList(userListId, session);
  }
}
