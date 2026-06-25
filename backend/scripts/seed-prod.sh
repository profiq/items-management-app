#!/usr/bin/env bash
#
# Seed the production database by running the seed script as a one-off
# Cloud Run Job, reusing the exact image, Cloud SQL connection, env vars and
# secrets of the already-deployed backend service.
#
# It does NOT touch the live service — it creates/updates a separate Job
# (default name: seed-prod) and executes it once.
#
# Requirements: gcloud CLI, authenticated with access to the prod project.
#
# Usage:
#   ./scripts/seed-prod.sh            # safe: seed only if DB is empty
#   FORCE=true ./scripts/seed-prod.sh # pass --force to the seed
#
# Override defaults via env:
#   PROJECT, REGION, SERVICE, JOB
#
set -euo pipefail

PROJECT="${PROJECT:-pq-reference-app-prod}"
REGION="${REGION:-europe-west1}"
SERVICE="${SERVICE:-pq-reference-backend-prod}"
JOB="${JOB:-seed-prod}"
FORCE="${FORCE:-false}"

echo "Project: $PROJECT | Region: $REGION | Service: $SERVICE | Job: $JOB"

describe() {
  gcloud run services describe "$SERVICE" \
    --project "$PROJECT" --region "$REGION" "$@"
}

echo "Reading config from deployed service..."
IMAGE="$(describe --format='value(spec.template.spec.containers[0].image)')"
CLOUDSQL="$(describe --format='value(spec.template.metadata.annotations["run.googleapis.com/cloudsql-instances"])')"

if [[ -z "$IMAGE" ]]; then
  echo "ERROR: could not read image from service $SERVICE" >&2
  exit 1
fi
echo "  image:    $IMAGE"
echo "  cloudsql: ${CLOUDSQL:-<none>}"

# Plain env vars (name=value), comma-separated.
ENV_VARS="$(describe --format=json \
  | node -e '
    const d = JSON.parse(require("fs").readFileSync(0, "utf8"));
    const env = d.spec.template.spec.containers[0].env || [];
    const plain = env.filter(e => e.value !== undefined).map(e => `${e.name}=${e.value}`);
    process.stdout.write(plain.join("@@"));
  ')"

# Secret-backed env vars (name=secretName:version), comma-separated.
SECRETS="$(describe --format=json \
  | node -e '
    const d = JSON.parse(require("fs").readFileSync(0, "utf8"));
    const env = d.spec.template.spec.containers[0].env || [];
    const secrets = env
      .filter(e => e.valueFrom && e.valueFrom.secretKeyRef)
      .map(e => `${e.name}=${e.valueFrom.secretKeyRef.name}:${e.valueFrom.secretKeyRef.key}`);
    process.stdout.write(secrets.join("@@"));
  ')"

# Build the seed command (override the container entrypoint).
ARGS="backend/dist/db/seed.js"
if [[ "$FORCE" == "true" ]]; then
  ARGS="$ARGS,--force"
fi

# Assemble gcloud flags.
FLAGS=(
  --project "$PROJECT"
  --region "$REGION"
  --image "$IMAGE"
  --command node
  --args "$ARGS"
  --max-retries 0
  --task-timeout 600
)
[[ -n "$CLOUDSQL" ]] && FLAGS+=(--set-cloudsql-instances "$CLOUDSQL")
[[ -n "$ENV_VARS" ]] && FLAGS+=(--set-env-vars "^@@^${ENV_VARS}")
[[ -n "$SECRETS" ]] && FLAGS+=(--set-secrets "^@@^${SECRETS}")

if gcloud run jobs describe "$JOB" --project "$PROJECT" --region "$REGION" >/dev/null 2>&1; then
  echo "Updating existing job $JOB..."
  gcloud run jobs update "$JOB" "${FLAGS[@]}"
else
  echo "Creating job $JOB..."
  gcloud run jobs create "$JOB" "${FLAGS[@]}"
fi

echo "Executing job (this seeds the production DB)..."
gcloud run jobs execute "$JOB" --project "$PROJECT" --region "$REGION" --wait

echo "Done. Check logs with:"
echo "  gcloud run jobs executions list --job $JOB --project $PROJECT --region $REGION"
