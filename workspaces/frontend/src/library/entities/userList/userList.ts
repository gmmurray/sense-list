import { List } from '../list/List';
import { ULI } from '../uli/UserListItem';

export class UserList {
  constructor(
    public id: string,
    public list: string | List,
    public userId: string,
    public notes: string,
    public userListItems: string[] | ULI[],
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export class CreateUserListDto {
  constructor(public list: string, public notes: string) {}
}

export class PatchUserListDto {
  constructor(public notes: string) {}
}
