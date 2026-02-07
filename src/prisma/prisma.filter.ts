// prisma-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;

        let columns: string[] = [];

        // Check meta.target first
        if (Array.isArray(exception.meta?.target)) {
          columns = exception.meta.target;
        }
        // Fallback: check driverAdapterError.cause.constraint.fields safely
        else if (
          exception.meta?.driverAdapterError &&
          typeof exception.meta.driverAdapterError === 'object' &&
          'cause' in exception.meta.driverAdapterError &&
          exception.meta.driverAdapterError.cause &&
          typeof exception.meta.driverAdapterError.cause === 'object' &&
          'constraint' in exception.meta.driverAdapterError.cause &&
          exception.meta.driverAdapterError.cause.constraint &&
          Array.isArray(
            (exception.meta.driverAdapterError.cause as any).constraint.fields,
          )
        ) {
          columns = (exception.meta.driverAdapterError.cause as any).constraint
            .fields;
        } else {
          columns = ['unknown_column'];
        }

        const columnNames = columns.join(', ');
        message = `Unique constraint failed on column(s): ${columnNames}`;
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = 'Foreign key constraint failed';
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;
      default:
        message = 'Unknown database error';
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
