var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { InjectMikroORMs } from './mikro-orm.common.js';
let MultipleMikroOrmMiddleware = class MultipleMikroOrmMiddleware {
    orm;
    constructor(orm) {
        this.orm = orm;
    }
    use(req, res, next) {
        RequestContext.create(this.orm.map(orm => orm.em), next);
    }
};
MultipleMikroOrmMiddleware = __decorate([
    Injectable(),
    __param(0, InjectMikroORMs()),
    __metadata("design:paramtypes", [Array])
], MultipleMikroOrmMiddleware);
export { MultipleMikroOrmMiddleware };
