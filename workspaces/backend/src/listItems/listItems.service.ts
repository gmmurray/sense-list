import { Injectable } from '@nestjs/common';
import {
  ClientSession,
  Connection,
  Document,
  Error as MongooseError,
  FilterQuery,
  Model,
  Types,
} from 'mongoose';

import {
  handleHttpRequestError,
  validateObjectId,
} from 'src/common/exceptionWrappers';
import { ListType } from 'src/common/types/listType';
import {
  getMultiListItemPropName,
  getSingleListPropName,
} from 'src/common/mongooseTableHelpers';
import { DataTotalResponse } from 'src/common/types/responseWrappers';
import { ListDocument } from 'src/lists/definitions/list.schema';
import { ListsService } from 'src/lists/lists.service';
import { AllUserListItemsService } from 'src/userListItems/allUserListItems.service';
import { ListItemDocument } from './definitions/listItem.schema';
import { StringIdType } from 'src/common/types/stringIdType';
import { UpdateListItemOrdinalsDto } from './definitions/listItem.dto';

@Injectable()
export abstract class ListItemsService<
  T extends ListItemDocument & Document,
  D,
  C,
  Q,
  P
> {
  private readonly modelName: string;

  constructor(
    private readonly model: Model<T>,
    private readonly dbConnection: Connection,
    private readonly listsService: ListsService,
    private readonly allUserListItemsService: AllUserListItemsService,
  ) {
    for (const modelName of Object.keys(model.collection.conn.models)) {
      if (model.collection.conn.models[modelName] === this.model) {
        this.modelName = modelName;
        break;
      }
    }
  }

  abstract findAll(
    userId: string,
    listId: string,
  ): Promise<DataTotalResponse<D>>;

  abstract findByQuery(
    userId: string,
    listId: string,
    queryDto: Q,
  ): Promise<DataTotalResponse<D>>;

  abstract findById(userId: string, listItemId: string): Promise<D>;

  abstract create(createDto: C, userId: string): Promise<D>;

  abstract patch(
    userId: string,
    listItemId: string,
    patchDto: P,
  ): Promise<void>;

  /**
   * Updates each list item's ordinal in a list of list items
   * @param userId
   * @param updates
   */
  async updateListItemOrdinals(
    userId: string,
    updates: UpdateListItemOrdinalsDto,
  ): Promise<void> {
    try {
      if (!updates.listId || !updates.ordinalUpdates)
        throw new MongooseError.DocumentNotFoundError(null);

      validateObjectId(updates.listId);
      for (const listItemId of updates.ordinalUpdates.map(
        update => update.listItemId,
      )) {
        validateObjectId(listItemId);
      }

      const list = await this.hasListItemWriteAccess(userId, updates.listId);
      if (!list) throw new MongooseError.DocumentNotFoundError(null);
      if (
        !ListItemsService.validListItemOrdinals(
          list.bookListItems.length,
          updates.ordinalUpdates.map(update => update.ordinal),
        )
      )
        throw new MongooseError.ValidationError(null);
      await this.dbConnection.startSession();
      await this.dbConnection.transaction(async () => {
        const bulkUpdates = [];
        for (const update of updates.ordinalUpdates) {
          const operation = {
            updateOne: {
              filter: { _id: new Types.ObjectId(update.listItemId) },
              update: { ordinal: update.ordinal },
            },
          };
          bulkUpdates.push(operation);
        }
        await this.model.bulkWrite(bulkUpdates);
      });
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  async delete(
    userId: string,
    listItemId: string,
    listType: ListType,
  ): Promise<void> {
    try {
      validateObjectId(listItemId);
      const item = await this.model
        .findById({ _id: new Types.ObjectId(listItemId) })
        .populate(getSingleListPropName())
        .exec();

      if (!item) throw new MongooseError.DocumentNotFoundError(null);

      await this.hasListItemWriteAccess(userId, (<ListDocument>item.list)._id);

      const session = await this.dbConnection.startSession();
      await this.dbConnection.transaction(async () => {
        await this.listsService.updateListItemsInList(
          new Types.ObjectId((<ListDocument>item.list)._id),
          userId,
          '$pull',
          getMultiListItemPropName(listType),
          item._id,
          session,
        );

        await this.allUserListItemsService.deleteAllUserItemsBySingleListItem(
          userId,
          item._id,
          listType,
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
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  //#region non api methods

  /**
   * Deletes each type of list items based on the list id.
   * Also deletes their associated user list items
   *
   * @param userId
   * @param listId
   * @param session
   * @param listType
   * @param itemIds
   */
  async deleteAllItemsByList(
    userId: string,
    listId: StringIdType,
    session: ClientSession,
    listType: ListType,
    itemIds: Types.ObjectId[],
  ): Promise<void> {
    await this.allUserListItemsService.deleteAllUserItemsByListItems(
      userId,
      itemIds,
      listType,
      session,
    );
    await this.model.deleteMany(
      { list: new Types.ObjectId(listId) } as FilterQuery<T>,
      { session },
    );
  }

  /**
   * Returns true if the user has write access or throws an error
   * @param userId
   * @param listId
   */
  async hasListItemWriteAccess(
    userId: string,
    listId: StringIdType,
  ): Promise<ListDocument> {
    return await this.listsService.getListWithWriteAccess(userId, listId);
  }

  /**
   * Returns true if the user has read access or throws an error
   * @param userId
   * @param listId
   */
  async hasListItemReadAccess(
    userId: string,
    listId: StringIdType,
  ): Promise<ListDocument> {
    return await this.listsService.getListWithReadAccess(userId, listId);
  }

  //#endregion

  //#region private methods

  private static validListItemOrdinals(
    listLength: number,
    givenOrdinals: number[],
  ): boolean {
    const expectedOrdinals = Array.from(Array(listLength).keys());
    return expectedOrdinals.every(ordinal => givenOrdinals.includes(ordinal));
  }

  //#endregion
}
