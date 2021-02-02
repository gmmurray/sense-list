import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { ListItem } from '../../definitions/listItem.schema';
import { BookListItemMeta } from './bookListItem';

export type BookListItemDocument = BookListItem & ListItem & Document;

@Schema()
export class BookListItem extends ListItem {
  @Prop({ required: true })
  isbn: string;

  @Prop({ required: true })
  volumeId: string;

  @Prop()
  meta: BookListItemMeta;
}

export const BookListItemSchema = SchemaFactory.createForClass(BookListItem);
