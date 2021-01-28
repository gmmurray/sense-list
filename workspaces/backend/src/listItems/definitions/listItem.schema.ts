import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { ListType } from 'src/common/listType';

export type ListItemDocument = ListItem & Document;

@Schema({ timestamps: true })
export class ListItem {
  @Prop({ ref: 'List', type: Types.ObjectId })
  list: Types.ObjectId;

  @Prop({ required: true })
  ordinal: number;

  @Prop({ required: true, immutable: true })
  listType: ListType;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}
