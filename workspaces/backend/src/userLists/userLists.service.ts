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
import {
  handleHttpRequestError,
  validateObjectId,
} from 'src/common/exceptionWrappers';
import { ListType } from 'src/common/types/listType';
import {
  getListItemModelName,
  getMultiListItemPropName,
  getSingleListPropName,
  getUserListItemModelName,
  getMultiUserListItemPropName,
} from 'src/common/mongooseTableHelpers';
import { DataTotalResponse } from 'src/common/types/responseWrappers';
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
import { StringIdType } from 'src/common/types/stringIdType';

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

  /**
   * Gets all accessible user lists. Requires user-specific read access
   *
   * @param userId
   */
  async findAll(userId: string): Promise<DataTotalResponse<UserListDto>> {
    try {
      const result = await this.model
        .find({ userId })
        .populate(getSingleListPropName())
        .exec();

      return new DataTotalResponse(result.map(doc => UserListDto.assign(doc)));
    } catch (error) {
      handleHttpRequestError(error);
    }
    return;
  }

  /**
   * Gets an accessible fully populated user list. Requires user-specific read access
   *
   * @param userId
   * @param userListId
   */
  async getPopulatedUserList(
    userId: string,
    userListId: string,
  ): Promise<UserListDto> {
    try {
      validateObjectId(userListId);
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

      return UserListDto.assignWithPopulatedDocuments(fullUserList);
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  /**
   * Creates a user list. Requires user-specific write access
   *
   * @param userId
   * @param createDto
   */
  async create(
    userId: string,
    createDto: CreateUserListDto,
  ): Promise<UserListDto> {
    try {
      validateObjectId(createDto.list);
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

  /**
   * Updates an accessible user list. Requires user-specific write access
   *
   * @param userId
   * @param userListId
   * @param patchDto
   */
  async patch(
    userId: string,
    userListId: string,
    patchDto: PatchUserListDto,
  ): Promise<void> {
    const dto = cleanDtoFields(patchDto);
    try {
      validateObjectId(userListId);
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

  /**
   * Deletes an accessible user list. Requires user-specific write access
   *
   * @param userId
   * @param userListId
   */
  async delete(userId: string, userListId: StringIdType): Promise<void> {
    try {
      validateObjectId(userListId);
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

  /**
   * Adds or removes user list items from a user list
   *
   * @param userId
   * @param userListId
   * @param operation
   * @param field
   * @param value
   * @param session
   */
  async updateItemsInUserList(
    userId: string,
    userListId: StringIdType,
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

  /**
   * Adds or removes user list items from all user lists
   *
   * @param userId
   * @param operation
   * @param field
   * @param value
   * @param session
   */
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

  /**
   * Removes all user lists that correspond to a given list
   *
   * @param listId
   * @param session
   */
  async deleteAllUserListsByList(
    listId: StringIdType,
    session: ClientSession,
  ): Promise<void> {
    await this.model.deleteMany(
      { list: new Types.ObjectId(listId) },
      { session },
    );
  }

  /**
   * Finds a user list by its ID. No auth done in this method.
   *
   * @param userListId
   */
  async findUserListById(userListId: StringIdType): Promise<UserListDocument> {
    return await this.model.findById(new Types.ObjectId(userListId));
  }

  /**
   * Returns the list if the user has read access to it
   *
   * @param userId
   * @param listId
   */
  async hasListReadAccess(
    userId: string,
    listId: StringIdType,
  ): Promise<ListDocument> {
    return await this.listsService.getListWithReadAccess(userId, listId);
  }

  //#endregion

  //#region private methods

  /**
   * Returns true if the given user has write access to the given user list
   *
   * @param userId
   * @param userList
   */
  private static hasUserListWriteAccess(
    userId: string,
    userList: UserListDocument,
  ): boolean {
    return userList.userId === userId;
  }

  //#endregion
}
