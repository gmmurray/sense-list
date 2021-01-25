import { InjectModel } from '@nestjs/mongoose';
import { Error as MongooseError, FilterQuery, Model, Types } from 'mongoose';

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
    readonly listService: ListsService,
    readonly openLibraryService: OpenLibraryService,
  ) {
    super(bookListItemsModel, listService);
  }

  async findAll(
    userId: string,
    listId: string,
  ): Promise<DataTotalResponse<BookListItemDto>> {
    try {
      await this.hasListItemReadAccess(userId, listId);
      const items = await this.bookListItemsModel.find({ list: listId }).exec();

      return new DataTotalResponse(
        items.map(doc => BookListItemDto.create(doc)),
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
      await this.hasListItemReadAccess(userId, listId);

      const result = await this.bookListItemsModel
        .find({
          $and: [
            { list: listId },
            { ...BookListItemsService.getQueryFilter(dto) },
          ],
        })
        .exec();
      return new DataTotalResponse(
        result.map(doc => BookListItemDto.create(doc)),
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

      await this.hasListItemReadAccess(userId, result.list);

      return BookListItemDto.create(result);
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  async create(
    createDto: CreateBookListItemDto,
    userId: string,
  ): Promise<BookListItemDto> {
    try {
      await this.hasListItemWriteAccess(userId, createDto.list);
      const apiBook = await this.openLibraryService.getBookByIsbn(
        createDto.isbn,
      );

      if (!apiBook) throw new MongooseError.ValidationError(null);

      const normalizedBook = BookListItemDomain.create(
        createDto.list,
        createDto.ordinal,
        apiBook,
      );

      const created = new this.bookListItemsModel({
        ...normalizedBook,
      });
      const result = await created.save();

      await this.listService.addListItemToList(
        createDto.list,
        userId,
        result._id,
      );

      return BookListItemDto.create(result);
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

      if (!requestedDoc) throw new MongooseError.DocumentNotFoundError('');

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
