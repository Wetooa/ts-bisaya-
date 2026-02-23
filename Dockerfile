# ── Stage 1: Build the React frontend ──────────────────────────────────────
FROM oven/bun:1 AS frontend-builder

RUN npm install -g pnpm

WORKDIR /app/web

COPY web/package.json web/pnpm-lock.yaml web/.npmrc ./
RUN pnpm install

COPY web/ ./
RUN pnpm build

# ── Stage 2: Production image ───────────────────────────────────────────────
FROM oven/bun:1

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

COPY src/ ./src/
COPY --from=frontend-builder /app/web/dist ./web/dist

EXPOSE 3000

CMD ["bun", "run", "src/server.ts"]
