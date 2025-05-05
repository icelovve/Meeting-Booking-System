import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const accessToken = request.cookies.get('access_token')?.value
    console.log('Access Token:', accessToken)

    const isAuth = !!accessToken
    const protectedPaths = ['/admin', '/booking']

    const pathname = request.nextUrl.pathname
    const isProtectedPath = protectedPaths.includes(pathname)

    if (isProtectedPath && !isAuth) {
        const url = new URL('/', request.url)
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}
