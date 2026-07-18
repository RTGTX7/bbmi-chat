# BBMI Chat

BBMI Chat is an upstream-compatible Element Web fork with a responsive,
mobile-first messenger interface. Matrix networking, encryption,
synchronization, authentication, and storage behavior remain provided by
Element Web and the Matrix SDK.

## Requirements

- Node.js 22.18 or newer (see `.node-version`)
- Corepack with pnpm 11.5.2
- Docker with BuildKit for container deployment

## Development

```sh
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm --filter element-web start
```

The development server is available at `http://localhost:8080` by default.
Local configuration can be created from `apps/web/config.sample.json` as
`apps/web/config.json`; the local file is ignored by Git.

## Production build

```sh
corepack pnpm --dir apps/web exec webpack-cli --mode production
```

The static application is written to `apps/web/webapp`. This direct command
avoids a current upstream Nx parser issue with pnpm's multi-document lockfile;
the Compose build uses the same production compiler.

## Docker deployment

The Compose service uses Element Web's upstream multi-stage Dockerfile and
defaults to `apps/web/config.sample.json`.

```sh
docker compose build
docker compose up -d
```

The application is exposed on port `8080`. Override the port and configuration
file without changing tracked files:

```sh
BBMI_PORT=80 BBMI_CONFIG=/etc/bbmi-chat/config.json docker compose up -d --build
```

For routine server deployments:

```sh
git pull --ff-only
docker compose up -d --build
```

Serve BBMI Chat on a different origin from the Matrix homeserver. Review the
[Element configuration documentation](docs/config.md) before production use.

## Upstream maintenance

Keep the official Element repository as an `upstream` remote and rebase or
merge deliberately:

```sh
git fetch upstream
git merge upstream/develop
```

This project retains Element Web's original licensing. See
`LICENSE-AGPL-3.0`, `LICENSE-GPL-3.0`, and `LICENSE-COMMERCIAL`.
