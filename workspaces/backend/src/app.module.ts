import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ListsModule } from './lists/lists.module';

@Module({
  imports: [ConfigModule.forRoot(), ListsModule],
})
export class AppModule {}
