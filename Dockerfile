FROM node:20.20.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps

# Set the Temp Working Directory inside the container
WORKDIR /temp-deps

RUN npm install -g pnpm@latest-10

# copy package json
COPY ["package.json", "pnpm-lock.yaml", "./"]
RUN pnpm install --frozen-lockfile

FROM base AS builder

# Set the Temp Working Directory inside the container
WORKDIR /temp-build

# copy base code
COPY . .

COPY --from=deps /temp-deps/node_modules ./node_modules

RUN npm install -g pnpm@latest-10

# prune devDependencies
RUN pnpm build && pnpm install --production --ignore-scripts --prefer-offline

# image runner app
FROM base AS runner

# Set the Current Working Directory inside the container
WORKDIR /app

ENV NODE_ENV=production

# runtime tools and Chromium for server-side page export
RUN apk add --no-cache \
  nano \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY --from=builder /temp-build/public ./public
COPY --from=builder /temp-build/node_modules ./node_modules
COPY --from=builder /temp-build/package.json ./package.json
COPY --from=builder /temp-build/.sequelizerc ./.sequelizerc
COPY --from=builder /temp-build/script ./script
COPY --from=builder /temp-build/logs ./logs
COPY --from=builder /temp-build/dist ./dist

# This container exposes port 8000 to the outside world
EXPOSE 8000

# Run for production
CMD ["yarn", "start:production"]
