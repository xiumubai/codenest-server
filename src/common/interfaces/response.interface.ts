export interface Response<T> {
  data: T;
  code: number;
  message: string;
}

export enum ResponseCode {
  SUCCESS = 0,
  ERROR = -1,
}
