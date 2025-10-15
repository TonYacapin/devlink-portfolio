import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Code2, FileText, Briefcase, Wrench, LinkIcon, BarChart3, LogOut, ExternalLink } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch counts
  const { count: projectsCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { count: skillsCount } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { count: postsCount } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { count: linksCount } = await supabase
    .from("social_links")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DevLink</span>
          </Link>
          <div className="flex items-center gap-4">
            {profile?.username && (
              <Link href={`/${profile.username}`} target="_blank">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </Link>
            )}
            <form action={handleSignOut}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.display_name || "Developer"}!</h1>
          <p className="text-muted-foreground">Manage your portfolio and track your progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Showcase your work</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Skills</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{skillsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Technical expertise</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{postsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Share your knowledge</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Social Links</CardTitle>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{linksCount || 0}</div>
              <p className="text-xs text-muted-foreground">Connect everywhere</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your bio, avatar, and personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/profile">
                <Button className="w-full">Edit Profile</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                <Briefcase className="h-5 w-5 text-accent" />
              </div>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Add and manage your portfolio projects</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/projects">
                <Button className="w-full">Manage Projects</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Showcase your technical skills and expertise</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/skills">
                <Button className="w-full">Manage Skills</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <CardTitle>Blog Posts</CardTitle>
              <CardDescription>Write and publish articles to share your knowledge</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/blog">
                <Button className="w-full">Manage Blog</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <LinkIcon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Connect your social media and professional profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/social">
                <Button className="w-full">Manage Links</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                <BarChart3 className="h-5 w-5 text-accent" />
              </div>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Track views and engagement on your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/analytics">
                <Button className="w-full">View Analytics</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
