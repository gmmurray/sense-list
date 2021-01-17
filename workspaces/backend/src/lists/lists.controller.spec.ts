import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ListsController } from './lists.controller';
import { ListService } from './lists.service';

describe('ListsController', () => {
  let listsController: ListsController;
  let listService: ListService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ListsController],
      providers: [ListService],
    }).compile();

    listService = app.get<ListService>(ListService);
    listsController = app.get<ListsController>(ListsController);
  });

  describe('root', () => {
    it('should return an array of lists', async () => {
      const result = [];
      jest.spyOn(listService, 'getLists').mockImplementation(() => result);
      expect(await listsController.getLists()).toBe(
        new HttpException('blah', HttpStatus.NOT_FOUND),
      );
    });
  });
});
