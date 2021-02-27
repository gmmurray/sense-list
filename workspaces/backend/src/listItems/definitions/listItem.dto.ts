import { Types } from 'mongoose';

import { ListDocument } from 'src/lists/definitions/list.schema';
import { ListType } from 'src/common/types/listType';
import { ListDto } from 'src/lists/definitions/list.dto';
import { StringIdType } from 'src/common/types/stringIdType';

export class ListItemDto {
  public id: Types.ObjectId;
  public list: Types.ObjectId | ListDocument | ListDto;
  public ordinal: number;
  public listType: ListType;
  public createdAt: Date;
  public updatedAt: Date;
}

export interface ListItemOrdinalUpdate {
  listItemId: StringIdType;
  ordinal: number;
}

export class UpdateListItemOrdinalsDto {
  constructor(
    public listId: string,
    public ordinalUpdates: ListItemOrdinalUpdate[],
  ) {}
}
