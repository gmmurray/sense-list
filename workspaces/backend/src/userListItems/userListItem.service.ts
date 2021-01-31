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
import { ListType } from 'src/common/listType';
import { getMultiUserListItemPropName } from 'src/common/mongooseTableHelpers';
import { DataTotalResponse } from 'src/common/responseWrappers';
import { UserListsService } from 'src/userLists/userLists.service';
import { UserListItemDocument } from './definitions/userListItem.schema';

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
    userListId: string | Types.ObjectId,
  ): Promise<DataTotalResponse<D>>;

  abstract findById(
    userId: string,
    userListItemId: string | Types.ObjectId,
  ): Promise<D>;

  abstract create(userId: string, createDto: C): Promise<D>;

  abstract createDefaultItemsForList(
    userId: string,
    userListId: string | Types.ObjectId,
    listItems: Types.ObjectId[],
    session: ClientSession,
  ): Promise<UserListItemDocument[]>;

  abstract patch(
    userId: string,
    userListItemId: string | Types.ObjectId,
    patchDto: P,
  ): Promise<void>;

  async delete(
    userId: string,
    userListItemId: string | Types.ObjectId,
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
    listItemId: string | Types.ObjectId,
  ): Promise<UserListItemDocument[]>;

  abstract findAllByListItems(
    userId: string,
    listItemIds: Types.ObjectId[],
  ): Promise<UserListItemDocument[]>;

  async deleteAllUserItemsByUserList(
    userListId: string | Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    await this.model.deleteMany(
      { userlist: new Types.ObjectId(userListId) },
      { session },
    );
  }

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

  private static hasUserListItemWriteAccess(
    userId: string,
    userListItem: UserListItemDocument,
  ): boolean {
    return userListItem.userId === userId;
  }
}
