import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { notFound } from "next/navigation"
import { TaskForm } from "./task-form"
import { deleteTaskAction } from "./actions"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AirdropTasksPage({ params }: Props) {
  const { id } = await params

  const airdrop = await prisma.airdrop.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true },
  })

  if (!airdrop) notFound()

  const tasks = await prisma.airdropTask.findMany({
    where: { airdropId: id },
    orderBy: { createdAt: "asc" },
  })

  const taskTypeColors: Record<string, string> = {
    social: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    defi: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    testnet: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    bridge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    swap: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/admin/airdrops" className="hover:underline">Airdrops</Link>
            <span>/</span>
            <Link href={`/admin/airdrops/${airdrop.id}/edit`} className="hover:underline">{airdrop.name}</Link>
            <span>/</span>
            <span>Tasks</span>
          </div>
          <h1 className="text-3xl font-bold mt-1">Tasks — {airdrop.name}</h1>
        </div>
        <Link href={`/airdrop/${airdrop.slug}`} target="_blank">
          <Button variant="outline" size="sm">View Public Page →</Button>
        </Link>
      </div>

      {/* Add task form */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="font-semibold mb-3">Add New Task</h2>
        <TaskForm airdropId={id} />
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          No tasks yet. Add one above to get started.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground font-medium flex gap-4 px-2">
            <span className="w-8">#</span>
            <span className="flex-1">Task</span>
            <span className="w-24">Type</span>
            <span className="w-16 text-center">XP</span>
            <span className="w-16 text-center">Done</span>
            <span className="w-20">Actions</span>
          </div>
          {tasks.map((task, i) => (
            <div key={task.id} className="flex items-center gap-4 rounded-lg border bg-card px-4 py-3">
              <span className="w-8 text-muted-foreground text-sm">{i + 1}</span>
              <div className="flex-1">
                <p className="font-medium">{task.title}</p>
                {task.description && (
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                )}
              </div>
              <Badge className={`w-24 justify-center ${taskTypeColors[task.type] ?? ""}`}>
                {task.type}
              </Badge>
              <span className="w-16 text-center font-mono text-sm">{task.xpReward} XP</span>
              <span className="w-16 text-center text-sm text-muted-foreground">
                {task.isCompleted ? "✅" : "—"}
              </span>
              <form action={deleteTaskAction.bind(null, task.id)} className="w-20">
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  Delete
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* XP Summary */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <h2 className="font-semibold mb-2">XP Summary</h2>
        <p className="text-sm text-muted-foreground">
          Total tasks: <strong>{tasks.length}</strong> •{" "}
          Total XP available: <strong>{tasks.reduce((sum, t) => sum + t.xpReward, 0)} XP</strong>
        </p>
      </div>
    </div>
  )
}