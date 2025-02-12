import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1]

        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, username: true, email: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ user })
    } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
}
