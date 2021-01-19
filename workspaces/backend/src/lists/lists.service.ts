import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Error as MongooseError, FilterQuery, Model } from 'mongoose';

import { handleHttpRequestError } from 'src/common/exceptionWrappers';
import { DataTotalResponse } from 'src/common/responseWrappers';
import { List, ListDocument } from './definitions/list.schema';
import {
  CreateListDto,
  ListDto,
  PatchListDto,
  QueryListDto,
} from './definitions/list';
import { cleanDtoFields } from 'src/common/dtoHelpers';

@Injectable()
export class ListService {
  constructor(@InjectModel(List.name) private listModel: Model<ListDocument>) {}

  async findAll(userId: string): Promise<DataTotalResponse<ListDto>> {
    try {
      const result = await this.listModel
        .find({ ...ListService.hasListSchemaReadAccess(userId) })
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
        ? ListService.isListSchemaOwner(userId)
        : ListService.hasListSchemaReadAccess(userId);
      const result = await this.listModel
        .find({
          $and: [{ ...accessFilter }, { ...ListService.getQueryFilter(dto) }],
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
          $and: [{ _id: id, ...ListService.hasListSchemaReadAccess(userId) }],
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
          $and: [{ _id: id, ...ListService.hasListSchemaWriteAccess(userId) }],
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
        $and: [{ _id: id, ...ListService.hasListSchemaReadAccess(userId) }],
      });
      if (!result) throw new MongooseError.DocumentNotFoundError('');
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

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

  private static hasListSchemaReadAccess(userId: string): FilterQuery<List> {
    return { $or: [{ ownerId: userId }, { isPublic: true }] };
  }

  private static hasListSchemaWriteAccess(userId: string): FilterQuery<List> {
    return { ownerId: userId };
  }

  private static isListSchemaOwner(userId: string): FilterQuery<List> {
    return { ownerId: userId };
  }
  //#endregion
}
