# syntax=docker/dockerfile:1.7-labs

# ---------------------------------------------------
# Base image
# ---------------------------------------------------
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /workspace

# ---------------------------------------------------
# Prune Stage (Monorepo Magic)
# ---------------------------------------------------
FROM base AS pruner

# Copy the entire monorepo (filtered by .dockerignore)
COPY . .

# Install all workspace dependencies (caching the store)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# MAGIC HAPPENS HERE: 
# This command isolates the 'api' app AND its internal monorepo dependencies.
# It places the stripped-down, ready-to-run application into the /prod/api directory.
RUN pnpm deploy --filter=api /prod/api

# ---------------------------------------------------
# Development stage
# ---------------------------------------------------
FROM base AS dev
ENV NODE_ENV=development

# Only copy the pruned API code and its specific dependencies!
# The rest of the monorepo is left behind, vastly reducing image size.
COPY --from=pruner /prod/api /workspace/apps/api

# Change to the app directory
WORKDIR /workspace/apps/api

EXPOSE 5000

# Start dev server
CMD ["pnpm", "dev"]