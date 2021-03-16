import { StringIdType } from 'src/common/types/stringIdType';
import { BookReadingStatus } from 'src/common/types/userListItemStatus';
import { ActivityType } from './activityType';

export class RecentActivity {
  constructor(
    public identifier: StringIdType,
    public type: ActivityType,
    public timeStamp: Date,
    public data?: Record<string, any>,
  ) {}
}

export class RecentUserListActivity extends RecentActivity {
  constructor(
    public identifier: StringIdType,
    public type: ActivityType,
    public timeStamp: Date,
    public title: string,
    public bookCount: number,
  ) {
    super(identifier, type, timeStamp);
  }
}

export class RecentBULIActivity extends RecentActivity {
  constructor(
    public identifier: StringIdType,
    public type: ActivityType,
    public timeStamp: Date,
    public status: BookReadingStatus,
    public owned: boolean,
    public title: string,
  ) {
    super(identifier, type, timeStamp);
  }
}
