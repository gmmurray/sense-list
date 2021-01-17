import { Controller, Get } from '@nestjs/common';
import { List } from './interfaces/list.interface';
import { ListService } from './lists.service';

@Controller('lists')
export class ListsController {
  constructor(private readonly listService: ListService) {}

  @Get()
  getLists(): List[] {
    const lists = this.listService.getLists();
    return lists;
  }
}
