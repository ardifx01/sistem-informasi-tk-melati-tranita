# Tahap 1: Builder - Membangun aplikasi
FROM node:20-alpine AS builder
WORKDIR /app

# Salin file package untuk caching
COPY package*.json ./

# Install semua dependensi, termasuk devDependencies untuk build
RUN npm install

# Salin sisa kode aplikasi
COPY . .

# Jalankan `prisma generate` secara eksplisit di dalam tahap builder
RUN npx prisma generate

# Jalankan proses build Next.js
RUN npm run build

# Tahap 2: Production - Menjalankan aplikasi
FROM node:20-alpine
WORKDIR /app

# Buat user non-root untuk keamanan
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Salin file package.json untuk menjalankan 'npm start'
COPY --from=builder /app/package.json ./package.json

# Salin hasil build Next.js
COPY --from=builder /app/.next ./.next

# Salin folder public
COPY --from=builder /app/public ./public

# Salin folder Prisma Client yang sudah di-generate
COPY --from=builder /app/src/generated/prisma/client ./src/generated/prisma/client

# Salin folder prisma yang berisi schema dan migrations
COPY --from=builder /app/prisma ./prisma

# Salin node_modules yang dibutuhkan untuk produksi
COPY --from=builder /app/node_modules ./node_modules

# Ganti kepemilikan file ke user non-root
USER appuser

EXPOSE 3000

