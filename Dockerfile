# Install dependencies only when needed
FROM node:lts-alpine AS deps

ARG REMIX_TOKEN

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY .npmrc package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM node:lts-alpine AS builder

ARG REMIX_TOKEN

WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN npm run build:css && \
  npm run build:remix && \
  npm run build:server

# Production image, copy all the files and run next
FROM node:lts-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/server ./server/
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD [ "node", "server/s-build/server/index.js" ]