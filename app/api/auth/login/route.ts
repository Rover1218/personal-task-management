import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json()

        const user = await prisma.user.findUnique({
            where: { username }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        )

        return NextResponse.json({ token, user: { id: user.id, username: user.username } })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
