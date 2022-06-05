// This file is created by egg-ts-helper@1.30.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportParamsConvert from '../../../app/middleware/paramsConvert';

declare module 'egg' {
  interface IMiddleware {
    paramsConvert: typeof ExportParamsConvert;
  }
}
