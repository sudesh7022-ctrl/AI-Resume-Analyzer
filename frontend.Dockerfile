# 1. Base Image
FROM node:20-alpine AS builder

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY frontend/package.json .
COPY frontend/package-lock.json .
RUN npm install

# 4. Copy the rest of the frontend code
COPY frontend/ .

# 5. Build the Next.js application
# Note: Next.js needs a placeholder Backend URL during build if using Static Export,
# but since we're using "npm run start" on Cloud Run, it will read ENV at runtime.
RUN npm run build

# 6. Production runtime
FROM node:20-alpine

WORKDIR /app

# 7. Copy necessary build artifacts and node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# 8. Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# 9. Expose the port
EXPOSE 3000

# 10. Start the application
CMD ["npm", "run", "start"]
