import { Injectable } from '@nestjs/common';
import { Document, Error as MongooseError, Model, Types } from 'mongoose';

import { handleHttpRequestError } from 'src/common/exceptionWrappers';
import { DataTotalResponse } from 'src/common/responseWrappers';
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

  async delete(userId: string, listItemId: string): Promise<void> {
    try {
      const item = await this.model.findById({ _id: listItemId }).exec();

      if (!item) throw new MongooseError.DocumentNotFoundError('');

      await this.hasListItemWriteAccess(userId, item.list);

      await this.listsService.deleteListItemFromList(
        item.list,
        userId,
        item._id,
      );

      const result = await this.model.findByIdAndDelete({
        _id: item._id,
      });
      if (!result) throw new MongooseError.DocumentNotFoundError('');
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  /**
   * Returns true if the user has write access or throws an error
   * @param userId
   * @param listId
   */
  async hasListItemWriteAccess(
    userId: string,
    listId: string | Types.ObjectId,
  ): Promise<boolean> {
    const result = await this.listsService.getListWithItemsAndWriteAccess(
      listId,
      userId,
    );
    return !!result;
  }

  /**
   * Returns true if the user has read access or throws an error
   * @param userId
   * @param listId
   */
  async hasListItemReadAccess(
    userId: string,
    listId: string | Types.ObjectId,
  ): Promise<boolean> {
    const result = await this.listsService.getListWithItems(listId, userId);
    return !!result;
  }
}
