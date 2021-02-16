import { Types } from 'mongoose';

import { ListDocument } from 'src/lists/definitions/list.schema';
import { ListType } from 'src/common/types/listType';
import { ListDto } from 'src/lists/definitions/list.dto';

export class ListItemDto {
  public id: Types.ObjectId;
  public list: Types.ObjectId | ListDocument | ListDto;
  public ordinal: number;
  public listType: ListType;
  public createdAt: Date;
  public updatedAt: Date;
}
