import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')
    const isApiRoute = request.nextUrl.pathname.startsWith('/api')
    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')

    if (!token && !isAuthRoute && isApiRoute) {
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
        '/((?!_next/static|favicon.ico|logo.png|images|auth).*)'
    ]
}
