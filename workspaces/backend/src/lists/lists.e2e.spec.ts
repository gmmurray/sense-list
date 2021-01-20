import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ListsModule } from './lists.module';
import { MongooseModule } from '@nestjs/mongoose';

describe('Lists', () => {
  let app: INestApplication;
  // let listService = { findall: () => ['test'] };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.DEV_DB_URL),
        ListsModule,
      ],
    })
      // .overrideProvider(ListService) // add these to mock the service implementation
      // .useValue(listService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/GET lists no query', () => {
    return request(app.getHttpServer())
      .get('/lists')
      .expect(200)
      .then(res => {
        expect(res.body.data).toBeTruthy();
        expect(res.body.total).toBe(res.body.data.length);
      });
  });

  it('/GET lists with query', () => {
    return request(app.getHttpServer())
      .get('/get?title=a')
      .expect(res => res.status === 200 || res.status === 404)
      .then(res => {
        if (res.status === 200) {
          expect(res.body.data).toBeTruthy();
          expect(res.body.total).toBe(res.body.data.length);
        }
      });
  });

  it('/GET lists with invalid query', () => {
    return request(app.getHttpServer())
      .get('/get?test=a')
      .expect(res => res.status === 200 || res.status === 404);
  });

  it('/GET lists/:id valid parameter', () => {
    return request(app.getHttpServer())
      .get('/lists/6005dc3e353a3a36549a07ce')
      .expect(res => res.status === 200 || res.status === 404);
  });

  it('/GET lists/:id invalid parameter', () => {
    return request(app.getHttpServer()).get('/lists/123').expect(400);
  });

  it('/POST lists valid request', () => {
    const body = {
      isPublic: false,
      title: 'test list',
      type: 0,
      category: 'auto-test',
    };
    return request(app.getHttpServer())
      .post('/lists')
      .send(body)
      .expect(201)
      .then(res => {
        const { isPublic, title, type, category } = res.body;
        expect(isPublic).toBe(body.isPublic);
        expect(title).toBe(body.title);
        expect(type).toBe(body.type);
        expect(category).toBe(body.category);
      });
  });

  it('/POST lists invalid request', () => {
    const body = {
      test: 'test',
    };
    return request(app.getHttpServer())
      .post('/lists')
      .send(body)
      .expect(400)
      .then(res => {
        expect(res.body.message).toBe('Validation Error');
      });
  });

  it('/PATCH lists/:id invalid request', () => {
    const body = {
      title: 'test',
    };
    return request(app.getHttpServer())
      .patch('/lists/123')
      .send(body)
      .expect(res => res.status === 404);
  });

  it('/DELETE lists/:id valid request', () => {
    return request(app.getHttpServer())
      .delete('/lists/123')
      .expect(res => res.status === 200 || res.status === 404);
  });

  afterAll(async () => {
    await app.close();
  });
});