import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
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
  getMultiListItemPropName,
  getSingleListPropName,
  getUserListItemModelName,
  getMultiUserListItemPropName,
} from 'src/common/mongooseTableHelpers';
import { DataTotalResponse } from 'src/common/responseWrappers';
import { ListDocument } from 'src/lists/definitions/list.schema';
import { ListsService } from 'src/lists/lists.service';
import { AllUserListItemsService } from 'src/userListItems/allUserListItems.service';
import { BULIService } from 'src/userListItems/books/buli.service';
import { UserListItemDocument } from 'src/userListItems/definitions/userListItem.schema';
import {
  CreateUserListDto,
  PatchUserListDto,
  UserListDto,
} from './definitions/userList.dto';
import { UserList, UserListDocument } from './definitions/userList.schema';

@Injectable()
export class UserListsService {
  constructor(
    @InjectModel(UserList.name) readonly model: Model<UserListDocument>,
    @InjectConnection() private connection: Connection,
    @Inject(forwardRef(() => ListsService))
    private readonly listsService: ListsService,
    @Inject(forwardRef(() => BULIService))
    private readonly bookUserListItemsService: BULIService,
    @Inject(forwardRef(() => AllUserListItemsService))
    private readonly allUserListItemsService: AllUserListItemsService,
  ) {}

  async findAll(userId: string): Promise<DataTotalResponse<UserListDto<any>>> {
    try {
      const result = await this.model.find({ userId }).exec();

      return new DataTotalResponse(result.map(doc => UserListDto.assign(doc)));
    } catch (error) {
      handleHttpRequestError(error);
    }
    return;
  }

  async getPopulatedUserList(
    userId: string,
    userListId: string,
  ): Promise<UserListDto<any>> {
    try {
      const shallowUserList = await this.model.findById(userListId);

      if (!shallowUserList) throw new MongooseError.DocumentNotFoundError(null);

      const listId =
        shallowUserList.list instanceof Types.ObjectId ||
        typeof shallowUserList.list === 'string'
          ? shallowUserList.list
          : undefined;

      if (!listId)
        throw new InternalServerErrorException('List type check error');

      const authorizedList = await this.hasListReadAccess(
        userId,
        <Types.ObjectId>listId,
      );

      const fullUserList = await shallowUserList
        .populate({
          path: getSingleListPropName(),
          populate: {
            path: getMultiListItemPropName(authorizedList.type),
            model: getListItemModelName(authorizedList.type),
          },
        })
        .populate({
          path: getMultiUserListItemPropName(authorizedList.type),
          model: getUserListItemModelName(authorizedList.type),
          match: { userId },
        })
        .execPopulate();

      return UserListDto.assign(fullUserList);
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  async create(
    userId: string,
    createDto: CreateUserListDto,
  ): Promise<UserListDto<any>> {
    try {
      const list = await this.hasListReadAccess(userId, createDto.list);
      if (!list) throw new MongooseError.ValidationError(null);

      let listItems: Types.ObjectId[];
      switch (list.type) {
        case ListType.Book:
          listItems = <Types.ObjectId[]>list.bookListItems;
          break;
        default:
          throw new NotImplementedException();
      }
      createDto.userId = userId;

      const session = await this.connection.startSession();
      let result: UserListDocument | undefined;
      let createdUserItems: UserListItemDocument[] | undefined;
      await this.connection.transaction(async () => {
        const created = new this.model({
          ...createDto,
          list: new Types.ObjectId(createDto.list),
        });

        result = await created.save({ session });

        createdUserItems = await this.bookUserListItemsService.createDefaultItemsForList(
          userId,
          result._id,
          listItems,
          session,
        );

        await this.updateItemsInUserList(
          userId,
          result._id,
          '$push',
          getMultiUserListItemPropName(list.type),
          {
            $each: [
              ...createdUserItems.map(item => new Types.ObjectId(item._id)),
            ],
          },
          session,
        );
      });

      if (!result) throw new InternalServerErrorException();
      return UserListDto.assign(result);
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  async patch(
    userId: string,
    userListId: string,
    patchDto: PatchUserListDto,
  ): Promise<void> {
    const dto = cleanDtoFields(patchDto);
    try {
      const requestedDoc = await this.model.findById(userListId).exec();

      if (
        !requestedDoc ||
        !UserListsService.hasUserListWriteAccess(userId, requestedDoc)
      )
        throw new MongooseError.DocumentNotFoundError(null);

      for (const key in dto) {
        requestedDoc[key] = dto[key];
      }
      await requestedDoc.save();
    } catch (error) {
      handleHttpRequestError(error);
    }
    return;
  }

  async delete(
    userId: string,
    userListId: string | Types.ObjectId,
  ): Promise<void> {
    try {
      const userList = await this.model
        .findById(userListId)
        .populate(getSingleListPropName())
        .exec();

      if (
        !userList ||
        !UserListsService.hasUserListWriteAccess(userId, userList)
      )
        throw new MongooseError.DocumentNotFoundError(null);

      const session = await this.connection.startSession();
      await this.connection.transaction(async () => {
        const list = <ListDocument>userList.list;
        await this.allUserListItemsService.deleteAllUserItemsByUserList(
          userListId,
          list.type,
          session,
        );

        const result = await this.model.findByIdAndDelete(
          new Types.ObjectId(userListId),
          { session },
        );
        if (!result) throw new MongooseError.DocumentNotFoundError(null);
      });
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  //#region non API methods

  async updateItemsInUserList(
    userId: string,
    userListId: string | Types.ObjectId,
    operation: '$pull' | '$push',
    field: string,
    value:
      | string
      | Types.ObjectId
      | { $in: string[] | Types.ObjectId[] }
      | { $each: string[] | Types.ObjectId[] },
    session: ClientSession,
  ): Promise<void> {
    try {
      await this.model.updateOne(
        { $and: [{ _id: new Types.ObjectId(userListId) }, { userId }] },
        {
          [operation]: { [field]: value },
        },
        { session },
      );
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  async updateItemsInAllUserLists(
    userId: string,
    operation: '$pull' | '$push',
    field: string,
    value:
      | string
      | Types.ObjectId
      | { $in: string[] | Types.ObjectId[] }
      | { $each: string[] | Types.ObjectId[] },
    session: ClientSession,
  ): Promise<void> {
    try {
      await this.model.updateOne(
        { userId },
        {
          [operation]: { [field]: value },
        },
        { session },
      );
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  async deleteAllUserListsByList(
    listId: string | Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    await this.model.deleteMany(
      { list: new Types.ObjectId(listId) },
      { session },
    );
  }

  /**
   * Finds a user list by its ID. No auth done in this method.
   * @param userListId
   */
  async findUserListById(
    userListId: string | Types.ObjectId,
  ): Promise<UserListDocument> {
    return await this.model.findById(new Types.ObjectId(userListId));
  }

  async hasListReadAccess(
    userId: string,
    listId: string | Types.ObjectId,
  ): Promise<ListDocument> {
    return await this.listsService.getListWithReadAccess(userId, listId);
  }

  private static hasUserListWriteAccess(
    userId: string,
    userList: UserListDocument,
  ): boolean {
    return userList.userId === userId;
  }

  //#endregion
}
