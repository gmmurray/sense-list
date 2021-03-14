import { Injectable } from '@nestjs/common';
import { ObjectId, Types } from 'mongoose';
import { handleHttpRequestError } from 'src/common/exceptionWrappers';
import { DataTotalResponse } from 'src/common/types/responseWrappers';
import { StringIdType } from 'src/common/types/stringIdType';
import { List } from 'src/lists/definitions/list.schema';
import { BULIService } from 'src/userListItems/books/buli.service';
import { BULIDto } from 'src/userListItems/books/definitions/buli.dto';
import { UserListDto } from 'src/userLists/definitions/userList.dto';
import { UserListsService } from 'src/userLists/userLists.service';
import { ActivityType } from '../definitions/activityType';
import { UserActivityDto } from '../definitions/userActivity.dto';

@Injectable()
export class BookUsersService {
  constructor(
    private readonly userListsService: UserListsService,
    private readonly buliService: BULIService,
  ) {}

  async getRecentActivity(
    userId: string,
  ): Promise<DataTotalResponse<UserActivityDto>> {
    try {
      const result: UserActivityDto[] = [];

      const listsReq = this.userListsService.findMostRecentCreated(userId, 5);
      const itemsReq = this.buliService.findMostRecentUpdated(userId, 5);
      const complete = await Promise.all([listsReq, itemsReq]);

      const listsRes = complete[0];
      const itemsRes = complete[1];

      const includedCreatedLists: StringIdType[] = [];
      while ((listsRes.length || itemsRes.length) && result.length < 5) {
        if (listsRes[0] && itemsRes[0]) {
          const paddedListDate = new Date(
            listsRes[0].createdAt.getTime() + 200,
          );
          if (paddedListDate > itemsRes[0].updatedAt) {
            const userList = listsRes.shift();
            this.addUserListToResult(userList, result);
            includedCreatedLists.push(userList.id);
          } else {
            const buli = itemsRes.shift();
            if (!includedCreatedLists.includes(<Types.ObjectId>buli.userList)) {
              this.addBULIToResult(buli, result);
            }
          }
        } else {
          if (listsRes[0]) {
            const userList = listsRes.shift();
            this.addUserListToResult(userList, result);
            includedCreatedLists.push(userList.id);
          } else {
            const buli = itemsRes.shift();
            if (!includedCreatedLists.includes(<Types.ObjectId>buli.userList)) {
              this.addBULIToResult(buli, result);
            }
          }
        }
      }
      return new DataTotalResponse(result);
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  private addUserListToResult(
    userList: UserListDto,
    result: UserActivityDto[],
  ): void {
    result.push(
      new UserActivityDto(ActivityType.start, userList.createdAt, {
        name: (userList.list as List).title,
      }),
    );
  }

  private addBULIToResult(buli: BULIDto, result: UserActivityDto[]): void {
    result.push(
      new UserActivityDto(ActivityType.progress, buli.updatedAt, {
        status: buli.status,
        owned: buli.owned,
      }),
    );
  }
}
