# Adding HTTP Metrics to NestJS - Tutorial

## 🎯 Problem Solved

The original Medium tutorial showed HTTP metrics panels (`http_requests_total`, `http_request_duration_seconds`) but **never explained how to implement them**. The basic `prom-client.collectDefaultMetrics()` only provides Node.js process metrics (CPU, memory, etc.) but NOT HTTP request tracking.

## 🔧 Solution: Custom HTTP Middleware

This tutorial shows how to add the missing HTTP metrics to make the dashboard panels work.

## 📋 Implementation Steps

### Step 1: Update PrometheusService

Add HTTP metrics definitions to your `prometheus.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly register: client.Registry;
  public readonly httpRequestsTotal: client.Counter<string>;
  public readonly httpRequestDuration: client.Histogram<string>;

  constructor() {
    this.register = new client.Registry();
    this.register.setDefaultLabels({ app: 'nestjs-prometheus' });
    client.collectDefaultMetrics({ register: this.register });

    // HTTP request counter
    this.httpRequestsTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    // HTTP request duration histogram
    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      registers: [this.register],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    });
  }

  getMetrics(): Promise<string> {
    return this.register.metrics();
  }
}
```

### Step 2: Create Metrics Middleware

Create `metrics.middleware.ts`:

```typescript
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
```

### Step 3: Apply Middleware to All Routes

Update your `app.module.ts`:

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrometheusController } from './prometheus.controller';
import { PrometheusService } from './prometheus.service';
import { MetricsMiddleware } from './metrics.middleware';

@Module({
  imports: [],
  controllers: [AppController, PrometheusController],
  providers: [AppService, PrometheusService, MetricsMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MetricsMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
```

### Step 4: Rebuild and Test

```bash
# Rebuild containers with new HTTP metrics
docker compose down
docker compose up --build -d

# Test the metrics endpoint
curl http://localhost:3000/metrics | grep "http_requests_total"
curl http://localhost:3000/metrics | grep "http_request_duration"

# Make some requests to generate data
curl http://localhost:3000/
curl http://localhost:3000/
curl http://localhost:3000/
```

## 📊 Metrics Generated

### HTTP Request Counter
```
http_requests_total{method="GET",route="/",status_code="200"} 3
http_requests_total{method="GET",route="/metrics",status_code="200"} 5
```

### HTTP Request Duration Histogram
```
http_request_duration_seconds_sum{method="GET",route="/"} 0.006
http_request_duration_seconds_count{method="GET",route="/"} 3
http_request_duration_seconds_bucket{le="0.01",method="GET",route="/"} 3
# ... more buckets
```

## 🎨 Grafana Dashboard Queries

The original tutorial dashboard queries now work:

**Total HTTP Requests Panel:**
```promql
http_requests_total
```

**Request Duration Panel:**
```promql
http_request_duration_seconds_sum / http_request_duration_seconds_count
```

## 🔍 What the Metrics Track

### Request Counter (`http_requests_total`)
- **method**: HTTP method (GET, POST, etc.)
- **route**: Endpoint path (/, /metrics, etc.)
- **status_code**: HTTP response code (200, 404, 500, etc.)

### Duration Histogram (`http_request_duration_seconds`)
- **method**: HTTP method
- **route**: Endpoint path
- **Buckets**: Response time ranges (0.01s, 0.05s, 0.1s, etc.)
- **_sum**: Total time for all requests
- **_count**: Total number of requests

## 🎯 Key Benefits

1. **Complete Request Tracking**: Every HTTP request is monitored
2. **Performance Insights**: Response time analysis with histogram buckets
3. **Route-Level Metrics**: Track performance per endpoint
4. **Status Code Monitoring**: Identify error rates
5. **Real-time Visualization**: Grafana dashboard shows live data

## ⚠️ Tutorial Gap Explanation

The original Medium tutorial was incomplete because:

1. **Showed dashboard panels** for HTTP metrics without explaining implementation
2. **Only implemented** basic `collectDefaultMetrics()` (Node.js process metrics)
3. **Assumed** HTTP metrics would "just work" 
4. **Missing** the custom middleware implementation entirely

This addition makes the tutorial complete and functional!

## 📈 Results

After implementation, your Grafana dashboard will show:
- ✅ HTTP request trends over time
- ✅ Request duration analysis
- ✅ Status code distribution
- ✅ Per-route performance metrics

The "No data" panels are now populated with real HTTP traffic metrics!