import { Injectable } from '@nestjs/common';
import { List } from './interfaces/list.interface';
import { mockLists } from './lists.mock';

@Injectable()
export class ListService {
  getLists(): List[] {
    return mockLists;
  }
}
