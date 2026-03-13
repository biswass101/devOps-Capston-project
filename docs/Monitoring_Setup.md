# Monitoring Setup

## Stack choice
This assignment uses:
- **Prometheus** for metrics collection
- **Loki** for log aggregation
- **Grafana** for dashboards and visualization
- **Alertmanager** for alert routing

## Recommended installation approach
### Prometheus and Grafana
Use the `kube-prometheus-stack` Helm chart.

Example:
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack   --namespace monitoring --create-namespace   -f kubernetes/monitoring-values-prometheus.yaml
```

### Loki
Use the Grafana Loki Helm chart.

Example:
```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm upgrade --install loki grafana/loki   --namespace monitoring   -f kubernetes/loki-values.yaml
```

## Metrics collection plan
- Kubernetes node and pod metrics come from kube-state-metrics, node-exporter, and cAdvisor through kube-prometheus-stack
- Backend metrics can later be improved with `prom-client`
- PostgreSQL metrics can be exposed with postgres-exporter
- Redis metrics can be exposed with redis-exporter

## Logs collection plan
Deploy Grafana Alloy or Promtail to ship pod logs to Loki.

## Dashboards included
- `grafana/dashboards/application-dashboard.json`
- `grafana/dashboards/kubernetes-dashboard.json`

## Alerting rules included
`kubernetes/alert-rules.yaml` provides starter alerts for:
- backend restart spikes
- high backend CPU

## Access
After deployment, Grafana can be accessed through port-forwarding or an Ingress.
Example:
```bash
kubectl port-forward svc/kube-prometheus-stack-grafana -n monitoring 3000:80
```
