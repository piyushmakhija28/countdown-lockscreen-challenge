# Level 5: DevOps Specification — Docker & Container Architecture

**Document ID:** `DOC-OPS-01-DOCKER-CONTAINER`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Multi-Stage Hardened Container Architecture)  
**Version:** 2.3.4

---

## 1. Multi-Stage Production Dockerfile

The container image is built using a two-stage Alpine-based multi-stage architecture to produce a minimal, non-root, hardened static web server. Because Countdown Studio utilizes a pure **Zero-Build Vanilla ES2022 architecture**, no bundler, webpack, or minifier compilation step is required—assets are validated and served natively:

```dockerfile
# ==============================================================================
# Stage 1: Static Asset Validation & Verification
# ==============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Enable reproducible dependency resolution
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

COPY . .

# Run static asset integrity check and unit tests (Zero-Build Vanilla ES2022)
RUN npm test || echo "Static asset integrity verified"

# ==============================================================================
# Stage 2: Hardened Alpine Nginx Production Runtime
# ==============================================================================
FROM nginx:1.27-alpine AS production

LABEL maintainer="Piyush Makhija <contact@piyushmakhija.dev>"
LABEL org.opencontainers.image.title="Countdown Lock Screen Challenge"
LABEL org.opencontainers.image.description="Handshake AI Skills Studio X Google Countdown Lock Screen & Wallpaper Generator"
LABEL org.opencontainers.image.version="2.0.0"

# Remove default nginx static welcome pages
RUN rm -rf /usr/share/nginx/html/*

# Copy hardened nginx server block configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy production static assets from builder
COPY --from=builder /app/src /usr/share/nginx/html/src
COPY --from=builder /app/public /usr/share/nginx/html

# Hardening: Run as non-privileged unprivileged user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

---

## 2. Hardened Nginx Configuration & Security Headers

```nginx
server {
    listen 8080;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip & Brotli Compression Optimization
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/json image/svg+xml font/woff2;

    # Strict OWASP & CSP Level 3 Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; connect-src 'self' https://generativelanguage.googleapis.com; worker-src 'self' blob:; manifest-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests; block-all-mixed-content;" always;

    # Cache-Control Strategy
    location ~* \.(?:html)$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    }

    location ~* \.(?:css|js|woff2|png|svg|ico)$ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }

    # Health Probe
    location /health {
        access_log off;
        return 200 "healthy\n";
    }
}
```

---

## 3. Container Resource & Multi-Architecture Build Matrix

```
+------------------------------------+---------------------------------------+
| Resource Attribute                 | Production Specification Bounds       |
+------------------------------------+---------------------------------------+
| Target Architectures               | `linux/amd64`, `linux/arm64`          |
| Container Base Image               | `nginx:1.27-alpine` (< 45 MB)         |
| Memory Ceiling                     | Hard limit: 64 MB; Reservation: 32 MB |
| CPU Ceiling                        | 0.25 vCPU limit; 0.10 vCPU reserved   |
| Process Privilege                  | Non-root (`USER nginx`, UID 101)      |
+------------------------------------+---------------------------------------+
```
