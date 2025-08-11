# Tahap 1: Builder - Membangun aplikasi
FROM node:20-alpine AS builder
WORKDIR /app

# Salin file package untuk caching
COPY package*.json ./

# Install dependensi
RUN npm install

# Salin sisa kode aplikasi
COPY . .

# Jalankan proses build Next.js
RUN npm run build

# Tahap 2: Production - Menjalankan aplikasi
FROM node:20-alpine
WORKDIR /app

# Buat user non-root untuk keamanan
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Salin hasil build dari tahap builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Ganti kepemilikan file ke user non-root
USER appuser

EXPOSE 3000

CMD ["npm", "start"]
