import { DateTimeNode } from '../../parsing/patterns/date';
import { NumberParams } from '../numbers';

export interface DateFormatRequest {
  wrapper?: string;
  date?: DateTimeNode[];
  time?: DateTimeNode[];
  params: NumberParams;
}

export interface DateIntervalFormatRequest {
  date?: DateTimeNode[];
  range?: DateTimeNode[];
  skeleton?: string;
  params: NumberParams;
  wrapper: string;
}
