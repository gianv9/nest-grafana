
medium.com
Monitoring a NestJS Application with Prometheus and Grafana
islam farid
8–11 minutes

islam farid

5 min read

Sep 29, 2024

--

A beginner friendly guide

Press enter or click to view image in full size

Monitoring applications is crucial for understanding their performance, availability, and health. In this article, we’ll walk through setting up monitoring for a NestJS application using Prometheus and Grafana. We’ll cover the entire process from installation to configuration, so whether you’re a beginner or looking to expand your knowledge, this guide is for you.

    Why Monitoring?

Monitoring allows developers to track various metrics, detect anomalies, and react to problems in real time. With Prometheus and Grafana, you can create powerful dashboards and visualizations to gain insights into your application’s behavior. Prometheus serves as the metrics collection and alerting tool, while Grafana provides a flexible platform to visualize these metrics.
Prerequisites

Before starting, ensure that you have:

    Node.js and npm installed.
    Docker (optional, for setting up Prometheus and Grafana quickly).
    Basic knowledge of NestJS.

Step 1: Setting Up a NestJS Application

If you don’t have a NestJS application yet, create one using the Nest CLI:

npm i -g @nestjs/cli
nest new nest-prometheus-app

Navigate to the project directory:

cd nest-prometheus-app

Now, install the Prometheus client for Node.js:

npm install prom-client

Configure Prometheus Metrics in NestJS

Create a new prometheus.service.ts file under the src folder:

import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly register: client.Registry;

  constructor() {
    this.register = new client.Registry();
    this.register.setDefaultLabels({ app: 'nestjs-prometheus' });
    client.collectDefaultMetrics({ register: this.register });
  }

  getMetrics(): Promise<string> {
    return this.register.metrics();
  }
}

Create a prometheus.controller.ts:

import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrometheusService } from './prometheus.service';

@Controller('metrics')
export class PrometheusController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get()
  async getMetrics(@Res() res: Response) {
    const metrics = await this.prometheusService.getMetrics();
    res.setHeader('Content-Type', 'text/plain');
    res.send(metrics);
  }
}

Add the Prometheus service and controller to your module:

import { Module } from '@nestjs/common';
import { PrometheusController } from './prometheus.controller';
import { PrometheusService } from './prometheus.service';

@Module({
  controllers: [PrometheusController],
  providers: [PrometheusService],
})
export class AppModule {}

Now, run the NestJS application:

npm run start

The metrics should now be accessible at http://localhost:3000/metrics.
Step 2: Setting Up Prometheus

    if you prefer to install Prometheus and Grafana without docker, here’s a step by step guide: install Prometheus and Grafana without docker

We’ll use Docker to run Prometheus. Create a new prometheus.yml configuration file in your root directory:

global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nestjs-app'
    static_configs:
      - targets: ['host.docker.internal:3000']

Now, start Prometheus using Docker:

docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

You can access the Prometheus UI at http://localhost:9090.

Verify Prometheus Configuration:

    Go to http://localhost:9090.
    In the search bar, type up and hit Execute.
    You should see a list of monitored targets, including nestjs-app.

Step 3: Setting Up Grafana

    if you prefer to install Prometheus and Grafana without docker, here’s a step by step guide: install Prometheus and Grafana without docker

Next, let’s visualize our metrics using Grafana. Run Grafana using Docker:

docker run -d \
  --name grafana \
  -p 3001:3000 \
  grafana/grafana

You can access Grafana at http://localhost:3001. The default login credentials are:

    Username: admin
    Password: admin

Add Prometheus as a Data Source:

    Log in to Grafana.
    Go to Configuration -> Data Sources.
    Click Add Data Source and select Prometheus.
    In the URL field, enter http://host.docker.internal:9090 and click Save & Test.

Create a Dashboard:

    Go to Create -> Dashboard.
    Click Add Query.
    Select Prometheus as the data source.
    In the query field, type rate(http_requests_total[5m]) to view the request rate.
    Customize your graph and save the dashboard.

Grafana Dashboard Template for NestJS (optional)

Here’s a ready-to-use Grafana JSON template that you can import to visualize NestJS metrics. It includes panels for tracking request counts, latency, and custom metrics.

Grafana JSON Template for NestJS

    Go to Grafana and select Create -> Import.
    Paste the JSON template provided below into the import box and click Load.
    Select your Prometheus data source and click Import.

    JSON Template:

{
  "id": null,
  "uid": null,
  "title": "NestJS Monitoring Dashboard",
  "tags": ["nestjs", "monitoring", "prometheus"],
  "timezone": "browser",
  "schemaVersion": 22,
  "version": 1,
  "panels": [
    {
      "type": "graph",
      "title": "Total HTTP Requests",
      "targets": [
        {
          "expr": "http_requests_total",
          "format": "time_series",
          "interval": "",
          "legendFormat": "{{method}} {{handler}}",
          "refId": "A"
        }
      ],
      "datasource": null,
      "xaxis": {
        "mode": "time"
      },
      "yaxes": [
        {
          "format": "short",
          "label": "Requests"
        }
      ],
      "gridPos": {
        "h": 9,
        "w": 12,
        "x": 0,
        "y": 0
      },
      "id": 1
    },
    {
      "type": "graph",
      "title": "Request Duration",
      "targets": [
        {
          "expr": "http_request_duration_seconds_sum / http_request_duration_seconds_count",
          "format": "time_series",
          "interval": "",
          "legendFormat": "Average Request Duration",
          "refId": "A"
        }
      ],
      "datasource": null,
      "xaxis": {
        "mode": "time"
      },
      "yaxes": [
        {
          "format": "s",
          "label": "Seconds"
        }
      ],
      "gridPos": {
        "h": 9,
        "w": 12,
        "x": 12,
        "y": 0
      },
      "id": 2
    },
    {
      "type": "singlestat",
      "title": "Up Time",
      "targets": [
        {
          "expr": "time() - process_start_time_seconds",
          "format": "time_series",
          "interval": "",
          "legendFormat": "Up Time",
          "refId": "A"
        }
      ],
      "valueName": "current",
      "format": "s",
      "gridPos": {
        "h": 4,
        "w": 12,
        "x": 0,
        "y": 9
      },
      "id": 3
    },
    {
      "type": "graph",
      "title": "Memory Usage",
      "targets": [
        {
          "expr": "process_resident_memory_bytes",
          "format": "time_series",
          "interval": "",
          "legendFormat": "Memory Usage",
          "refId": "A"
        }
      ],
      "datasource": null,
      "xaxis": {
        "mode": "time"
      },
      "yaxes": [
        {
          "format": "bytes",
          "label": "Bytes"
        }
      ],
      "gridPos": {
        "h": 9,
        "w": 12,
        "x": 0,
        "y": 13
      },
      "id": 4
    },
    {
      "type": "graph",
      "title": "CPU Usage",
      "targets": [
        {
          "expr": "rate(process_cpu_seconds_total[1m])",
          "format": "time_series",
          "interval": "",
          "legendFormat": "CPU Usage",
          "refId": "A"
        }
      ],
      "datasource": null,
      "xaxis": {
        "mode": "time"
      },
      "yaxes": [
        {
          "format": "percent",
          "label": "CPU"
        }
      ],
      "gridPos": {
        "h": 9,
        "w": 12,
        "x": 12,
        "y": 13
      },
      "id": 5
    }
  ],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-15m",
    "to": "now"
  },
  "timepicker": {
    "refresh_intervals": [
      "5s",
      "10s",
      "30s",
      "1m",
      "5m"
    ]
  },
  "refresh": "5s",
  "annotations": {
    "list": []
  }
}

    Key Panels Explained:

    Total HTTP Requests: Visualizes the number of requests per route.
    Request Duration: Shows average request duration.
    Up Time: Tracks how long the application has been running.
    Memory Usage: Displays memory usage of the application.
    CPU Usage: Shows CPU usage over time.

With this dashboard, you should be able to gain valuable insights into the performance and health of your NestJS application!
Conclusion

With this setup, you can now monitor your NestJS application using Prometheus and visualize metrics in Grafana. This guide should serve as a solid foundation for integrating more complex metrics and alerts. As you continue building your application, consider tracking additional metrics like error rates, request durations, and more.

Happy coding!
