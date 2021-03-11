import {
  forwardRef,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  ClientSession,
  Connection,
  Error as MongooseError,
  Model,
  Types,
} from 'mongoose';
import { cleanDtoFields } from 'src/common/dtoHelpers';
import {
  handleHttpRequestError,
  validateObjectId,
} from 'src/common/exceptionWrappers';
import { ListType } from 'src/common/types/listType';
import {
  getListItemModelName,
  getMultiUserListItemPropName,
  getSingleListItemPropName,
  getSingleUserListPropName,
} from 'src/common/mongooseTableHelpers';
import { DataTotalResponse } from 'src/common/types/responseWrappers';
import { UserListsService } from 'src/userLists/userLists.service';
import { UserListItemsService } from '../userListItem.service';
import {
  BookUserListItem,
  BookUserListItemDocument,
} from './definitions/bookUserListItem.schema';
import { BULIDto, CreateBULIDto, PatchBULIDto } from './definitions/buli.dto';
import { DefaultBULI } from './definitions/defaultBULI';
import { StringIdType } from 'src/common/types/stringIdType';

export class BULIService extends UserListItemsService<
  BookUserListItemDocument,
  BULIDto,
  CreateBULIDto,
  PatchBULIDto
> {
  constructor(
    @InjectModel(BookUserListItem.name)
    readonly bookModel: Model<BookUserListItemDocument>,
    @InjectConnection() private connection: Connection,
    @Inject(forwardRef(() => UserListsService))
    readonly userListService: UserListsService,
  ) {
    super(bookModel, connection, userListService);
  }

  /**
   * Gets all accessible BULI. Requires user-specific read access
   *
   * @param userId
   */
  async findAll(userId: string): Promise<DataTotalResponse<BULIDto>> {
    try {
      const items = await this.bookModel.find({ userId }).exec();

      if (!items) throw new MongooseError.DocumentNotFoundError(null);

      return new DataTotalResponse(items.map(doc => BULIDto.assign(doc)));
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  /**
   * Gets all accessible BULI by user list. Requires user-specific read access
   *
   * @param userId
   * @param userListId
   */
  async findAllByUserList(
    userId: string,
    userListId: StringIdType,
  ): Promise<DataTotalResponse<BULIDto>> {
    try {
      validateObjectId(userListId);
      const userList = await this.userListService.findUserListById(userListId);

      if (!userList || userList.userId !== userId)
        throw new MongooseError.DocumentNotFoundError(null);

      const items = await this.bookModel
        .find({
          $and: [{ userList: new Types.ObjectId(userListId) }, { userId }],
        })
        .populate({
          path: getSingleListItemPropName(ListType.Book),
          model: getListItemModelName(ListType.Book),
        })
        .populate({
          path: getSingleUserListPropName(),
        })
        .exec();

      if (!items) throw new MongooseError.DocumentNotFoundError(null);

      return new DataTotalResponse(
        items.map(doc => BULIDto.assignWithPopulatedDocuments(doc)),
      );
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  /**
   * Gets an accessible BULI by id. Requires user-specific read access
   *
   * @param userId
   * @param userListItemId
   */
  async findById(
    userId: string,
    userListItemId: StringIdType,
  ): Promise<BULIDto> {
    try {
      validateObjectId(userListItemId);
      const result = await this.bookModel
        .findOne({
          $and: [{ _id: new Types.ObjectId(userListItemId) }, { userId }],
        })
        .populate({
          path: getSingleListItemPropName(ListType.Book),
          model: getListItemModelName(ListType.Book),
        })
        .populate({
          path: getSingleUserListPropName(),
        })
        .exec();

      if (!result) throw new MongooseError.DocumentNotFoundError(null);

      return BULIDto.assignWithPopulatedDocuments(result);
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  /**
   * Creates a BULI. Requires user-specific write access
   *
   * @param userId
   * @param createDto
   */
  async create(userId: string, createDto: CreateBULIDto): Promise<BULIDto> {
    try {
      validateObjectId(createDto.bookListItem);
      validateObjectId(createDto.userList);
      const userList = await this.userListService.findUserListById(
        createDto.userList,
      );

      if (!userList || userList.userId !== userId)
        throw new MongooseError.DocumentNotFoundError(null);

      const session = await this.connection.startSession();
      let result: BookUserListItemDocument | undefined;
      await this.connection.transaction(async () => {
        const created = new this.bookModel({
          ...createDto,
          userId,
          userList: new Types.ObjectId(createDto.userList),
          bookListItem: new Types.ObjectId(createDto.bookListItem),
        });

        result = await created.save({ session });

        await this.userListService.updateItemsInUserList(
          userId,
          new Types.ObjectId(createDto.userList),
          '$push',
          getMultiUserListItemPropName(ListType.Book),
          result._id,
          session,
        );
      });

      if (!result) throw new InternalServerErrorException();

      const test = BULIDto.assign(result);
      return test;
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  /**
   * Updates a BULI. Requires user-specific write access
   *
   * @param userId
   * @param buliId
   * @param patchDto
   */
  async patch(
    userId: string,
    buliId: StringIdType,
    patchDto: PatchBULIDto,
  ): Promise<void> {
    try {
      validateObjectId(buliId);
      const dto = cleanDtoFields(patchDto);
      const requestedDoc = await this.bookModel
        .findOne({ $and: [{ userId }, { _id: buliId }] })
        .exec();

      if (!requestedDoc) throw new MongooseError.DocumentNotFoundError(null);

      for (const key in dto) {
        requestedDoc[key] = dto[key];
      }

      await requestedDoc.save();
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  /**
   * Deletes an accessible BULI. Requires user-specific delete access
   *
   * @param userId
   * @param userListItemId
   */
  async delete(userId: string, userListItemId: StringIdType): Promise<void> {
    return await super.delete(userId, userListItemId, ListType.Book);
  }

  //#region non API methods

  /**
   * Creates a default user list item for each list item provided
   *
   * @param userId
   * @param userListId
   * @param bookListItems
   * @param session
   */
  async createDefaultItemsForList(
    userId: string,
    userListId: StringIdType,
    bookListItems: Types.ObjectId[],
    session: ClientSession,
  ): Promise<BookUserListItemDocument[]> {
    try {
      const newItems = bookListItems.map(
        listItemId =>
          new this.bookModel({
            ...DefaultBULI.createDefault(userId, userListId, listItemId),
          }),
      );
      return await this.bookModel.insertMany(newItems, { session });
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  /**
   * Gets all of the BULI related to a specific list item
   *
   * @param userId
   * @param listItemId
   */
  async findAllBySingleListItem(
    userId: string,
    listItemId: StringIdType,
  ): Promise<BookUserListItemDocument[]> {
    return await this.bookModel
      .find({
        $and: [{ userId }, { bookListItem: new Types.ObjectId(listItemId) }],
      })
      .exec();
  }

  /**
   * Gets all of the BULI related to a specific list item regardless of user
   *
   * @param listItemId
   */
  async findAllBySingleListItemWithoutUser(
    listItemId: StringIdType,
  ): Promise<BookUserListItemDocument[]> {
    return await this.bookModel
      .find({
        bookListItem: new Types.ObjectId(listItemId),
      })
      .exec();
  }

  /**
   * Gets all of the BULI related to any of the given list items
   *
   * @param userId
   * @param listItemIds
   */
  async findAllByListItems(
    userId: string,
    listItemIds: Types.ObjectId[],
  ): Promise<BookUserListItemDocument[]> {
    return await this.bookModel
      .find({
        $and: [{ userId }, { bookListItem: { $in: listItemIds } }],
      })
      .exec();
  }

  /**
   * Gets all of the BULI related to any of the given list items regardless of user
   *
   * @param listItemIds
   */
  async findAllByListItemsWithoutUser(
    listItemIds: Types.ObjectId[],
  ): Promise<BookUserListItemDocument[]> {
    return await this.bookModel
      .find({ bookListItem: { $in: listItemIds } })
      .exec();
  }
}

//#endregion
