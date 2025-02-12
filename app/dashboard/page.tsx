"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ModeToggle } from "@/components/theme-toggle"
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type Priority = "low" | "medium" | "high"

type Task = {
  id: string
  title: string
  status: 'pending' | 'completed'
  priority: Priority
  dueDate: Date | null
}

type DayPickerSelectHandler = (day: Date | undefined) => void;

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium")
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | null>(null)
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (user) {
      fetchTasks()
    }
  }, [user, loading, router])

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/tasks?userId=${user.id}`)
      const data = await res.json()
      setTasks(data)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTask.trim()) {
      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newTask.trim(),
            priority: newTaskPriority,
            dueDate: newTaskDueDate,
            userId: user.id
          }),
        })

        if (res.ok) {
          const task = await res.json()
          setTasks([task, ...tasks])
          setNewTask("")
          setNewTaskPriority("medium")
          setNewTaskDueDate(null)
        }
      } catch (error) {
        console.error('Failed to add task:', error)
      }
    }
  }

  const handleToggleTask = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id)
      const newStatus = task?.status === 'completed' ? 'pending' : 'completed'

      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })

      if (res.ok) {
        setTasks(tasks.map((task) =>
          task.id === id ? { ...task, status: newStatus } : task
        ))
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setTasks(tasks.filter((task) => task.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background p-4 md:p-8"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold">Welcome, {user.username}!</h1>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={handleLogout}>Logout</Button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <Label htmlFor="newTask">Task Name</Label>
                  <Input
                    id="newTask"
                    type="text"
                    placeholder="Enter a new task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="taskPriority">Priority</Label>
                  <Select value={newTaskPriority} onValueChange={(value: Priority) => setNewTaskPriority(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taskDueDate">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newTaskDueDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTaskDueDate ? format(newTaskDueDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newTaskDueDate || undefined}
                        onSelect={(day) => setNewTaskDueDate(day || null)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button type="submit" className="w-full">
                  Add Task
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-center text-muted-foreground">No tasks yet. Add some tasks to get started!</p>
              ) : (
                <AnimatePresence>
                  <ul className="space-y-2">
                    {tasks.map((task) => (
                      <motion.li
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between p-2 bg-secondary rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={task.status === 'completed'}
                            onChange={() => handleToggleTask(task.id)}
                            className="rounded text-primary focus:ring-primary"
                          />
                          <span
                            className={cn(
                              task.status === 'completed' ? "line-through text-muted-foreground" : "",
                              task.priority === "high"
                                ? "text-red-500"
                                : task.priority === "medium"
                                  ? "text-yellow-500"
                                  : "text-green-500",
                            )}
                          >
                            {task.title}
                          </span>
                          {task.dueDate && (
                            <span className="text-sm text-muted-foreground">
                              Due: {format(task.dueDate, "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteTask(task.id)}>
                          Delete
                        </Button>
                      </motion.li>
                    ))}
                  </ul>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

