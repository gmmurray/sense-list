import { Types } from 'mongoose';
import { UserListDocument } from 'src/userLists/definitions/userList.schema';

export class UserListItemDto {
  public id: Types.ObjectId | string;
  public userList: Types.ObjectId | UserListDocument;
  public userId: string;
  public notes: string;
  public createdAt: Date;
  public updatedAt: Date;
}
