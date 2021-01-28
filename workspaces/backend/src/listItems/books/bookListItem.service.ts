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
import { DataTotalResponse } from 'src/common/responseWrappers';
import { handleHttpRequestError } from 'src/common/exceptionWrappers';
import { OpenLibraryService } from '../../openLibrary/openLibrary.service';
import { cleanDtoFields } from 'src/common/dtoHelpers';
import { ListType } from 'src/common/listType';
import { getMultiListItemPropName } from 'src/common/mongooseTableHelpers';
import { InternalServerErrorException } from '@nestjs/common';
import { AllUserListItemsService } from 'src/userListItems/allUserListItems.service';

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
    readonly openLibraryService: OpenLibraryService,
    readonly allUserListItemService: AllUserListItemsService,
  ) {
    super(bookListItemsModel, connection, listService, allUserListItemService);
  }

  async findAll(
    userId: string,
    listId: string,
  ): Promise<DataTotalResponse<BookListItemDto>> {
    try {
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

  async findByQuery(
    userId: string,
    listId: string,
    queryDto: QueryBookListItemDto,
  ): Promise<DataTotalResponse<BookListItemDto>> {
    const dto: QueryBookListItemDto = cleanDtoFields(queryDto);
    try {
      const list = await this.hasListItemReadAccess(userId, listId);
      if (!list) throw new MongooseError.DocumentNotFoundError(null);

      const result = await this.bookListItemsModel
        .find({
          $and: [
            { list: listId },
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

  async findById(userId: string, listItemId: string): Promise<BookListItemDto> {
    try {
      const result = await this.bookListItemsModel.findById(listItemId).exec();

      if (!result) throw new MongooseError.DocumentNotFoundError(null);

      const list = await this.hasListItemReadAccess(userId, result.list);
      if (!list) throw new MongooseError.DocumentNotFoundError(null);

      return BookListItemDto.assign(result);
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  async create(
    createDto: CreateBookListItemDto,
    userId: string,
  ): Promise<BookListItemDto> {
    try {
      const list = await this.hasListItemWriteAccess(userId, createDto.list);
      if (!list) throw new MongooseError.DocumentNotFoundError(null);

      const apiBook = await this.openLibraryService.getBookByIsbn(
        createDto.isbn,
      );

      if (!apiBook) throw new MongooseError.ValidationError(null);

      const normalizedBook = BookListItemDomain.create(
        new Types.ObjectId(createDto.list),
        createDto.ordinal,
        apiBook,
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

      await this.hasListItemWriteAccess(userId, requestedDoc.list);

      for (const key in dto) {
        requestedDoc[key] = dto[key];
      }
      await requestedDoc.save();
    } catch (error) {
      handleHttpRequestError(error);
    }
    return;
  }

  async delete(userId: string, listItemId: string): Promise<void> {
    return await super.delete(userId, listItemId, ListType.Book);
  }

  async deleteAllItemsByList(
    userId: string,
    listId: string | Types.ObjectId,
    session: ClientSession,
    listType: ListType,
  ): Promise<void> {
    const items = await this.bookListItemsModel
      .find({ list: new Types.ObjectId(listId) }, null, { session })
      .exec();
    const itemIds = items.map(item => item._id);
    super.deleteAllItemsByList(userId, listId, session, listType, itemIds);
  }

  //#region private methods

  private static getQueryFilter(
    queryDto: QueryBookListItemDto,
  ): FilterQuery<BookListItem> {
    const result: FilterQuery<BookListItem> = {};
    if (Object.keys(queryDto).length) {
      result['$or'] = [];
      Object.keys(queryDto).forEach(key => {
        switch (key) {
          case 'ordinal':
          case 'listType': {
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
    return result;
  }

  //#endregion
}
