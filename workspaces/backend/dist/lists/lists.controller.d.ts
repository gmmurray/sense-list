import { List } from './interfaces/list.interface';
import { ListService } from './lists.service';
export declare class ListsController {
    private readonly listService;
    constructor(listService: ListService);
    getLists(): List[];
}
