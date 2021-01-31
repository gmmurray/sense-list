import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { ListType } from 'src/common/types/listType';
import { getMultiUserListItemPropName } from 'src/common/mongooseTableHelpers';
import { BULIService } from './books/buli.service';
import {
  BookUserListItem,
  BookUserListItemDocument,
} from './books/definitions/bookUserListItem.schema';
import { StringIdType } from 'src/common/types/stringIdType';

@Injectable()
export class AllUserListItemsService {
  constructor(
    @InjectModel(BookUserListItem.name)
    readonly bookItems: Model<BookUserListItemDocument>,
    @Inject(forwardRef(() => BULIService))
    private readonly bookService: BULIService,
  ) {}

  /**
   * Deletes all of the user list items associated with a single list item
   *
   * @param userId
   * @param listItemId
   * @param listType
   * @param session
   */
  async deleteAllUserItemsBySingleListItem(
    userId: string,
    listItemId: StringIdType,
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

  /**
   * Deletes all of the user list items associated with any of the given list items
   *
   * @param userId
   * @param listItemIds
   * @param listType
   * @param session
   */
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

  /**
   * Deletes all of the user list items associated with a given user list
   *
   * @param userListId
   * @param listType
   * @param session
   */
  async deleteAllUserItemsByUserList(
    userListId: StringIdType,
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
