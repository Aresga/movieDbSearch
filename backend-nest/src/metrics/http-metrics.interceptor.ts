import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Histogram } from 'prom-client';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<{ method: string; path?: string; route?: { path?: string } }>();
    const res = context.switchToHttp().getResponse<{ statusCode?: number }>();

    if (req.path === '/metrics') {
      return next.handle();
    }

    const start = process.hrtime.bigint();

    return next.handle().pipe(
      finalize(() => {
        const durationSec = Number(process.hrtime.bigint() - start) / 1e9;
        const route = req.route?.path ?? req.path ?? 'unknown';
        this.httpRequestDuration.observe(
          {
            method: req.method,
            route: String(route),
            status_code: String(res.statusCode ?? 0),
          },
          durationSec,
        );
      }),
    );
  }
}
