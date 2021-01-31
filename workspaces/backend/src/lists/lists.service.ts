import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  ClientSession,
  Connection,
  Error as MongooseError,
  FilterQuery,
  Model,
  Types,
} from 'mongoose';

import {
  handleHttpRequestError,
  validateObjectId,
} from 'src/common/exceptionWrappers';
import { DataTotalResponse } from 'src/common/responseWrappers';
import { List, ListDocument } from './definitions/list.schema';
import {
  CreateListDto,
  ListDto,
  PatchListDto,
  QueryListDto,
} from './definitions/list.dto';
import { cleanDtoFields } from 'src/common/dtoHelpers';
import { UserListsService } from 'src/userLists/userLists.service';
import { AllListItemsService } from 'src/listItems/allListItems.service';

@Injectable()
export class ListsService {
  constructor(
    @InjectModel(List.name) private listModel: Model<ListDocument>,
    @InjectConnection() private connection: Connection,
    @Inject(forwardRef(() => AllListItemsService))
    private readonly allListItemsService: AllListItemsService,
    @Inject(forwardRef(() => UserListsService))
    private readonly userListsService: UserListsService,
  ) {}

  /**
   * Gets all accessible lists. Requires list-specific user read access
   *
   * @param userId
   */
  async findAll(userId: string): Promise<DataTotalResponse<ListDto>> {
    try {
      const result = await this.listModel
        .find({ ...ListsService.hasListSchemaReadAccess(userId) })
        .exec();
      return new DataTotalResponse(result.map(doc => ListDto.assign(doc)));
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  /**
   * Gets all accessible lists by query. Requires list-specific user read access
   *
   * @param queryListDto
   * @param userId
   */
  async findByQuery(
    queryListDto: QueryListDto,
    userId: string,
  ): Promise<DataTotalResponse<ListDto>> {
    const dto: QueryListDto = cleanDtoFields(
      queryListDto,
      key => key !== 'ownerOnly',
    );
    try {
      const accessFilter = dto.ownerOnly
        ? ListsService.isListSchemaOwner(userId)
        : ListsService.hasListSchemaReadAccess(userId);
      const result = await this.listModel
        .find({
          $and: [{ ...accessFilter }, { ...ListsService.getQueryFilter(dto) }],
        })
        .exec();
      return new DataTotalResponse(result.map(doc => ListDto.assign(doc)));
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  /**
   * Gets list by id. Requires list-specific user read access
   *
   * @param listId
   * @param userId
   */
  async findById(listId: string, userId: string): Promise<ListDto> {
    try {
      validateObjectId(listId);
      const result = await this.listModel
        .findOne({
          $and: [
            { _id: listId, ...ListsService.hasListSchemaReadAccess(userId) },
          ],
        })
        .exec();

      if (!result) throw new MongooseError.DocumentNotFoundError(null);

      return ListDto.assign(result);
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  /**
   * Creates a new list. Requires general user write access
   *
   * @param createListDto
   * @param userId
   */
  async create(createListDto: CreateListDto, userId: string): Promise<ListDto> {
    const createdList = new this.listModel({
      ...createListDto,
      ownerId: userId,
    });
    try {
      const result = await createdList.save();
      return ListDto.assign(result);
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  /**
   * Updates one to many available fields on a List. Requires list-specific user write access
   *
   * @param listId
   * @param patchListDto
   * @param userId
   */
  async patch(
    listId: string,
    patchListDto: PatchListDto,
    userId: string,
  ): Promise<void> {
    try {
      validateObjectId(listId);
      const dto = cleanDtoFields(patchListDto);
      const requestedDoc = await this.listModel
        .findOne({
          $and: [
            { _id: listId, ...ListsService.hasListSchemaWriteAccess(userId) },
          ],
        })
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
   * Deletes a list and its related entities. Requires list-specific user delete access
   *
   * @param listId
   * @param userId
   */
  async delete(listId: string, userId: string): Promise<void> {
    try {
      validateObjectId(listId);
      const list = await this.getListWithWriteAccess(userId, listId);
      if (!list) throw new MongooseError.DocumentNotFoundError(null);

      const session = await this.connection.startSession();
      await this.connection.transaction(async () => {
        // Delete associated list items. Also deletes associated user list items
        await this.allListItemsService.deleteAllItemsByList(
          userId,
          listId,
          list.type,
          session,
        );

        // Delete associated user lists
        await this.userListsService.deleteAllUserListsByList(listId, session);

        // Delete the actual list
        const result = await this.listModel.findOneAndDelete(
          {
            $and: [
              { _id: listId, ...ListsService.hasListSchemaReadAccess(userId) },
            ],
          },
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
   * Returns the list if the user has read access to it, else throws an error
   *
   * @param userId
   * @param listId
   */
  async getListWithReadAccess(
    userId: string,
    listId: string | Types.ObjectId,
  ): Promise<ListDocument> {
    const result = await this.listModel
      .findOne({
        $and: [
          {
            _id: new Types.ObjectId(listId),
            ...ListsService.hasListSchemaReadAccess(userId),
          },
        ],
      })
      .exec();

    if (!result) throw new MongooseError.DocumentNotFoundError(null);

    return result;
  }

  /**
   * Returns the list if the user has write access to it, else throws an error
   *
   * @param userId
   * @param listId
   */
  async getListWithWriteAccess(
    userId: string,
    listId: string | Types.ObjectId,
  ): Promise<ListDocument> {
    const result = this.listModel
      .findOne({
        $and: [
          {
            _id: new Types.ObjectId(listId),
            ...ListsService.hasListSchemaWriteAccess(userId),
          },
        ],
      })
      .exec();

    if (!result) throw new MongooseError.DocumentNotFoundError(null);

    return result;
  }

  /**
   * Updates the listItems property of a list by adding or removing based on the given
   * field. Uses transactions
   *
   * @param listId
   * @param userId
   * @param operation
   * @param field
   * @param value
   * @param session
   */
  async updateListItemsInList(
    listId: Types.ObjectId,
    userId: string,
    operation: '$pull' | '$push',
    field: string,
    value: string | Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    try {
      await this.listModel.updateOne(
        {
          $and: [
            { _id: listId, ...ListsService.hasListSchemaWriteAccess(userId) },
          ],
        },
        { [operation]: { [field]: value } },
        { session },
      );
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  //#endregion

  //#region private methods

  /**
   * Transforms the query object into a mongoose query filter
   *
   * @param queryListDto
   */
  private static getQueryFilter(queryListDto: QueryListDto): FilterQuery<List> {
    const result: FilterQuery<List> = {};
    if (Object.keys(queryListDto).length) {
      result['$or'] = [];
      Object.keys(queryListDto).forEach(key => {
        if (key === 'type') {
          result['$or'].push({
            [key]: queryListDto[key],
          });
        } else {
          result['$or'].push({
            [key]: { $regex: queryListDto[key], $options: 'i' },
          });
        }
      });
    }
    return result;
  }

  /**
   * Returns a mongoose query filter to check list read access
   *
   * @param userId
   */
  static hasListSchemaReadAccess(userId: string): FilterQuery<List> {
    return { $or: [{ ownerId: userId }, { isPublic: true }] };
  }

  /**
   * Returns a mongoose query filter to check list write access
   *
   * @param userId
   */
  static hasListSchemaWriteAccess(userId: string): FilterQuery<List> {
    return { ownerId: userId };
  }

  /**
   * Returns a mongoose query filter to check list ownership
   *
   * @param userId
   */
  static isListSchemaOwner(userId: string): FilterQuery<List> {
    return { ownerId: userId };
  }
  //#endregion
}
