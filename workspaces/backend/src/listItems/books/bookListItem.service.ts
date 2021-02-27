import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  ClientSession,
  Connection,
  Error as MongooseError,
  FilterQuery,
  Model,
  Types,
} from 'mongoose';

import {
  BookListItem,
  BookListItemDocument,
} from './definitions/bookListItem.schema';
import { ListItemsService } from '../listItems.service';
import {
  BookListItemDto,
  CreateBookListItemDto,
  PatchBookListItemDto,
  QueryBookListItemDto,
} from './definitions/bookListItem.dto';
import { BookListItemDomain } from './definitions/bookListItem';
import { ListsService } from 'src/lists/lists.service';
import { DataTotalResponse } from 'src/common/types/responseWrappers';
import {
  handleHttpRequestError,
  validateObjectId,
} from 'src/common/exceptionWrappers';
import { OpenLibraryService } from '../../openLibrary/openLibrary.service';
import { cleanDtoFields } from 'src/common/dtoHelpers';
import { ListType } from 'src/common/types/listType';
import { getMultiListItemPropName } from 'src/common/mongooseTableHelpers';
import { InternalServerErrorException } from '@nestjs/common';
import { AllUserListItemsService } from 'src/userListItems/allUserListItems.service';
import { StringIdType } from 'src/common/types/stringIdType';
import { GoogleBooksService } from 'src/googleBooks/googlebooks.service';
import { GoogleApiBook } from 'src/googleBooks/GoogleApiBook';
import { UpdateListItemOrdinalsDto } from '../definitions/listItem.dto';

export class BookListItemsService extends ListItemsService<
  BookListItemDocument,
  BookListItemDto,
  CreateBookListItemDto,
  QueryBookListItemDto,
  PatchBookListItemDto
> {
  constructor(
    @InjectModel(BookListItem.name)
    readonly bookListItemsModel: Model<BookListItemDocument>,
    @InjectConnection() private connection: Connection,
    readonly listService: ListsService,
    readonly googleBooksService: GoogleBooksService,
    readonly openLibraryService: OpenLibraryService,
    readonly allUserListItemService: AllUserListItemsService,
  ) {
    super(bookListItemsModel, connection, listService, allUserListItemService);
  }

  /**
   * Gets all accessible book list items. Requires list-specific user read access.
   *
   * @param userId
   * @param listId
   */
  async findAll(
    userId: string,
    listId: string,
  ): Promise<DataTotalResponse<BookListItemDto>> {
    try {
      validateObjectId(listId);
      const list = await this.hasListItemReadAccess(userId, listId);
      if (!list) throw new MongooseError.DocumentNotFoundError(null);

      const items = await this.bookListItemsModel
        .find({ list: new Types.ObjectId(listId) })
        .exec();
      return new DataTotalResponse(
        items.map(doc => BookListItemDto.assign(doc)),
      );
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  /**
   * Gets all accessible book list items by query. Requires list-specific user read access.
   *
   * @param userId
   * @param listId
   * @param queryDto
   */
  async findByQuery(
    userId: string,
    listId: string,
    queryDto: QueryBookListItemDto,
  ): Promise<DataTotalResponse<BookListItemDto>> {
    const dto: QueryBookListItemDto = cleanDtoFields(queryDto);
    try {
      validateObjectId(listId);
      const list = await this.hasListItemReadAccess(userId, listId);
      if (!list) throw new MongooseError.DocumentNotFoundError(null);

      const result = await this.bookListItemsModel
        .find({
          $and: [
            { list: new Types.ObjectId(listId) },
            { ...BookListItemsService.getQueryFilter(dto) },
          ],
        })
        .exec();
      return new DataTotalResponse(
        result.map(doc => BookListItemDto.assign(doc)),
      );
    } catch (error) {
      handleHttpRequestError(error);
    }
    return null;
  }

  /**
   * Gets accessible book list item by id. Requires list-sepcific user read access
   *
   * @param userId
   * @param listItemId
   */
  async findById(userId: string, listItemId: string): Promise<BookListItemDto> {
    try {
      validateObjectId(listItemId);
      const result = await this.bookListItemsModel.findById(listItemId).exec();

      if (!result) throw new MongooseError.DocumentNotFoundError(null);

      const list = await this.hasListItemReadAccess(
        userId,
        <Types.ObjectId>result.list,
      );
      if (!list) throw new MongooseError.DocumentNotFoundError(null);

      return BookListItemDto.assign(result);
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  /**
   * Creates a new book list item. Requires access to the list being added to
   * @param createDto
   * @param userId
   */
  async create(
    createDto: CreateBookListItemDto,
    userId: string,
  ): Promise<BookListItemDto> {
    try {
      validateObjectId(createDto.list);
      const list = await this.hasListItemWriteAccess(userId, createDto.list);
      if (!list) throw new MongooseError.DocumentNotFoundError(null);

      const googleVolume = await this.googleBooksService.getBookByVolumeId(
        createDto.volumeId,
      );

      if (!googleVolume) throw new MongooseError.ValidationError(null);

      const isbn = GoogleApiBook.getIsbn(
        googleVolume.volumeInfo.industryIdentifiers,
      );

      const openLibraryBook = await this.openLibraryService.getBookByIsbn(isbn);

      const normalizedBook = BookListItemDomain.create(
        new Types.ObjectId(createDto.list),
        createDto.ordinal,
        googleVolume,
        openLibraryBook,
      );

      const session = await this.connection.startSession();
      let result: BookListItemDocument | undefined;

      await this.connection.transaction(async () => {
        const created = new this.bookListItemsModel({
          ...normalizedBook,
        });
        result = await created.save({ session });

        await this.listService.updateListItemsInList(
          new Types.ObjectId(createDto.list),
          userId,
          '$push',
          getMultiListItemPropName(ListType.Book),
          result._id,
          session,
        );
      });

      if (!result) throw new InternalServerErrorException();

      return BookListItemDto.assign(result);
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  /**
   * Updates one to many available fields on a book List item. Requires list-specific user write access
   * @param userId
   * @param listItemId
   * @param patchDto
   */
  async patch(
    userId: string,
    listItemId: string,
    patchDto: PatchBookListItemDto,
  ): Promise<void> {
    const dto = cleanDtoFields(patchDto);
    try {
      const requestedDoc = await this.bookListItemsModel
        .findById(listItemId)
        .exec();

      if (!requestedDoc) throw new MongooseError.DocumentNotFoundError(null);

      await this.hasListItemWriteAccess(
        userId,
        <Types.ObjectId>requestedDoc.list,
      );

      for (const key in dto) {
        requestedDoc[key] = dto[key];
      }
      await requestedDoc.save();
    } catch (error) {
      handleHttpRequestError(error);
    }
    return;
  }

  /**
   * Updates each list item's ordinal in a list of list items
   * @param userId
   * @param updates
   */
  async updateOrdinals(
    userId: string,
    updates: UpdateListItemOrdinalsDto,
  ): Promise<void> {
    return await super.updateListItemOrdinals(userId, updates);
  }

  /**
   * Deletes a book list item. Requires list-specific user delete access
   * @param userId
   * @param listItemId
   */
  async delete(userId: string, listItemId: string): Promise<void> {
    return await super.delete(userId, listItemId, ListType.Book);
  }

  //#region non API methods

  /**
   * Deletes all list items that correspond with a given list
   * @param userId
   * @param listId
   * @param session
   * @param listType
   */
  async deleteAllItemsByList(
    userId: string,
    listId: StringIdType,
    session: ClientSession,
    listType: ListType,
  ): Promise<void> {
    const items = await this.bookListItemsModel
      .find({ list: new Types.ObjectId(listId) }, null, { session })
      .exec();
    const itemIds = items.map(item => item._id);
    super.deleteAllItemsByList(userId, listId, session, listType, itemIds);
  }

  //#endregion

  //#region private methods

  /**
   * Transforms the query object into a mongoose query filter
   *
   * @param queryDto
   */
  private static getQueryFilter(
    queryDto: QueryBookListItemDto,
  ): FilterQuery<BookListItem> {
    const result: FilterQuery<BookListItem> = {};
    let keys = Object.keys(queryDto);
    if (keys.length) {
      if (keys.includes('listType')) {
        result['$and'] = [];
        result['$and'].push({
          ['listType']: queryDto['listType'],
        });
        keys = keys.filter(key => key !== 'listType');
      }
      if (keys.length) {
        result['$or'] = [];
        keys.forEach(key => {
          switch (key) {
            case 'ordinal': {
              result['$or'].push({
                [key]: queryDto[key],
              });
              break;
            }
            case 'author': {
              result['$or'].push({
                ['meta.authors']: { $regex: queryDto[key], $options: 'i' },
              });
              break;
            }
            default: {
              result['$or'].push({
                [`meta.${key}`]: { $regex: queryDto[key], $options: 'i' },
              });
            }
          }
        });
      }
    }
    return result;
  }

  //#endregion
}
