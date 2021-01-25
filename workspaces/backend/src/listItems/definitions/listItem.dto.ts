import { Types } from 'mongoose';

import { ListDocument } from 'src/lists/definitions/list.schema';
import { ListType } from 'src/common/listType';

export class ListItemDto {
  public id: Types.ObjectId;
  public list: Types.ObjectId | ListDocument;
  public ordinal: number;
  public listType: ListType;
  public createdAt: Date;
  public updatedAt: Date;
}
