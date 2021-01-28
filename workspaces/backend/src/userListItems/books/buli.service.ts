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
import { handleHttpRequestError } from 'src/common/exceptionWrappers';
import { ListType } from 'src/common/listType';
import {
  getListItemModelName,
  getMultiUserListItemPropName,
  getSingleListItemPropName,
  getSingleUserListPropName,
} from 'src/common/mongooseTableHelpers';
import { DataTotalResponse } from 'src/common/responseWrappers';
import { UserListsService } from 'src/userLists/userLists.service';
import { UserListItemsService } from '../userListItem.service';
import {
  BookUserListItem,
  BookUserListItemDocument,
} from './definitions/bookUserListItem.schema';
import { BULIDto, CreateBULIDto, PatchBULIDto } from './definitions/buli.dto';
import { DefaultBULI } from './definitions/defaultBULI';

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

  async findAll(userId: string): Promise<DataTotalResponse<BULIDto>> {
    try {
      const items = await this.bookModel.find({ userId }).exec();

      if (!items) throw new MongooseError.DocumentNotFoundError(null);

      return new DataTotalResponse(items.map(doc => BULIDto.assign(doc)));
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  async findAllByUserList(
    userId: string,
    userListId: string | Types.ObjectId,
  ): Promise<DataTotalResponse<BULIDto>> {
    try {
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

      return new DataTotalResponse(items.map(doc => BULIDto.assign(doc)));
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  async findById(
    userId: string,
    userListItemId: string | Types.ObjectId,
  ): Promise<BULIDto> {
    try {
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

      return BULIDto.assign(result);
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  async create(userId: string, createDto: CreateBULIDto): Promise<BULIDto> {
    try {
      const userList = await this.userListService.findUserListById(
        createDto.userList,
      );

      if (!userList || userList.userId !== userId)
        throw new MongooseError.DocumentNotFoundError(null);

      const session = await this.connection.startSession();
      let result: BookUserListItemDocument | undefined;
      await this.connection.transaction(async () => {
        const created = new this.bookModel({
          userId,
          ...createDto,
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

      return BULIDto.assign(result);
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  async createDefaultItemsForList(
    userId: string,
    userListId: string | Types.ObjectId,
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

  async patch(
    userId: string,
    buliId: string | Types.ObjectId,
    patchDto: PatchBULIDto,
  ): Promise<void> {
    const dto = cleanDtoFields(patchDto);
    try {
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

  async findAllBySingleListItem(
    userId: string,
    listItemId: string | Types.ObjectId,
  ): Promise<BookUserListItemDocument[]> {
    return await this.bookModel
      .find({
        $and: [{ userId }, { bookListItem: new Types.ObjectId(listItemId) }],
      })
      .exec();
  }

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
}
