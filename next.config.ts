import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sgohuonskztpqnppfjuw.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // 성능 최적화
  poweredByHeader: false,
  compress: true,
  
  // 개발 환경 설정
  ...(process.env.NODE_ENV === 'development' && {
    // 개발 환경에서만 적용되는 설정들
  }),
};

export default nextConfig;
