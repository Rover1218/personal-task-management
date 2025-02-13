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
import { CalendarIcon, Loader2, CheckCircle2, Circle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type Priority = "low" | "medium" | "high"

type Task = {
  id: string
  title: string
  status: 'pending' | 'completed'
  priority: Priority
  dueDate: Date | null
  completedAt?: Date // Add this new field
}

type DayPickerSelectHandler = (day: Date | undefined) => void;

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium")
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | null>(null)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
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
      setIsCreatingTask(true)
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
      } finally {
        setIsCreatingTask(false)
      }
    }
  }

  const handleToggleTask = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id)
      const newStatus = task?.status === 'completed' ? 'pending' : 'completed'
      const completedAt = newStatus === 'completed' ? new Date() : undefined

      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, completedAt }),
      })

      if (res.ok) {
        setTasks(tasks.map((task) =>
          task.id === id ? { ...task, status: newStatus, completedAt } : task
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

  // Add this function to disable past dates
  const disablePastDates = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
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
                    disabled={isCreatingTask}
                  />
                </div>
                <div>
                  <Label htmlFor="taskPriority">Priority</Label>
                  <Select
                    value={newTaskPriority}
                    onValueChange={(value: Priority) => setNewTaskPriority(value)}
                    disabled={isCreatingTask}
                  >
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
                          !newTaskDueDate && "text-muted-foreground"
                        )}
                        disabled={isCreatingTask}
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
                        disabled={disablePastDates}
                        initialFocus
                        fromDate={new Date()} // This ensures the calendar starts from today
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <motion.div whileHover={!isCreatingTask ? { scale: 1.01 } : {}} whileTap={!isCreatingTask ? { scale: 0.99 } : {}}>
                  <Button type="submit" className="w-full relative" disabled={isCreatingTask || !newTask.trim()}>
                    {isCreatingTask && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <span className={isCreatingTask ? "opacity-70" : ""}>
                      {isCreatingTask ? "Creating task..." : "Add Task"}
                    </span>
                  </Button>
                </motion.div>
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
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md",
                          task.status === 'completed'
                            ? "bg-secondary/50 border border-primary/20"
                            : "bg-secondary"
                        )}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleToggleTask(task.id)}
                            className="text-primary focus:outline-none"
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </motion.button>
                          <div className="flex flex-col flex-1">
                            <span
                              className={cn(
                                "transition-all duration-200",
                                task.status === 'completed' ? "line-through text-muted-foreground" : "",
                                task.priority === "high"
                                  ? "text-red-500"
                                  : task.priority === "medium"
                                    ? "text-yellow-500"
                                    : "text-green-500"
                              )}
                            >
                              {task.title}
                            </span>
                            <div className="flex space-x-2 text-xs text-muted-foreground">
                              {task.dueDate && (
                                <span>
                                  Due: {format(task.dueDate, "MMM d, yyyy")}
                                </span>
                              )}
                              {task.status === 'completed' && task.completedAt && (
                                <span>
                                  • Completed: {format(new Date(task.completedAt), "MMM d, yyyy")}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            className="ml-2"
                          >
                            Delete
                          </Button>
                        </div>
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

