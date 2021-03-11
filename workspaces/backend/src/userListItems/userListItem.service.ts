import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  ClientSession,
  Connection,
  Document,
  Error as MongooseError,
  Model,
  Types,
} from 'mongoose';
import { validateObjectId } from 'src/common/exceptionWrappers';
import { ListType } from 'src/common/types/listType';
import { getMultiUserListItemPropName } from 'src/common/mongooseTableHelpers';
import { DataTotalResponse } from 'src/common/types/responseWrappers';
import { UserListsService } from 'src/userLists/userLists.service';
import { UserListItemDocument } from './definitions/userListItem.schema';
import { StringIdType } from 'src/common/types/stringIdType';

@Injectable()
export abstract class UserListItemsService<
  T extends UserListItemDocument & Document,
  D,
  C,
  P
> {
  private readonly modelName: string;

  constructor(
    private readonly model: Model<T>,
    private readonly dbConnection: Connection,
    private readonly userListsService: UserListsService,
  ) {
    for (const modelName of Object.keys(model.collection.conn.models)) {
      if (model.collection.conn.models[modelName] === this.model) {
        this.modelName = modelName;
        break;
      }
    }
  }

  abstract findAll(userId: string): Promise<DataTotalResponse<D>>;

  abstract findAllByUserList(
    userId: string,
    userListId: StringIdType,
  ): Promise<DataTotalResponse<D>>;

  abstract findById(userId: string, userListItemId: StringIdType): Promise<D>;

  abstract create(userId: string, createDto: C): Promise<D>;

  abstract createDefaultItemsForList(
    userId: string,
    userListId: StringIdType,
    listItems: Types.ObjectId[],
    session: ClientSession,
  ): Promise<UserListItemDocument[]>;

  abstract patch(
    userId: string,
    userListItemId: StringIdType,
    patchDto: P,
  ): Promise<void>;

  /**
   * Deletes an accessible user list item. Requires user-specific delete access
   * @param userId
   * @param userListItemId
   * @param listType
   */
  async delete(
    userId: string,
    userListItemId: StringIdType,
    listType: ListType,
  ): Promise<void> {
    try {
      validateObjectId(userListItemId);
      const item = await this.model
        .findById({ _id: new Types.ObjectId(userListItemId) })
        .exec();

      if (
        !item ||
        !UserListItemsService.hasUserListItemWriteAccess(userId, item)
      )
        throw new MongooseError.DocumentNotFoundError(null);

      const userListId =
        item.userList instanceof Types.ObjectId ||
        typeof item.userList === 'string'
          ? item.userList
          : undefined;

      if (!userListId)
        throw new InternalServerErrorException('User List type check error');

      const session = await this.dbConnection.startSession();
      await this.dbConnection.transaction(async () => {
        await this.userListsService.updateItemsInUserList(
          userId,
          <Types.ObjectId>userListId,
          '$pull',
          getMultiUserListItemPropName(listType),
          new Types.ObjectId(userListItemId),
          session,
        );

        const result = await this.model.findByIdAndDelete(
          {
            _id: item._id,
          },
          { session },
        );
        if (!result) throw new MongooseError.DocumentNotFoundError(null);
      });
    } catch (error) {}
  }

  // #region non api methods
  abstract findAllBySingleListItem(
    userId: string,
    listItemId: StringIdType,
  ): Promise<UserListItemDocument[]>;

  abstract findAllBySingleListItemWithoutUser(
    listItemId: StringIdType,
  ): Promise<UserListItemDocument[]>;

  abstract findAllByListItems(
    userId: string,
    listItemIds: Types.ObjectId[],
  ): Promise<UserListItemDocument[]>;

  abstract findAllByListItemsWithoutUser(
    listItemIds: Types.ObjectId[],
  ): Promise<UserListItemDocument[]>;

  /**
   * Deletes all of the user list items associated with a given user list
   *
   * @param userListId
   * @param session
   */
  async deleteAllUserItemsByUserList(
    userListId: StringIdType,
    session: ClientSession,
  ): Promise<void> {
    await this.model.deleteMany(
      { userlist: new Types.ObjectId(userListId) },
      { session },
    );
  }

  /**
   * Deletes an array of user list items
   *
   * @param userId
   * @param userItemIds
   * @param itemField
   * @param session
   */
  async deleteAllUserItemsByIds(
    userId: string,
    userItemIds: Types.ObjectId[],
    itemField: string,
    session: ClientSession,
  ): Promise<void> {
    await this.model.deleteMany({ _id: { $in: userItemIds } }, { session });
    await this.userListsService.updateItemsInAllUserLists(
      userId,
      '$pull',
      itemField,
      { $in: userItemIds },
      session,
    );
  }

  //#endregion

  //#region private methods

  private static hasUserListItemWriteAccess(
    userId: string,
    userListItem: UserListItemDocument,
  ): boolean {
    return userListItem.userId === userId;
  }

  //#endregion
}
