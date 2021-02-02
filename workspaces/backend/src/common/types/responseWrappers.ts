export class DataTotalResponse<T> {
  data: T[];
  total: number;

  constructor(data: T[], total?: number) {
    this.data = data;
    this.total = total ? total : data.length;
  }
}
