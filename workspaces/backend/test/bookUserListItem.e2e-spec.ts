import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpModule, HttpService, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ListsModule } from '../src/lists/lists.module';
import { AuthzModule } from 'src/authz/authz.module';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from './mongoose-test.module';
import { ListItemsModule } from 'src/listItems/listItems.module';
import { OpenLibraryModule } from 'src/openLibrary/openLibrary.module';
import { UserListsModule } from 'src/userLists/userLists.module';
import { UserListItemsModule } from 'src/userListItems/userListItems.module';
import {
  createBookListItem,
  createBULI,
  createList,
  createUserList,
} from './mock/createDtos';
import { BookReadingStatus } from 'src/common/types/userListItemStatus';

const BASE_URL = '/books/user-list-items';

describe('Book User List Items', () => {
  let app: INestApplication;
  let accessToken;
  let list;
  let bookListItem;
  let userList;
  let buli;
  // let listService = { findall: () => ['test'] }; --service mocking

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        rootMongooseTestModule(), // -- in memory mongodb
        //MongooseModule.forRoot(process.env.TEST_DB_URL), -- hosted mongodb
        ListsModule,
        AuthzModule,
        HttpModule,
        OpenLibraryModule,
        ListItemsModule,
        UserListsModule,
        UserListItemsModule,
      ],
    })
      // .overrideProvider(ListService) // add these to mock the service implementation
      // .useValue(listService) --service mocking
      .compile();
    const httpService = new HttpService();
    const token = await httpService
      .post(process.env.AUTH0_TOKEN_URL, process.env.TEST_TOKEN_DATA, {
        headers: { 'content-type': 'application/json' },
      })
      .toPromise();
    accessToken = `Bearer ${token.data.access_token}`;

    app = moduleRef.createNestApplication();
    await app.init();
    await request(app.getHttpServer())
      .post('/lists')
      .set('authorization', accessToken)
      .send(createList)
      .then(async res => {
        list = res.body;
        await request(app.getHttpServer())
          .post('/books/list-items')
          .set('authorization', accessToken)
          .send({ ...createBookListItem, list: list.id })
          .then(res => {
            bookListItem = res.body;
          });

        await request(app.getHttpServer())
          .post('/user-lists')
          .set('authorization', accessToken)
          .send({ ...createUserList, list: list.id })
          .then(res => {
            userList = res.body;
          });
      });
  });

  it('/POST BULI valid request', async () => {
    const body = {
      ...createBULI,
      userList: userList.id,
      bookListItem: bookListItem.id,
    };
    return request(app.getHttpServer())
      .post(BASE_URL)
      .set('authorization', accessToken)
      .send(body)
      .expect(201)
      .then(res => {
        buli = res.body;
      });
  });

  it('/GET BULI', async () => {
    return request(app.getHttpServer())
      .get(`${BASE_URL}`)
      .set('authorization', accessToken)
      .expect(200)
      .then(res => {
        const { data } = res.body;
        expect(data).toBeTruthy();
        const dataIncludesCreatedValue = data.some(dto => dto.id === buli.id);
        expect(dataIncludesCreatedValue).toBeTruthy();
      });
  });

  it('/GET BULI by user list id invalid', async () => {
    return request(app.getHttpServer())
      .get(`${BASE_URL}?userListId=123`)
      .set('authorization', accessToken)
      .expect(400 || 404);
  });

  it('/GET BULI by user list id valid', async () => {
    return request(app.getHttpServer())
      .get(`${BASE_URL}?userListId=${userList.id}`)
      .set('authorization', accessToken)
      .expect(200)
      .then(res => {
        const { data } = res.body;
        expect(data).toBeTruthy();
        const dataIncludesCreatedValue = data.some(dto => dto.id === buli.id);
        expect(dataIncludesCreatedValue).toBeTruthy();
      });
  });

  it('/GET BULI by id valid', async () => {
    return request(app.getHttpServer())
      .get(`${BASE_URL}/${buli.id}`)
      .set('authorization', accessToken)
      .expect(200)
      .then(res => {
        expect(res.body).toBeTruthy();
        const resultBULI = res.body;
        expect(resultBULI?.id).toEqual(buli.id);
        expect(resultBULI.bookListItem.id).toEqual(bookListItem.id);
        expect(resultBULI.userList.id).toEqual(userList.id);
      });
  });

  it('/GET BULI by id invalid', async () => {
    return request(app.getHttpServer())
      .get(`${BASE_URL}/123`)
      .set('authorization', accessToken)
      .expect(400 || 404);
  });

  it('/PATCH BULI', async () => {
    const body = {
      notes: 'updated notes',
      status: BookReadingStatus.completed,
      owned: false,
      rating: 3,
    };
    await request(app.getHttpServer())
      .patch(`${BASE_URL}/${buli.id}`)
      .set('authorization', accessToken)
      .send(body)
      .expect(200);

    const result = await request(app.getHttpServer())
      .get(`${BASE_URL}/${buli.id}`)
      .set('authorization', accessToken);

    expect(result.body.id).toEqual(buli.id);
    expect(result.body.notes).toEqual(body.notes);
    expect(result.body.status).toEqual(body.status);
    expect(result.body.owned).toEqual(body.owned);
    expect(result.body.rating).toEqual(body.rating);
  });

  it('/DELETE BULI', async () => {
    await request(app.getHttpServer())
      .delete(`${BASE_URL}/${buli.id}`)
      .set('authorization', accessToken)
      .expect(200);

    return request(app.getHttpServer())
      .get(`${BASE_URL}/${buli.id}`)
      .set('authorization', accessToken)
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
    await closeInMongodConnection();
  });
});
