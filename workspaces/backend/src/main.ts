import { NestFactory } from '@nestjs/core';
import * as helmet from 'helmet';
import * as cors from 'cors';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cors());

  await app.listen(process.env.API_PORT);
}
bootstrap();
