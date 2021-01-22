import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ListsModule } from './lists/lists.module';
import { AuthzModule } from './authz/authz.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DEV_DB_URL),
    ListsModule,
    AuthzModule,
  ],
})
export class AppModule {}
