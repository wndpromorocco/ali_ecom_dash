# ===============================
# 1️⃣ Build Stage
# ===============================
FROM node:20-alpine AS builder

WORKDIR /app
COPY . .
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE
ARG VITE_ADMIN_SLUG
ENV VITE_ADMIN_SLUG=$VITE_ADMIN_SLUG
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm ci
RUN npm run build

# ===============================
# 2️⃣ Runtime Stage (Nginx)
# ===============================
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
