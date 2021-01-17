import { Module } from '@nestjs/common';
import { ListsController } from './lists.controller';
import { ListService } from './lists.service';

@Module({
  controllers: [ListsController],
  providers: [ListService],
})
export class ListsModule {}
