# ====================================
# 1️⃣ Build & Compile TypeScript
# ====================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
# Install deps but ignore postinstall (which requires schema)
RUN npm ci --ignore-scripts

# Copy schema and generate client
COPY prisma ./prisma/

COPY . .
RUN npx prisma generate

# FIX: Now that tsconfig is fixed, we can run this normally.
# We remove the invalid "false/true" flags you had earlier.
RUN npx tsc

# ====================================
# 2️⃣ Production Runtime
# ====================================
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy compiled output
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma/

ENV NODE_ENV=production
ENV PORT=3001

# Install production deps and generate client
RUN npm ci --only=production --ignore-scripts && \
    npx prisma generate && \
    npm cache clean --force

EXPOSE 3001

CMD ["npm", "run", "start:prod"]