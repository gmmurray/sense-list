import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { ListsModule } from './lists/lists.module';
import { AuthzModule } from './authz/authz.module';
import { OpenLibraryModule } from './openLibrary/openLibrary.module';
import { ListItemsModule } from './listItems/listItems.module';
import { UserListsModule } from './userLists/userLists.module';
import { UserListItemsModule } from './userListItems/userListItems.module';
import { GoogleBooksModule } from './googleBooks/googleBooks.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DEV_DB_URL),
    ListsModule,
    AuthzModule,
    HttpModule,
    OpenLibraryModule,
    GoogleBooksModule,
    ListItemsModule,
    UserListsModule,
    UserListItemsModule,
  ],
})
export class AppModule {}
