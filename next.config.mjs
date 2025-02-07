/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
    serverComponentsExternalPackages: ['@prisma/client'],
    typedRoutes: true,
  },
  images: {
    domains: ['localhost'],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // 优化构建配置
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 优化输出
  output: 'standalone',
  // 优化缓存
  generateEtags: true,
  // 压缩配置
  compress: true,
  // 优化字体加载
  optimizeFonts: true,
  // 优化图片
  swcMinify: true,
  // 页面扩展名配置
  pageExtensions: ['ts', 'tsx', 'mdx'],
  // 环境变量前缀
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

export default nextConfig; 