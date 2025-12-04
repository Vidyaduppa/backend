export interface ResponseData<T = any> {
  statusCode: number;
  message: string;
  notification?: string;
  result?: T;
  error?: string;
}
