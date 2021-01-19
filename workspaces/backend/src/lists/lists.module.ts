import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { List, ListSchema } from './definitions/list.schema';
import { ListsController } from './lists.controller';
import { ListService } from './lists.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: List.name, schema: ListSchema }]),
  ],
  controllers: [ListsController],
  providers: [ListService],
})
export class ListsModule {}
