import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrometheusController } from './prometheus.controller';
import { PrometheusService } from './prometheus.service';

@Module({
  imports: [],
  controllers: [AppController, PrometheusController],
  providers: [AppService, PrometheusService],
})
export class AppModule {}
