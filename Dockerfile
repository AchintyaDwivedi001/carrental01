# ==========================================
# STAGE 1: The Builder (Heavy Lifting)
# ==========================================
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install ALL dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of your code and build the Next.js app
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: The Runner (Lean & Fast Production)
# ==========================================
FROM node:18-alpine AS runner
WORKDIR /app

# Set the environment to production
ENV NODE_ENV production

# ONLY copy the required, compiled files from Stage 1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose the port Next.js runs on
EXPOSE 3000
ENV PORT=3000

# Start the server
CMD ["node", "server.js"]