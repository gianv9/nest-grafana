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
