import { Types } from 'mongoose';
import { StringIdType } from 'src/common/types/stringIdType';
import { UserListDto } from 'src/userLists/definitions/userList.dto';
import { UserListDocument } from 'src/userLists/definitions/userList.schema';

export class UserListItemDto {
  public id: StringIdType;
  public userList: Types.ObjectId | UserListDocument | UserListDto;
  public userId: string;
  public notes: string;
  public createdAt: Date;
  public updatedAt: Date;
}
