export class DataTotalResponse<T> {
  data: T[];
  total: number;

  constructor(data: T[]) {
    this.data = data;
    this.total = data.length;
  }
}
