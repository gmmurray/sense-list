export class BookListItemMeta {
  constructor(
    public title: string,
    public subtitle: string,
    public authors: string[],
    public publishedDate: string,
    public description: string,
    public pageCount: number,
    public thumbnail_url: string,
    public language: string,
    public selfLink: string,
    public identifiers?: Record<string, string>,
  ) {}
}
