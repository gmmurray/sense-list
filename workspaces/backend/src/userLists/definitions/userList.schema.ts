import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ListDocument } from 'src/lists/definitions/list.schema';
import { BookUserListItemDocument } from 'src/userListItems/books/definitions/bookUserListItem.schema';

export type UserListDocument = UserList & Document;

@Schema({ timestamps: true })
export class UserList {
  @Prop({ type: Types.ObjectId, ref: 'List' })
  list: ListDocument | Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop()
  notes: string;

  @Prop({ type: [Types.ObjectId], ref: 'BookUserListItem' })
  bookUserListItems: BookUserListItemDocument[] | Types.ObjectId[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserListSchema = SchemaFactory.createForClass(UserList);
