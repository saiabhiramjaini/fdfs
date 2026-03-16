FROM node:20-bookworm-slim

# Required for playwright install-deps to work
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends \
    ca-certificates wget \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install node dependencies + download Chromium binary (via postinstall)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Install ALL OS libraries Chromium needs (auto-detected by Playwright)
RUN npx playwright install-deps chromium

# Copy source and build
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
