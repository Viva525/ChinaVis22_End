// This file is created by egg-ts-helper@1.30.2
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportEdge from '../../../app/service/edge';
import ExportLink from '../../../app/service/link';
import ExportNetwork from '../../../app/service/network';
import ExportNode from '../../../app/service/node';

declare module 'egg' {
  interface IService {
    edge: AutoInstanceType<typeof ExportEdge>;
    link: AutoInstanceType<typeof ExportLink>;
    network: AutoInstanceType<typeof ExportNetwork>;
    node: AutoInstanceType<typeof ExportNode>;
  }
}
