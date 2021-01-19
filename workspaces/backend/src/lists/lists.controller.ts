import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { mockUser } from 'src/mock/users.mock';
import {
  CreateListDto,
  ListDto,
  PatchListDto,
  QueryListDto,
} from './definitions/list';
import { ListService } from './lists.service';

@Controller('lists')
export class ListsController {
  constructor(private readonly listService: ListService) {}

  /**
   * Gets all accessible lists. Requires list-specific user read access
   *
   * @param query
   */
  @Get()
  async index(@Query() query?: QueryListDto) {
    const userId = mockUser.id;
    if (query) {
      return this.listService.findByQuery(new QueryListDto(query), userId);
    }
    return this.listService.findAll(userId);
  }

  /**
   * Gets list by id. Requires list-specific user read access
   *
   * @param id
   */
  @Get(':id')
  async getById(@Param('id') id: string): Promise<ListDto> {
    return await this.listService.findById(id, mockUser.id);
  }

  /**
   * Creates a new list. Requires general user read access
   *
   * @param createListDto
   */
  @Post()
  async create(@Body() createListDto: CreateListDto): Promise<ListDto> {
    const userId = mockUser.id;
    return await this.listService.create(createListDto, userId);
  }

  /**
   * Updates one to many available fields on a List. Requires list-specific user write access
   *
   * @param id
   * @param updates
   */
  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() updates: PatchListDto,
  ): Promise<void> {
    const userId = mockUser.id;
    return await this.listService.patch(id, new PatchListDto(updates), userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    const userId = mockUser.id;
    return await this.listService.delete(id, userId);
  }
}
