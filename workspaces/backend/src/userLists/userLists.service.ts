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
import { BookListItem } from 'src/listItems/books/definitions/bookListItem.schema';
import { ListDocument } from 'src/lists/definitions/list.schema';
import { ListsService } from 'src/lists/lists.service';
import { UserListItem } from 'src/userListItems/definitions/userListItem.schema';
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

      // retrieve the full userlist
      const fullUserList = await shallowUserList
        .populate({
          path: getSingleListPropName(),
          populate: {
            path: getMultiListItemPropName(authorizedList.type),
            model: getListItemModelName(authorizedList.type),
          },
        })
        // .populate({ TODO:
        //   path: getUserListItemPopulate(authorizedList.type),
        //   model: getUserListItemModelName(authorizedList.type),
        //   match: { userId }
        // })
        .execPopulate();
      //

      /**
       * Retrieve list + list.listitems
       *
       * Retrieve user list items where they match current user
       */
      return UserListDto.assign(fullUserList);
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  // should also initialize the relevant user list items based on the list's items and the list type
  async create(
    userId: string,
    createDto: CreateUserListDto,
  ): Promise<UserListDto<any>> {
    try {
      const list = await this.hasListReadAccess(userId, createDto.list);
      if (!list) throw new MongooseError.ValidationError(null);

      // TODO: create user list items for the list
      let listItems = [];
      switch (list.type) {
        case ListType.Book:
          listItems = list.bookListItems;
          break;
        default:
          throw new NotImplementedException();
      }
      for (const item in listItems) {
        // create the item --maybe bulk creation
      }

      createDto.userId = userId;
      const created = new this.model({
        ...createDto,
        list: new Types.ObjectId(createDto.list),
      });

      const result = await created.save();
      return UserListDto.assign(result);
    } catch (error) {
      handleHttpRequestError(error);
    }
    return;
  }

  // patch fields
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

  // delete user list
  async delete(
    userId: string,
    userListId: string | Types.ObjectId,
  ): Promise<void> {
    try {
      const userList = await this.model.findById(userListId).exec();

      if (
        !userList ||
        !UserListsService.hasUserListWriteAccess(userId, userList)
      )
        throw new MongooseError.DocumentNotFoundError(null);

      const session = await this.connection.startSession();
      await this.connection.transaction(async () => {
        // TODO: Remove associated user list items

        // Remove user list
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

  // update user list item field (follow list example ) TODO:
  async updateItemsInUserList(
    userId: string,
    userListId: string | Types.ObjectId,
    operation: '$pull' | '$push',
    field: string,
    value: string | Types.ObjectId | { $in: string[] | Types.ObjectId[] },
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
  async deleteAllUserListsByList(
    listId: string | Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    await this.model.deleteMany(
      { list: new Types.ObjectId(listId) },
      { session },
    );
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
