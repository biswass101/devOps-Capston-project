# Secret Management

## Strategy used
This assignment uses **Kubernetes Secrets** as the baseline mechanism for sensitive values.

Two secret manifests are included:
- `kubernetes/secrets/db-credentials.yaml`
- `kubernetes/secrets/api-keys.yaml`

## What is stored as secrets
- PostgreSQL database name
- PostgreSQL username
- PostgreSQL password
- application `DATABASE_URL`
- JWT secret
- external API key placeholder

## How applications consume the secrets
The backend deployment reads secret values using `secretKeyRef`. This avoids hardcoding credentials inside the deployment manifest or container image.

## How to create and update secrets
### Apply static manifest
```bash
kubectl apply -f kubernetes/secrets/db-credentials.yaml
kubectl apply -f kubernetes/secrets/api-keys.yaml
```

### Better production approach
For production, do not commit real values. Instead, create secrets from CI/CD or a secret manager:
```bash
kubectl create secret generic db-credentials   --from-literal=POSTGRES_DB=bmidb   --from-literal=POSTGRES_USER=bmi_user   --from-literal=POSTGRES_PASSWORD='super-secret'   --from-literal=DATABASE_URL='postgresql://...'
```

## Recommended improvement
For a real production cluster, integrate with one of these:
- HashiCorp Vault
- External Secrets Operator
- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager

That removes the need to keep even placeholder secret manifests in source control.
