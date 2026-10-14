FROM node:22-bookworm-slim AS web
WORKDIR /src
COPY package.json package-lock.json* ./
COPY . .
RUN npm install && npm run build

FROM node:22-bookworm-slim
WORKDIR /app
COPY server/package.json server/package-lock.json ./server/
RUN npm ci --omit=dev --prefix server
COPY server ./server
COPY --from=web /src/dist ./dist
ENV NODE_ENV=production
ENV STATIC_DIR=/app/dist
WORKDIR /app/server
CMD ["node", "src/index.js"]
