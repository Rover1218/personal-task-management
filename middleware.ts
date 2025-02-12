import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Auth routes should be publicly accessible
    if (request.nextUrl.pathname.startsWith('/api/auth/')) {
        return NextResponse.next()
    }

    const token = request.cookies.get('token')
    const isProtectedApiRoute = request.nextUrl.pathname.startsWith('/api/') &&
        !request.nextUrl.pathname.startsWith('/api/auth/')

    if (!token && isProtectedApiRoute) {
        return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
        )
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/api/:path*',
        '/((?!_next/static|favicon.ico|logo.png|images).*)'
    ]
}
