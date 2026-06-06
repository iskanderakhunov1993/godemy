# Git Workflow

## Branches

- `main` — stable production branch
- `develop` — primary integration branch
- `test` — testing and QA branch
- `release/v1.0.0` — release preparation branch
- `feature/<name>` — feature branches from `develop`

## Commit Format

Use Conventional Commits:

- `feat: add lesson filters`
- `fix: handle empty auth token`
- `docs: update setup guide`
- `refactor: simplify api client`
- `chore: update github workflow`

## Recommended Flow

1. Create a branch from `develop`.
2. Make focused commits with clear messages.
3. Open a pull request into `develop`.
4. Merge tested changes from `develop` into `release/*` or `main` when ready.
