# GitHub Actions Deploy Pipeline — Design

Date: 2026-06-18
Issue: #111 (`issue/111-deploy`)

## Goal

Port the existing GitLab CI pipeline (`.gitlab-ci.yml`) to GitHub Actions, as
close to **1:1** as the platform allows. The repo is hosted on GitHub, so the
GitLab pipeline can never run here; these workflows replace it.

Mirrors the GitLab model: **dev** deploys from `main` (+ on-demand), **prod**
deploys on tag. One Firebase/GCP project per environment (`*-dev` / `*-prod`),
shared by frontend and backend.

## Decisions (chosen for "1:1 + just works")

- **Auth:** base64 service-account key — same as GitLab
  (`GOOGLE_APPLICATION_CREDENTIALS_BASE64` secret). Decoded to a file; ADC for
  Firebase/gcloud, `_json_key_base64` docker login for Artifact Registry.
  No GCP-side WIF setup required.
- **Backend build:** `docker/build-push-action` (idiomatic on GitHub-hosted
  runners; GitLab's buildkit only existed to work around DinD on their runners).
- **CI gates:** lint + frontend unit/component + frontend e2e + backend unit/e2e.
- **Release:** changelog + GitHub Release on tag (ports `update_changelog` +
  `update_release_notes`).
- **Skipped:** `code_review` (Auggie) stage — bound to `glab` + Augment + GitLab
  MR API, not portable to GitHub in a way that reliably runs. `build_node_java`
  helper image — unnecessary.
- Firebase web-config values are **non-secret** Environment vars.
- Tag trigger matches **all tags** (mirrors GitLab `$CI_COMMIT_TAG`).

## File structure (`.github/workflows/`)

| File                  | Trigger                                   | GitLab equivalent                                                  |
| --------------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| `ci.yml`              | `pull_request` + `workflow_call`          | `code_quality` + `test` stages                                     |
| `deploy-frontend.yml` | `workflow_call` + `workflow_dispatch`     | frontend build + deploy jobs                                       |
| `deploy-backend.yml`  | `workflow_call` + `workflow_dispatch`     | backend build + deploy jobs                                        |
| `deploy.yml`          | `push` (main, tags) + `workflow_dispatch` | pipeline orchestration + `update_changelog`/`update_release_notes` |

`ci.yml` jobs: `changes` (paths-filter), `lint`, `frontend-test`,
`frontend-e2e` (Playwright + Java for emulators), `backend-test`.

## Environment mapping (trigger → GitHub Environment)

- `push` → **main** ⇒ **dev** (auto). Backend image tag = commit SHA.
- `push` → **tag** ⇒ **production**. Backend image tag = tag name. Both halves
  deploy unconditionally (matches GitLab tag rules), then changelog + release.
- `workflow_dispatch` ⇒ **dev** by default; standalone deploy workflows let you
  choose `dev` / `production` and the orchestrator lets you pick `both` /
  `frontend` / `backend`.

## Backend deploy (`deploy-backend.yml`)

1. checkout
2. `docker/login-action` to `europe-central2-docker.pkg.dev`
   (`_json_key_base64` + base64 key)
3. `docker/build-push-action` — context `.`, file `backend/Dockerfile`,
   `platform linux/amd64`, tags `$AR_IMAGE:$TAG` + `:latest`, push
4. decode key + `gcloud auth login --cred-file`
5. `gcloud run services update $CLOUD_RUN_SERVICE --project $GCP_PROJECT_ID
--region $REGION --image $AR_IMAGE:$TAG`

## Frontend deploy (`deploy-frontend.yml`)

1. checkout, `npm ci -w frontend --include-workspace-root`
2. `npm run build -w frontend` with `VITE_*` from Environment vars,
   `VITE_VERSION` = short SHA (dev) / tag (prod)
3. decode key → `GOOGLE_APPLICATION_CREDENTIALS`
4. `firebase deploy --only hosting --project $FIREBASE_PROJECT_ID --non-interactive`

## Release (`deploy.yml`, tag only)

`changelog` job (after both deploys): `npm version --no-git-tag-version $TAG`,
`npm run changelog:update`, commit + push to `main`, re-tag (force), upload
`changes.md`. `release` job: `gh release create $TAG --notes-file changes.md`.
Uses the built-in `GITHUB_TOKEN` with `contents: write`.

## Path-skip

Orchestrator `changes` job (`dorny/paths-filter@v3`) emits `frontend` /
`backend` booleans (filters `frontend/**`, `backend/**`, root `package*.json`).
Jobs are `if:`-gated so an unchanged half is skipped. Tag releases and standalone
`workflow_dispatch` runs always execute the requested halves.

## GitHub Environments + secrets/vars

Two Environments — **dev** and **production** — each with:

**Secret:**

- `GOOGLE_APPLICATION_CREDENTIALS_BASE64` — base64-encoded SA key JSON

**Vars:**

- `GCP_PROJECT_ID` — e.g. `pq-reference-app-dev`
- `AR_IMAGE` — e.g. `europe-central2-docker.pkg.dev/pq-reference-app-dev/pq-reference-app-be-dev/backend-dev`
- `CLOUD_RUN_SERVICE` — e.g. `pq-reference-backend-dev`
- `REGION` — `europe-west1`
- `FIREBASE_PROJECT_ID` — e.g. `pq-reference-app-dev`
- `VITE_API_URL`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
  `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
  `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`,
  `VITE_FIREBASE_MEASUREMENT_ID`

**Protection:** `production` Environment requires a reviewer (gates tag deploys).

The SA key needs: `roles/run.admin`, `roles/artifactregistry.writer`,
`roles/firebasehosting.admin` (Cloud Run service-account user as applicable).

## Acceptance criteria coverage

- Frontend standalone → dev + prod ✔ (`deploy-frontend.yml` `workflow_dispatch`)
- Backend standalone → dev + prod ✔ (`deploy-backend.yml` `workflow_dispatch`)
- Both together ✔ (`deploy.yml` orchestrator)
- `main` auto-deploys dev; tags deploy prod; manual dev deploy ✔
- Each skips when its paths unchanged ✔ (paths-filter)
