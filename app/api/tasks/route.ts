import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        const tasks = await prisma.task.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(tasks)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const { title, priority, dueDate, userId } = await req.json()

        const task = await prisma.task.create({
            data: {
                title,
                status: 'pending',
                priority,
                dueDate: dueDate ? new Date(dueDate) : null,
                userId
            }
        })

        return NextResponse.json(task)
    } catch (error) {
        console.error('Task creation error:', error)
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const { id, status } = await req.json()

        const task = await prisma.task.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json(task)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
        }

        await prisma.task.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
    }
}
