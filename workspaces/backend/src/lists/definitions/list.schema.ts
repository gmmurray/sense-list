import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { ListType } from 'src/common/listType';

export type ListDocument = List & Document;

@Schema({ timestamps: true })
export class List {
  @Prop({ required: true })
  isPublic: boolean;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({
    required: true,
    enum: Object.keys(ListType).map(key => ListType[key]),
  })
  type: ListType;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ ref: 'ListItem ' })
  listItems: Types.ObjectId[];
}

export const ListSchema = SchemaFactory.createForClass(List);
