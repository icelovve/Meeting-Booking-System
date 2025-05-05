import { NextConfig } from 'next'

const config: NextConfig = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/booking/:path*'],
}

export default config
