import { ListType } from 'src/library/types/ListType';
import { List } from '../list/list';

export class ListItem {
  constructor(
    public id: string,
    public list: string | List,
    public ordinal: number,
    public listType: ListType,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
