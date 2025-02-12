import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(req: Request) {
    try {
        const { username, email, password } = await req.json()

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        })

        if (existingUser) {
            if (existingUser.username === username) {
                return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
            }
            if (existingUser.email === email) {
                return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            }
        })

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        )

        return NextResponse.json({
            token,
            user: { id: user.id, username: user.username, email: user.email }
        })
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
