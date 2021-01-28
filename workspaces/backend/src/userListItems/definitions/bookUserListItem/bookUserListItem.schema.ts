import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { BookReadingStatus } from 'src/common/userListItemStatus';
import { BookListItemDocument } from 'src/listItems/books/definitions/bookListItem.schema';
import { UserListItem } from '../userListItem.schema';

export type BookUserListItemDocument = BookUserListItem &
  UserListItem &
  Document;

@Schema({ timestamps: true })
export class BookUserListItem extends UserListItem {
  @Prop({ ref: 'BookListItem', type: Types.ObjectId })
  bookListItem: BookListItemDocument | Types.ObjectId;

  @Prop({ required: true })
  status: BookReadingStatus;

  @Prop({ required: true })
  owned: boolean;
}

export const BookUserListItemSchema = SchemaFactory.createForClass(
  BookUserListItem,
);
