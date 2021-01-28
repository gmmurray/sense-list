import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserListDocument } from 'src/userLists/definitions/userList.schema';

export type UserListItemDocument = UserListItem & Document;

@Schema({ timestamps: true })
export class UserListItem {
  @Prop({ ref: 'UserList', type: Types.ObjectId })
  userList: UserListDocument | Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop()
  notes: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}
