// This file is created by egg-ts-helper@1.30.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportNetwork from '../../../app/controller/network';
import ExportNode from '../../../app/controller/node';

declare module 'egg' {
  interface IController {
    network: ExportNetwork;
    node: ExportNode;
  }
}
