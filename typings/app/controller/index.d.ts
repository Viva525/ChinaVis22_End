// This file is created by egg-ts-helper@1.30.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportLink from '../../../app/controller/link';
import ExportNetwork from '../../../app/controller/network';
import ExportNode from '../../../app/controller/node';

declare module 'egg' {
  interface IController {
    link: ExportLink;
    network: ExportNetwork;
    node: ExportNode;
  }
}
