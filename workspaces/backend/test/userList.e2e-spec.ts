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
  createList,
  createUserList,
} from './mock/createDtos';

const BASE_URL = '/user-lists';

describe('Lists', () => {
  let app: INestApplication;
  let accessToken;
  let list;
  let userList;
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
      .then(res => {
        list = res.body;
      });
  });

  it('/POST user list valid request', async () => {
    const body = {
      ...createUserList,
      list: list.id,
    };
    return request(app.getHttpServer())
      .post(BASE_URL)
      .set('authorization', accessToken)
      .send(body)
      .expect(201)
      .then(res => {
        userList = res.body;
      });
  });

  it('/GET user lists', async () => {
    return request(app.getHttpServer())
      .get(`${BASE_URL}`)
      .set('authorization', accessToken)
      .expect(200)
      .then(res => {
        expect(res.body.data).toBeTruthy();
        expect(res.body.total).toBe(1);
        expect(res.body.data[0].id).toEqual(userList.id);
      });
  });

  it('/GET populated user list invalid', async () => {
    return request(app.getHttpServer())
      .get(`${BASE_URL}/123`)
      .set('authorization', accessToken)
      .expect(400);
  });

  it('/GET populated user list valid', async () => {
    return request(app.getHttpServer())
      .get(`${BASE_URL}/${userList.id}`)
      .set('authorization', accessToken)
      .expect(200)
      .then(res => {
        expect(res.body).toBeTruthy();
        const resultUserList = res.body;
        expect(resultUserList?.id).toEqual(userList.id);
        expect(resultUserList.list.id).toEqual(list.id);
      });
  });

  it('/PATCH user list', async () => {
    const body = {
      notes: 'updated notes',
    };
    await request(app.getHttpServer())
      .patch(`${BASE_URL}/${userList.id}`)
      .set('authorization', accessToken)
      .send(body)
      .expect(200);

    const result = await request(app.getHttpServer())
      .get(`${BASE_URL}/${userList.id}`)
      .set('authorization', accessToken);

    expect(result.body.id).toEqual(userList.id);
    expect(result.body.notes).toEqual(body.notes);
  });

  it('/DELETE user list', async () => {
    return request(app.getHttpServer())
      .delete(`${BASE_URL}/${userList.id}`)
      .set('authorization', accessToken)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
    await closeInMongodConnection();
  });
});
