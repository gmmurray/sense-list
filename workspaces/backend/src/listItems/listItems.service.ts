import { Injectable } from '@nestjs/common';
import {
  ClientSession,
  Connection,
  Document,
  Error as MongooseError,
  Model,
  Types,
} from 'mongoose';

import { handleHttpRequestError } from 'src/common/exceptionWrappers';
import { ListType } from 'src/common/listType';
import { getMultiListItemPropName } from 'src/common/mongooseTableHelpers';
import { DataTotalResponse } from 'src/common/responseWrappers';
import { ListDocument } from 'src/lists/definitions/list.schema';
import { ListsService } from 'src/lists/lists.service';
import { ListItemDocument } from './definitions/listItem.schema';

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

  async delete(
    userId: string,
    listItemId: string,
    listType: ListType,
  ): Promise<void> {
    try {
      const item = await this.model
        .findById({ _id: new Types.ObjectId(listItemId) })
        .exec();

      if (!item) throw new MongooseError.DocumentNotFoundError('');

      await this.hasListItemWriteAccess(userId, item.list);

      const session = await this.dbConnection.startSession();
      await this.dbConnection.transaction(async () => {
        await this.listsService.updateListItemsInList(
          new Types.ObjectId(item.list),
          userId,
          '$pull',
          getMultiListItemPropName(listType),
          item._id,
          session,
        );

        // TODO: delete user list items.. add session
        // TODO: remove user list items from user list

        const result = await this.model.findByIdAndDelete(
          {
            _id: item._id,
          },
          { session },
        );
        if (!result) throw new MongooseError.DocumentNotFoundError('');
      });
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  //#region non api methods

  async deleteAllItemsByList(
    listId: string | Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    // TODO: also delete user list items
    await this.model.deleteMany(
      { list: new Types.ObjectId(listId) },
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
    listId: string | Types.ObjectId,
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
    listId: string | Types.ObjectId,
  ): Promise<ListDocument> {
    return await this.listsService.getListWithReadAccess(userId, listId);
  }

  //#endregion
}
