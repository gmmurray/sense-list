import { ListType } from 'src/library/types/ListType';

export class List {
  constructor(
    public id: string,
    public isPublic: boolean,
    public title: string,
    public description: string,
    public type: ListType,
    public category: string,
    public ownerId: string,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
