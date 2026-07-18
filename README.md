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

GitHub Actions builds `apps/web/Dockerfile` for `linux/amd64` and
`linux/arm64`, then publishes it to:

```text
ghcr.io/rtgtx7/bbmi-chat
```

The NAS never builds source code. Keep only `docker-compose.yml`,
`config.json`, and an optional `.env` file in the Synology project
directory. Create `config.json` from `apps/web/config.sample.json` and edit
the homeserver settings before the first deployment.

```dotenv
BBMI_IMAGE_TAG=latest
BBMI_PORT=8080
BBMI_CONFIG=./config.json
```

### First GHCR login on Synology

Create a GitHub personal access token with `read:packages` permission. If the
container package remains private, the token's account must also have access to
this repository. In an SSH session on the NAS:

```sh
export GHCR_TOKEN="your-token"
echo "$GHCR_TOKEN" | docker login ghcr.io --username RTGTX7 --password-stdin
unset GHCR_TOKEN
```

The credential is stored by Docker for later pulls. Login is unnecessary if the
GHCR package is changed to public.

### Deploy and update

Run these commands from the directory containing `docker-compose.yml`:

```sh
docker compose pull
docker compose up -d
```

The application is exposed on port `8080` by default. The Compose file has no
`build` section, so the NAS cannot build the project accidentally.

### Roll back

Every published build receives an immutable commit tag such as
`sha-34b1f65`. Set `BBMI_IMAGE_TAG` in the NAS Compose project or `.env`
file to the required tag, then run the same two deployment commands:

```sh
docker compose pull
docker compose up -d
```

To return to the current development release, set
`BBMI_IMAGE_TAG=latest` and repeat those commands.

### Version tags

- `latest`: newest successful build from `develop`.
- `sha-<commit>`: immutable tag for every workflow build and rollback.
- `v1.2.3`: exact annotated Git release tag.
- `1.2.3` and `1.2`: generated aliases for semantic version releases.

Publish a production release from a verified commit:

```sh
git tag -a v1.0.0 -m "BBMI Chat v1.0.0"
git push origin v1.0.0
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
