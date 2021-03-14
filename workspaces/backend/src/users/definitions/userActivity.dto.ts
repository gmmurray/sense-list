import { ActivityType } from './activityType';

export class UserActivityDto {
  constructor(
    public type: ActivityType,
    public timeStamp: Date,
    public data?: Record<string, any>,
  ) {}
}
