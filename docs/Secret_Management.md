# Secret Management

## Strategy Used
This project uses **Kubernetes Secrets** as the primary secret management mechanism for the assignment environment. Secrets are defined as Kubernetes `Secret` resources and consumed by workloads through `secretKeyRef`.

Included secret manifests:
- `kubernetes/secrets/db-credentials.yaml`
- `kubernetes/secrets/api-keys.yaml`

This approach keeps sensitive values out of application code, Docker images, and ConfigMaps while staying simple enough for Minikube or a small lab cluster.

## Secret Inventory
- PostgreSQL database name
- PostgreSQL username
- PostgreSQL password
- application `DATABASE_URL`
- JWT secret
- external API key

## How Applications Access Secrets
The backend deployment consumes secrets through environment variables in `secretKeyRef` entries:

- `DATABASE_URL` from `db-credentials`
- `JWT_SECRET` from `api-keys`
- `API_KEY` from `api-keys`

This keeps the backend manifest free of inline credentials while still making the values available to the container at runtime.

Reference implementation:
- [backend-deployment.yaml](/home/biswass/Downloads/devops-assignment/kubernetes/backend-deployment.yaml)

## Secret Creation And Update Process
### 1. Edit placeholder manifests
The repository keeps only placeholder values in the secret manifests. Before applying them, replace placeholder text with your real values:

- [db-credentials.yaml](/home/biswass/Downloads/devops-assignment/kubernetes/secrets/db-credentials.yaml)
- [api-keys.yaml](/home/biswass/Downloads/devops-assignment/kubernetes/secrets/api-keys.yaml)

### 2. Apply the secrets
```bash
kubectl apply -f kubernetes/secrets/db-credentials.yaml
kubectl apply -f kubernetes/secrets/api-keys.yaml
```

### 3. Roll workloads if a secret changes
If an existing secret is updated, restart the backend so the new values are picked up:

```bash
kubectl rollout restart deployment/backend -n finch
```

### 4. Verify the secrets exist
```bash
kubectl get secrets -n finch
kubectl describe secret db-credentials -n finch
kubectl describe secret api-keys -n finch
```

## Safer Operational Workflow
For production-like usage, real secrets should not be committed to Git. A better flow is to create them from the terminal, CI/CD, or a dedicated secret manager:

```bash
kubectl create secret generic db-credentials \
  -n finch \
  --from-literal=POSTGRES_DB=bmidb \
  --from-literal=POSTGRES_USER=bmi_user \
  --from-literal=POSTGRES_PASSWORD='super-secret' \
  --from-literal=DATABASE_URL='postgresql://bmi_user:super-secret@postgresql.finch.svc.cluster.local:5432/bmidb' \
  --dry-run=client -o yaml | kubectl apply -f -
```

```bash
kubectl create secret generic api-keys \
  -n finch \
  --from-literal=JWT_SECRET='replace-with-long-random-secret' \
  --from-literal=API_KEY='replace-with-real-api-key' \
  --dry-run=client -o yaml | kubectl apply -f -
```

## Access Control And Handling Plan
- Keep only placeholder values in source control.
- Apply real secret values directly to the cluster or through CI/CD.
- Restrict namespace access with Kubernetes RBAC so only authorized users can read or update secrets.
- Avoid printing secret values in logs or committing them in screenshots.
- Rotate secrets by updating the secret resource and restarting dependent workloads.

## Recommended Production Strategy
For this assignment, Kubernetes Secrets are sufficient. For a real production cluster, the next step would be integrating with a dedicated secret backend such as:

- HashiCorp Vault
- External Secrets Operator
- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager

That would allow centralized rotation, auditing, and secret distribution without storing real values in repository manifests.

## Apply Order
When deploying the application, apply secrets before the backend:

```bash
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secrets/
kubectl apply -f kubernetes/postgresql-deployment.yaml
kubectl apply -f kubernetes/redis-deployment.yaml
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml
```

## Notes
- The frontend does not currently consume Kubernetes secrets directly.
- Anyone using these manifests must replace placeholder values before applying them.
- Secrets are base64-encoded by Kubernetes internally, not encrypted by default, so enabling etcd encryption at rest is recommended in production clusters.
