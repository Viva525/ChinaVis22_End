// This file is created by egg-ts-helper@1.30.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportResponseTime from '../../../app/middleware/response_time';

declare module 'egg' {
  interface IMiddleware {
    responseTime: typeof ExportResponseTime;
  }
}
