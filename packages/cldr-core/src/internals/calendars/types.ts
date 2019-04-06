import { DateTimeNode } from '../../parsing/date';
import { NumberParams } from '../../common/private';

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
