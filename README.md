# NestJS Monitoring with Prometheus and Grafana

Tutorial implementation based on: [Monitoring a NestJS Application with Prometheus and Grafana](https://medium.com/@islam.farid16/monitoring-a-nestjs-application-with-prometheus-and-grafana-31436a495d0e)

## 🎉 Status: COMPLETED ✅

All monitoring components are successfully set up and working!

## Progress Log

### Setup Phase ✅
- [x] Set up initial NestJS project structure
- [x] Install required dependencies for monitoring (`prom-client`)
- [x] Configure Prometheus metrics endpoint in NestJS
- [x] Containerize NestJS application with Docker
- [x] Set up Docker Compose for all services
- [x] Configure Prometheus to scrape NestJS metrics
- [x] Set up Grafana dashboards for NestJS monitoring
- [x] Test the complete monitoring setup
- [x] Document setup and usage in README

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js (for local development)

### Start the Monitoring Stack

```bash
# Clone and navigate to project
git clone https://github.com/gianv9/nest-grafana.git
cd nest-grafana

# Start all services
docker compose up --build -d
```

### Access Services
- **NestJS App**: http://localhost:3000
- **Prometheus**: http://localhost:9090  
- **Grafana**: http://localhost:3001 (admin/admin)

### View Metrics
- **Raw metrics**: http://localhost:3000/metrics
- **Prometheus UI**: http://localhost:9090 (query: `up`, `process_resident_memory_bytes`, etc.)
- **Grafana Dashboard**: http://localhost:3001 → NestJS Monitoring Dashboard

## 📊 What's Monitored

The dashboard tracks:
- ✅ **System Metrics**: CPU usage, Memory usage
- ✅ **Application Metrics**: Uptime, Process stats
- ⚠️ **HTTP Metrics**: Request counts/duration (requires additional middleware)

## 🛠 Commands Used

```bash
# Initial setup
npm install -g @nestjs/cli
nest new nest-prometheus-app
cd nest-prometheus-app
npm install prom-client

# Docker setup
docker compose up --build -d
docker compose down
docker ps

# Testing
curl http://localhost:3000/metrics
curl http://localhost:9090/api/v1/targets
```

## 📁 Project Structure

```
nest-grafana/
├── docker-compose.yml          # All services configuration
├── prometheus.yml              # Prometheus scraping config
├── grafana-dashboard.json      # Dashboard template
├── nest-app/                   # NestJS application
│   ├── Dockerfile             # Container configuration
│   ├── src/
│   │   ├── prometheus.service.ts    # Metrics service
│   │   ├── prometheus.controller.ts # /metrics endpoint
│   │   └── app.module.ts           # Updated module
│   └── ...
└── README.md
```

## 🎯 Key Learnings & Tips

1. **Docker Networking**: Using container names (`nest-app:3000`) instead of `host.docker.internal` for reliable container-to-container communication

2. **Containerization Benefits**: All services in Docker containers eliminates host networking issues and provides consistent environments

3. **Default Metrics**: `prom-client.collectDefaultMetrics()` provides CPU, memory, and Node.js process metrics out of the box

4. **Grafana Data Source**: Use `http://prometheus:9090` as the URL when both containers are in the same Docker network

5. **Dashboard Import**: The tutorial's JSON template works perfectly for basic monitoring visualization

## 🔧 Next Steps (Optional Enhancements)

- Add HTTP request tracking middleware for request count/duration metrics
- Set up alerting rules in Prometheus  
- Add custom business metrics
- Configure persistent volumes for Grafana dashboards
- Set up authentication for production use

## 📸 Dashboard Screenshot

![Grafana Dashboard](Screenshot%20from%202025-08-29%2009-03-39.png)

*The dashboard shows successful monitoring of CPU usage, memory consumption, and application uptime.*
