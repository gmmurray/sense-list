import { ListType } from '../listType';
export interface BaseList {
    isPublic: boolean;
    title: string;
    description: string;
    type: ListType;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface List extends BaseList {
    id: string;
}
