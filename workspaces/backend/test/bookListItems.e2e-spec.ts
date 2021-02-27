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
import { createBookListItem, createList } from './mock/createDtos';
import { UpdateListItemOrdinalsDto } from 'src/listItems/definitions/listItem.dto';
import { BookListItemDto } from 'src/listItems/books/definitions/bookListItem.dto';

const BASE_URL = '/books/list-items';

describe('Book List Items', () => {
  let app: INestApplication;
  let accessToken;
  let list;
  let listItem;
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

  it('/POST valid request', () => {
    const body = {
      ...createBookListItem,
      list: list.id,
    };
    return request(app.getHttpServer())
      .post(BASE_URL)
      .set('authorization', accessToken)
      .send(body)
      .expect(201)
      .then(res => {
        listItem = res.body;
      });
  });

  it('/GET book list items no query', async () => {
    return request(app.getHttpServer())
      .get(`${BASE_URL}?list=${list.id}`)
      .set('authorization', accessToken)
      .expect(200)
      .then(res => {
        expect(res.body.data).toBeTruthy();
        expect(res.body.total).toBe(1);
        expect(res.body.data[0].id).toEqual(listItem.id);
      });
  });

  it('/GET book list items invalid', async () => {
    return request(app.getHttpServer())
      .get(`${BASE_URL}/123`)
      .set('authorization', accessToken)
      .expect(400);
  });

  it('/GET book list items w/ query', async () => {
    return request(app.getHttpServer())
      .get(`${BASE_URL}?listType=0&list=${list.id}`)
      .set('authorization', accessToken)
      .expect(200)
      .then(res => {
        expect(res.body.data).toBeTruthy();
        expect(res.body.data[0].id).toEqual(listItem.id);
      });
  });

  it('/GET book list item by id', async () => {
    return request(app.getHttpServer())
      .get(`${BASE_URL}/${listItem.id}`)
      .set('authorization', accessToken)
      .expect(200)
      .then(res => {
        expect(res.body.id).toEqual(listItem.id);
      });
  });

  it('/POST update multiple ordinals', async () => {
    const item1 = {
      ...createBookListItem,
      list: list.id,
    };
    const item2 = {
      ...createBookListItem,
      list: list.id,
      ordinal: 1,
    };
    const item3 = {
      ...createBookListItem,
      list: list.id,
      ordinal: 2,
    };
    // Create three test items
    let createdItem1: BookListItemDto;
    await request(app.getHttpServer())
      .post(BASE_URL)
      .set('authorization', accessToken)
      .send(item1)
      .then(res => {
        createdItem1 = res.body;
      });
    let createdItem2: BookListItemDto;
    await request(app.getHttpServer())
      .post(BASE_URL)
      .set('authorization', accessToken)
      .send(item2)
      .then(res => {
        createdItem2 = res.body;
      });
    let createdItem3: BookListItemDto;
    await request(app.getHttpServer())
      .post(BASE_URL)
      .set('authorization', accessToken)
      .send(item3)
      .then(res => {
        createdItem3 = res.body;
      });

    const updateRequest = new UpdateListItemOrdinalsDto(list.id, [
      {
        listItemId: createdItem1.id,
        ordinal: 2,
      },
      {
        listItemId: createdItem2.id,
        ordinal: 1,
      },
      {
        listItemId: createdItem3.id,
        ordinal: 0,
      },
    ]);

    await request(app.getHttpAdapter())
      .post(`${BASE_URL}/updateOrdinals`)
      .set('authorization', accessToken)
      .send(updateRequest);

    await request(app.getHttpServer())
      .get(`${BASE_URL}/${createdItem1.id}`)
      .set('authorization', accessToken)
      .expect(200)
      .then(res => {
        expect(res.body.id).toEqual(listItem.id);
        expect(res.body.ordinal).toEqual(2);
      });
    await request(app.getHttpServer())
      .get(`${BASE_URL}/${createdItem2.id}`)
      .set('authorization', accessToken)
      .expect(200)
      .then(res => {
        expect(res.body.id).toEqual(listItem.id);
        expect(res.body.ordinal).toEqual(1);
      });
    await request(app.getHttpServer())
      .get(`${BASE_URL}/${createdItem3.id}`)
      .set('authorization', accessToken)
      .expect(200)
      .then(res => {
        expect(res.body.id).toEqual(listItem.id);
        expect(res.body.ordinal).toEqual(0);
      });
  });

  it('/PATCH book list item', async () => {
    const body = {
      ordinal: 1,
    };
    await request(app.getHttpServer())
      .patch(`${BASE_URL}/${listItem.id}`)
      .set('authorization', accessToken)
      .send(body)
      .expect(200);

    const result = await request(app.getHttpServer())
      .get(`${BASE_URL}/${listItem.id}`)
      .set('authorization', accessToken);

    expect(result.body.id).toEqual(listItem.id);
    expect(result.body.ordinal).toEqual(body.ordinal);
  });

  it('/DELETE book list item', async () => {
    return request(app.getHttpServer())
      .delete(`${BASE_URL}/${listItem.id}`)
      .set('authorization', accessToken)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
    await closeInMongodConnection();
  });
});
