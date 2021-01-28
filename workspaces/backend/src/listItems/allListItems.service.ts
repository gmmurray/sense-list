import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { ListType } from 'src/common/listType';
import { BookListItemsService } from './books/bookListItem.service';
import {
  BookListItem,
  BookListItemDocument,
} from './books/definitions/bookListItem.schema';
import { ListItemsService } from './listItems.service';

@Injectable()
export class AllListItemsService {
  constructor(
    @InjectModel(BookListItem.name)
    readonly bookItems: Model<BookListItemDocument>,
    @Inject(forwardRef(() => BookListItemsService))
    private readonly bookService: BookListItemsService,
  ) {}

  // add list item to list

  // delete list item from list

  /**
   * Deletes each type of list items based on the list id.
   * Also deletes their associated user list items
   * @param listId
   * @param listType
   * @param session
   */
  async deleteAllItemsByList(
    listId: string | Types.ObjectId,
    listType: ListType,
    session: ClientSession,
  ): Promise<void> {
    let service;
    switch (listType) {
      case ListType.Book:
        service = this.bookService;
        break;
      default:
        throw new NotImplementedException();
    }
    await service.deleteAllItemsByList(listId, session);
  }
}
