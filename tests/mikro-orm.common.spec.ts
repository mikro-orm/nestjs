import { UseRequestContext, MikroOrmModule } from '../src';
import { Test } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { MikroORM, Options } from '@mikro-orm/core';

const testOptions: Options = {
  dbName: 'mikro_orm_test.db',
  type: 'sqlite',
  baseDir: __dirname,
  entities: ['entities'],
};

const TEST_VALUE='expected value';

@Injectable()
class TestClass {
  constructor(
    private readonly orm: MikroORM,
  ) {}

  @UseRequestContext()
  async asyncMethodReturnsValue() {
    return TEST_VALUE;
  }

  @UseRequestContext()
  methodReturnsValue() {
    return TEST_VALUE;
  }

  @UseRequestContext()
  async asyncMethodReturnsNothing() {
  }

  @UseRequestContext()
  methodReturnsNothing() {
  }
}

describe('UseRequestContext', () => {
  describe('Given a class', () => {
    let testClass: TestClass;

    beforeEach(async () => {
      const module = await Test.createTestingModule({
        imports: [MikroOrmModule.forRoot(testOptions)],
        providers: [TestClass]
      }).compile();
      testClass = module.get<TestClass>(TestClass);
    });

    describe('when call an async decorated method', () => {
      let testMethod: string;

      beforeEach(async () => {
        testMethod = await testClass.asyncMethodReturnsValue();
      });

      it('returns correct value', async () => {
        expect(testMethod).toEqual(TEST_VALUE);
      });
    });

    describe('when call a decorated method', () => {
      let testMethod: string | Promise<string>; //decorator changes return type

      beforeEach(() => {
        testMethod = testClass.methodReturnsValue();
      });

      it('returns correct value', () => {
        expect(testMethod).resolves.toEqual(TEST_VALUE);
      });
    });

    describe('when call an async decorated method that does not return anything', () => {
      let testMethod: void;

      beforeEach(async () => {
        testMethod = await testClass.asyncMethodReturnsNothing();
      });

      it('does not returns anything', () => {
        expect(testMethod).toBeUndefined();
      });
    });

    describe('when call a decorated method that does not return anything', () => {
      let testMethod: void;

      beforeEach(async () => {
        testMethod = testClass.methodReturnsNothing();
      });

      it('does not returns anything', () => {
        expect(testMethod).resolves.toBeUndefined();
      });
    });
  });
});
