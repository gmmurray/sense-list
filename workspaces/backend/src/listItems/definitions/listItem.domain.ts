import { Types } from 'mongoose';

import { ListDocument } from 'src/lists/definitions/list.schema';
import { ListType } from 'src/common/types/listType';

export class ListItemDomain {
  public listType: ListType;
  public list: Types.ObjectId | ListDocument;
  public ordinal: number;
}
