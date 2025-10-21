// app/dashboard/projects/[id]/edit/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Code2, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectForm } from "@/components/project-form"

interface EditProjectPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  // Await the params object
  const { id } = await params
  
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch the project - use the awaited id
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id) // Use the awaited id here
    .eq("user_id", user.id)
    .single()

  if (!project) {
    redirect("/dashboard/projects")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DevLink</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Edit Project</CardTitle>
            <CardDescription>Update your project details</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectForm project={project} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}