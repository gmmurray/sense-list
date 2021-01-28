import { Types, UpdateQuery } from 'mongoose';
import { ListDocument } from 'src/lists/definitions/list.schema';

type listItemsType = 'bookListItems';
type operationType = '$push' | '$pull';

// export class ItemPushPullClause {
//   push!: { $push: { [key in listItemsType]: string | Types.ObjectId } };
//   $pull!: { [key in listItemsType]: string | Types.ObjectId };
// }

export type ItemPushPullClause = {
  $push: { bookListItems: string | Types.ObjectId };
};
