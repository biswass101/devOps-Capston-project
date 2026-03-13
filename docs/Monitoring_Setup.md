# Monitoring Setup

## Overview
This project uses a Prometheus, Loki, and Grafana monitoring stack to cover metrics, logs, dashboards, and alerting for the BMI Health Tracker Kubernetes environment.

Main components:

- Prometheus via the `kube-prometheus-stack` Helm chart
- Grafana via the same Helm chart
- Loki via the `grafana/loki` Helm chart
- Promtail for Kubernetes pod log shipping
- Grafana dashboards stored as JSON exports in `grafana/dashboards/`
- Prometheus alerting rules in `kubernetes/alert-rules.yaml`

## What Is Monitored
### Application and Service Metrics
- Frontend availability through `/healthz`
- Backend availability through `/health`
- Redis metrics through `redis-exporter`
- PostgreSQL metrics through `postgres-exporter`

### Kubernetes Platform Metrics
- Pod counts
- CPU and memory utilization
- pod restarts
- deployment availability

### Logs
- Pod logs from the `finch` namespace are shipped to Loki through Promtail
- Grafana can query Loki to inspect backend, frontend, Redis, and PostgreSQL logs

## Kubernetes Manifests And Values Files
### Prometheus / Grafana
- [monitoring-values-prometheus.yaml](/home/biswass/Downloads/devops-assignment/kubernetes/monitoring-values-prometheus.yaml)
- [servicemonitor-frontend.yaml](/home/biswass/Downloads/devops-assignment/kubernetes/servicemonitor-frontend.yaml)
- [servicemonitor-backend.yaml](/home/biswass/Downloads/devops-assignment/kubernetes/servicemonitor-backend.yaml)
- [servicemonitor-redis.yaml](/home/biswass/Downloads/devops-assignment/kubernetes/servicemonitor-redis.yaml)
- [servicemonitor-postgresql.yaml](/home/biswass/Downloads/devops-assignment/kubernetes/servicemonitor-postgresql.yaml)
- [redis-exporter.yaml](/home/biswass/Downloads/devops-assignment/kubernetes/redis-exporter.yaml)
- [postgresql-exporter.yaml](/home/biswass/Downloads/devops-assignment/kubernetes/postgresql-exporter.yaml)
- [alert-rules.yaml](/home/biswass/Downloads/devops-assignment/kubernetes/alert-rules.yaml)

### Loki / Log Collection
- [loki-values.yaml](/home/biswass/Downloads/devops-assignment/kubernetes/loki-values.yaml)
- [promtail-values.yaml](/home/biswass/Downloads/devops-assignment/kubernetes/promtail-values.yaml)

### Grafana Dashboards
- [application-dashboard.json](/home/biswass/Downloads/devops-assignment/grafana/dashboards/application-dashboard.json)
- [kubernetes-dashboard.json](/home/biswass/Downloads/devops-assignment/grafana/dashboards/kubernetes-dashboard.json)

## Deployment Steps
### 1. Install kube-prometheus-stack
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  -f kubernetes/monitoring-values-prometheus.yaml
```

### 2. Install Loki
```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

helm upgrade --install loki grafana/loki \
  --namespace monitoring \
  --create-namespace \
  -f kubernetes/loki-values.yaml
```

### 3. Install Promtail
```bash
helm upgrade --install promtail grafana/promtail \
  --namespace monitoring \
  -f kubernetes/promtail-values.yaml
```

### 4. Deploy exporters and ServiceMonitors
```bash
kubectl apply -f kubernetes/postgresql-exporter.yaml
kubectl apply -f kubernetes/redis-exporter.yaml
kubectl apply -f kubernetes/servicemonitor-frontend.yaml
kubectl apply -f kubernetes/servicemonitor-backend.yaml
kubectl apply -f kubernetes/servicemonitor-redis.yaml
kubectl apply -f kubernetes/servicemonitor-postgresql.yaml
kubectl apply -f kubernetes/alert-rules.yaml
```

## How Metrics Are Collected
- `kube-prometheus-stack` scrapes Kubernetes infrastructure metrics automatically.
- `ServiceMonitor` resources tell Prometheus how to scrape frontend and backend health endpoints.
- `redis-exporter` exposes Redis metrics on port `9121`.
- `postgresql-exporter` exposes PostgreSQL metrics on port `9187`.

Note: the frontend and backend applications do not currently expose rich Prometheus-format business metrics. In this assignment design, they are monitored primarily for availability and Kubernetes resource usage. A future improvement would be instrumenting the backend with `prom-client`.

## How Logs Are Collected
- Promtail discovers Kubernetes pods using Kubernetes service discovery.
- It tails container log files from the node filesystem.
- Logs are pushed into Loki.
- Grafana uses Loki as a data source for log panels and troubleshooting queries.

## Dashboard Coverage
### Application Dashboard
Intended to show:

- frontend availability
- backend availability
- backend CPU usage
- backend restart count
- frontend and backend resource comparison
- PostgreSQL health and connections
- Redis health and clients
- application logs from Loki

### Kubernetes Dashboard
Intended to show:

- namespace pod count
- requested PVC capacity
- HPA replica count
- namespace CPU usage
- namespace memory usage
- running pod count
- deployment replica availability
- namespace logs from Loki

## Accessing Grafana
Use port-forwarding:

```bash
kubectl port-forward svc/kube-prometheus-stack-grafana -n monitoring 3000:80
```

Then open:

```text
http://localhost:3000
```

## Managing Alerts
Alert rules are defined in [alert-rules.yaml](/home/biswass/Downloads/devops-assignment/kubernetes/alert-rules.yaml).

Included examples:

- backend unavailable
- backend restart spikes
- high backend CPU
- PostgreSQL exporter down
- Redis exporter down

To update alert rules:

```bash
kubectl apply -f kubernetes/alert-rules.yaml
```

To inspect them:

```bash
kubectl get prometheusrules -n finch
kubectl describe prometheusrule finch-alerts -n finch
```

## Verification Commands
```bash
kubectl get pods -n monitoring
kubectl get servicemonitors -n finch
kubectl get prometheusrules -n finch
kubectl get pods -n finch
```

## Notes
- The `release: kube-prometheus-stack` label is added to ServiceMonitors so they are discovered by the Helm-installed Prometheus instance.
- Replace the default Grafana admin password in `kubernetes/monitoring-values-prometheus.yaml` before using this outside a lab environment.
- The dashboards in this repository are JSON exports intended for import into Grafana after the data sources are available.
