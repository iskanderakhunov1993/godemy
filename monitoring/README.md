Monitoring stack (Prometheus + Grafana)

Run the monitoring stack locally:

```bash
cd monitoring
docker compose -f docker-compose.monitoring.yml up -d
```

Prometheus: http://localhost:9090
Grafana: http://localhost:3000 (admin / admin)

Notes:
- The `prometheus.yml` includes an example scrape target `host.docker.internal:8080` pointing to the backend metrics endpoint `/metrics`.
- If your backend runs on a different host/port, update `monitoring/prometheus/prometheus.yml` accordingly.
