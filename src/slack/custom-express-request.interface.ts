import { Request } from 'express';

export interface CustomExpressRequest extends Request {
  rawBody?: string;
}
