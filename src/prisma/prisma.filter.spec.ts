import { PrismaExceptionFilter } from './prisma.filter';

describe('PrismaFilter', () => {
  it('should be defined', () => {
    expect(new PrismaExceptionFilter()).toBeDefined();
  });
});
