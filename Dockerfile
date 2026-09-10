# syntax=docker/dockerfile:1

# =================================================================================================
# Build stage
# =================================================================================================
# Node 22 and pnpm 11 are hard requirements, not preferences: this is a pnpm workspace and the
# packages depend on each other through the `workspace:` protocol, which npm and yarn cannot
# resolve at all (see README, "What has to exist outside this repository"). corepack reads
# `packageManager` in package.json, so the version here is the version the repo pins.
FROM node:22-slim AS build
RUN corepack enable
WORKDIR /src

# --- dependency layer ---------------------------------------------------------------------------
# The lockfile and every package manifest first. As long as no dependency moves, editing a source
# file reuses this layer instead of resolving and downloading the whole workspace again.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/vortex-client/package.json packages/vortex-client/
COPY packages/vortex-engine/package.json packages/vortex-engine/
COPY packages/vortex-glaze/package.json packages/vortex-glaze/
COPY packages/vortex-imager/package.json packages/vortex-imager/
COPY packages/vortex-web/package.json packages/vortex-web/
RUN pnpm install --frozen-lockfile

# --- source + build ------------------------------------------------------------------------------
COPY . .

# install.mjs unpacks vortex-client-assets.zip into the tree the build expects and writes the
# deployment configuration (`common_configuration_txt.txt`), which is excluded from the archive on
# purpose so that a clone gets defaults rather than the packer's own hotel.
#
#   --skip-install  pnpm install already ran above, in its own cached layer
#   --skip-checks   the final step probes the asset host and the web API over the network; in a
#                   build container neither exists, and a failed probe sets exit code 1
#
# `sources/` is excluded by .dockerignore, so the zip is what feeds this — deliberately: a dump
# wins over the archive when both are present, and the image should build from the committed,
# reproducible copy rather than from whatever happens to sit in a developer's sources/ directory.
RUN node install.mjs --skip-install --skip-checks

# `prebuild` (tools/bundle-assets.mjs) runs on its own and turns the unpacked tree into the
# .bundle files index.html loads.
RUN pnpm --filter vortex-client build

# =================================================================================================
# Runtime stage
# =================================================================================================
# Caddy rather than nginx for one reason that matters here: `handle_path` strips a prefix in one
# line, and reverse_proxy upgrades WebSockets with no extra configuration. Both are things the dev
# server did for free and that the build throws away.
FROM caddy:2-alpine AS runtime

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /src/packages/vortex-client/dist /srv

# The Nitro asset tree is NOT baked in — it is a hotel's own data, far larger than this image, and
# it changes on its own schedule. Mount it here. Serving an empty directory is a hotel where the
# client reaches its login screen and no room ever draws, so DEPLOYMENT.md makes checking it the
# first step after the first deploy.
VOLUME /assets

EXPOSE 80
