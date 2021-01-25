import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Error as MongooseError, FilterQuery, Model, Types } from 'mongoose';

import { handleHttpRequestError } from 'src/common/exceptionWrappers';
import { DataTotalResponse } from 'src/common/responseWrappers';
import { List, ListDocument } from './definitions/list.schema';
import {
  CreateListDto,
  ListDto,
  PatchListDto,
  QueryListDto,
} from './definitions/list.dto';
import { cleanDtoFields } from 'src/common/dtoHelpers';

@Injectable()
export class ListsService {
  constructor(@InjectModel(List.name) private listModel: Model<ListDocument>) {}

  async findAll(userId: string): Promise<DataTotalResponse<ListDto>> {
    try {
      const result = await this.listModel
        .find({ ...ListsService.hasListSchemaReadAccess(userId) })
        .exec();
      return new DataTotalResponse(result.map(doc => ListDto.create(doc)));
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

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
      return new DataTotalResponse(result.map(doc => ListDto.create(doc)));
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  async findById(id: string, userId: string): Promise<ListDto> {
    try {
      const result = await this.listModel
        .findOne({
          $and: [{ _id: id, ...ListsService.hasListSchemaReadAccess(userId) }],
        })
        .exec();

      if (!result) throw new MongooseError.DocumentNotFoundError(null);

      return ListDto.create(result);
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  async create(createListDto: CreateListDto, userId: string): Promise<ListDto> {
    const createdList = new this.listModel({
      ...createListDto,
      ownerId: userId,
    });
    try {
      const result = await createdList.save();
      return ListDto.create(result);
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  async patch(
    id: string,
    patchListDto: PatchListDto,
    userId: string,
  ): Promise<void> {
    const dto = cleanDtoFields(patchListDto);
    try {
      const requestedDoc = await this.listModel
        .findOne({
          $and: [{ _id: id, ...ListsService.hasListSchemaWriteAccess(userId) }],
        })
        .exec();

      if (!requestedDoc) throw new MongooseError.DocumentNotFoundError('');
      for (const key in dto) {
        requestedDoc[key] = dto[key];
      }
      await requestedDoc.save();
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const result = await this.listModel.findOneAndDelete({
        $and: [{ _id: id, ...ListsService.hasListSchemaReadAccess(userId) }],
      });
      if (!result) throw new MongooseError.DocumentNotFoundError('');
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  //#region list items

  async getItemsByList(userId: string): Promise<ListDocument[]> {
    try {
      return await this.listModel
        .find({ ...ListsService.hasListSchemaReadAccess(userId) })
        .populate('listItem')
        .exec();
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  /**
   * Internal/Non-API
   *
   * @param id
   * @param userId
   */
  async getListWithItems(
    id: string | Types.ObjectId,
    userId: string,
  ): Promise<ListDocument> {
    const result = this.listModel
      .findOne({
        $and: [{ _id: id, ...ListsService.hasListSchemaReadAccess(userId) }],
      })
      .populate('listItem')
      .exec();

    if (!result) throw new MongooseError.DocumentNotFoundError(null);

    return result;
  }

  /**
   * Internal/Non-API
   *
   * @param id
   * @param userId
   */
  async getListWithItemsAndWriteAccess(
    id: string | Types.ObjectId,
    userId: string,
  ): Promise<ListDocument> {
    const result = this.listModel
      .findOne({
        $and: [{ _id: id, ...ListsService.hasListSchemaWriteAccess(userId) }],
      })
      .populate('listItem')
      .exec();

    if (!result) throw new MongooseError.DocumentNotFoundError(null);

    return result;
  }

  async addListItemToList(
    listId: Types.ObjectId,
    userId: string,
    listItemId: Types.ObjectId,
  ): Promise<void> {
    try {
      await this.listModel.updateOne(
        {
          $and: [
            { _id: listId, ...ListsService.hasListSchemaWriteAccess(userId) },
          ],
        },
        { $push: { listItems: listItemId } },
      );
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  /**
   * Internal/Non-API
   *
   * @param id
   * @param userId
   * @param listItemId
   */
  async deleteListItemFromList(
    id: Types.ObjectId,
    userId: string,
    listItemId: Types.ObjectId,
  ): Promise<void> {
    try {
      await this.listModel.updateOne(
        {
          $and: [{ _id: id, ...ListsService.hasListSchemaWriteAccess(userId) }],
        },
        { $pull: { listItems: listItemId } },
      );
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  //#endregion

  //#region private methods
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

  static hasListSchemaReadAccess(userId: string): FilterQuery<List> {
    return { $or: [{ ownerId: userId }, { isPublic: true }] };
  }

  static hasListSchemaWriteAccess(userId: string): FilterQuery<List> {
    return { ownerId: userId };
  }

  static isListSchemaOwner(userId: string): FilterQuery<List> {
    return { ownerId: userId };
  }
  //#endregion
}
