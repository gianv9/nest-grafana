import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrometheusService } from './prometheus.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly prometheusService: PrometheusService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    // Continue processing the request
    res.on('finish', () => {
      const duration = (Date.now() - startTime) / 1000; // Convert to seconds
      const route = req.route?.path || req.path || 'unknown';
      const method = req.method;
      const statusCode = res.statusCode.toString();

      // Increment request counter
      this.prometheusService.httpRequestsTotal.inc({
        method,
        route,
        status_code: statusCode,
      });

      // Observe request duration
      this.prometheusService.httpRequestDuration.observe(
        {
          method,
          route,
        },
        duration
      );
    });

    next();
  }
}