import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class OrderServiceLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(OrderServiceLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const userAgent = request.get('User-Agent') || '';
    const clientIp = request.ip || request.connection.remoteAddress;
    
    const now = Date.now();
    const requestId = Math.random().toString(36).substring(2, 15);
    
    // Log incoming request
    console.log(`🔥 [ORDER-SERVICE] [${requestId}] INCOMING REQUEST`);
    console.log(`📍 Method: ${method} | URL: ${url}`);
    console.log(`🌐 IP: ${clientIp} | User-Agent: ${userAgent}`);
    
    if (request.body && Object.keys(request.body).length > 0) {
      console.log(`📝 Request Body:`, JSON.stringify(request.body, null, 2));
    }
    
    if (request.query && Object.keys(request.query).length > 0) {
      console.log(`🔍 Query Params:`, JSON.stringify(request.query, null, 2));
    }
    
    if (request.params && Object.keys(request.params).length > 0) {
      console.log(`🎯 Route Params:`, JSON.stringify(request.params, null, 2));
    }
    
    return next.handle().pipe(
      tap((responseData) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const contentLength = response.get('content-length') || 'unknown';
        const responseTime = Date.now() - now;

        console.log(`✅ [ORDER-SERVICE] [${requestId}] REQUEST COMPLETED`);
        console.log(`📊 Status: ${statusCode} | Size: ${contentLength} bytes | Time: ${responseTime}ms`);
        
        if (responseData && typeof responseData === 'object') {
          console.log(`📤 Response Data:`, JSON.stringify(responseData, null, 2));
        }
        
        this.logger.log(
          `${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${responseTime}ms`
        );
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;
        console.error(`❌ [ORDER-SERVICE] [${requestId}] REQUEST FAILED`);
        console.error(`💥 Error: ${error.message} | Time: ${responseTime}ms`);
        console.error(`🔍 Stack:`, error.stack);
        
        this.logger.error(
          `${method} ${url} ERROR - ${error.message} ${responseTime}ms`
        );
        
        return throwError(() => error);
      })
    );
  }
}
