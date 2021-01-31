import { Types } from 'mongoose';
import { UserListDto } from 'src/userLists/definitions/userList.dto';
import { UserListDocument } from 'src/userLists/definitions/userList.schema';

export class UserListItemDto {
  public id: Types.ObjectId | string;
  public userList: Types.ObjectId | UserListDocument | UserListDto;
  public userId: string;
  public notes: string;
  public createdAt: Date;
  public updatedAt: Date;
}
