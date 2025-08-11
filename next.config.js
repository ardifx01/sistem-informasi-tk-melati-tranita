/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bagian ini memberitahu Next.js untuk secara eksplisit menyertakan
  // semua file dari folder output Prisma Client ke dalam build akhir.
  experimental: {
    outputFileTracingIncludes: {
      "/*": ["./src/generated/prisma/client/**/*"],
    },
  },
};

module.exports = nextConfig;
