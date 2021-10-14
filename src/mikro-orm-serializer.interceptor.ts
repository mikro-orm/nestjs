import { isObject } from '@nestjs/common/utils/shared.utils';
import { BaseEntity } from '@mikro-orm/core';
import { map, Observable } from 'rxjs';
import {
  Injectable,
  CallHandler,
  StreamableFile,
  NestInterceptor,
  ExecutionContext,
  PlainLiteralObject,
} from '@nestjs/common';

@Injectable()
export class MikroOrmSerializerInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(map((res: PlainLiteralObject | Array<PlainLiteralObject>) => this.serialize(res)));
  }

  /**
   * Serializes responses that are non-null objects nor streamable files.
   */
  serialize(
    response: PlainLiteralObject | Array<PlainLiteralObject>,
  ): PlainLiteralObject | Array<PlainLiteralObject> {
    if (!isObject(response) || response instanceof StreamableFile) return response;
    return Array.isArray(response)
      ? response.map((item) => this.transformToPOJO(item))
      : this.transformToPOJO(response);
  }

  /**
   * Transformation to POJO if argument is a BaseEntity instance
   */
  transformToPOJO(plainOrEntity: any): PlainLiteralObject {
    return plainOrEntity instanceof BaseEntity ? plainOrEntity.toPOJO() : plainOrEntity;
  }
}
