import { ActivityType } from 'src/library/types/ActivityType';
import { BookReadingStatus } from 'src/library/types/BookReadingStatus';

export class RecentActivity {
  constructor(
    public identifier: string,
    public type: ActivityType,
    public timeStamp: Date,
    public data?: Record<string, any>,
  ) {}
}

export class RecentUserListActivity extends RecentActivity {
  constructor(
    public identifier: string,
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
    public identifier: string,
    public type: ActivityType,
    public timeStamp: Date,
    public status: BookReadingStatus,
    public owned: boolean,
    public title: string,
    public rating?: number | null,
  ) {
    super(identifier, type, timeStamp);
  }
}
