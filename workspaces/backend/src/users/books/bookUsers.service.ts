import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { handleHttpRequestError } from 'src/common/exceptionWrappers';
import { ListType } from 'src/common/types/listType';
import { DataTotalResponse } from 'src/common/types/responseWrappers';
import { StringIdType } from 'src/common/types/stringIdType';
import { BookListItemDto } from 'src/listItems/books/definitions/bookListItem.dto';
import { ListDto } from 'src/lists/definitions/list.dto';
import { BULIService } from 'src/userListItems/books/buli.service';
import { BULIDto } from 'src/userListItems/books/definitions/buli.dto';
import { UserListDto } from 'src/userLists/definitions/userList.dto';
import { UserListsService } from 'src/userLists/userLists.service';
import { ActivityType } from '../definitions/activityType';
import {
  RecentActivity,
  RecentBULIActivity,
  RecentUserListActivity,
} from '../definitions/recentActivity';

@Injectable()
export class BookUsersService {
  constructor(
    private readonly userListsService: UserListsService,
    private readonly buliService: BULIService,
  ) {}

  async getRecentActivity(
    userId: string,
    count: string,
  ): Promise<DataTotalResponse<RecentActivity>> {
    try {
      const queryCount = parseInt(count);
      if (!queryCount) throw new BadRequestException();
      const result: RecentActivity[] = [];

      const listsReq = this.userListsService.findMostRecentCreated(
        userId,
        5,
        ListType.Book,
      );
      const itemsReq = this.buliService.findMostRecentUpdated(
        userId,
        queryCount,
      );
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

  async getActiveLists(
    userId: string,
    count: string,
  ): Promise<DataTotalResponse<UserListDto>> {
    try {
      const queryCount = parseInt(count);
      if (!queryCount) throw new BadRequestException();

      const userLists = await this.userListsService.findMostRecentActive(
        userId,
        queryCount,
        ListType.Book,
      );

      return new DataTotalResponse(userLists);
    } catch (error) {
      handleHttpRequestError(error);
    }
  }

  private addUserListToResult(
    userList: UserListDto,
    result: RecentActivity[],
  ): void {
    result.push(
      new RecentUserListActivity(
        userList.id,
        ActivityType.start,
        userList.createdAt,
        (userList.list as ListDto).title,
        ((userList.list as ListDto).bookListItems as BookListItemDto[]).length,
      ),
    );
  }

  private addBULIToResult(buli: BULIDto, result: RecentActivity[]): void {
    result.push(
      new RecentBULIActivity(
        buli.userList as Types.ObjectId,
        ActivityType.progress,
        buli.updatedAt,
        buli.status,
        buli.owned,
        (buli.bookListItem as BookListItemDto).meta.title,
        buli.rating,
      ),
    );
  }
}
