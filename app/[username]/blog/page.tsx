// app/[username]/blog/page.tsx
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Calendar, Clock, ArrowLeft, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PageProps {
  params: Promise<{
    username: string
  }>
}

export default async function UserBlogPage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Get the profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio")
    .eq("username", username)
    .single()

  if (!profile) {
    notFound()
  }

  // Get all published blog posts for this user
  const { data: blogPosts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_published", true)
    .order("published_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/dev/${username}`}>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <img
                src={profile.avatar_url || "/default-avatar.png"}
                alt={profile.display_name}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-semibold text-sm">{profile.display_name}</p>
                <p className="text-xs text-muted-foreground">@{profile.username}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Blog Posts */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{profile.display_name}'s Blog</h1>
          <p className="text-xl text-muted-foreground">
            {blogPosts?.length || 0} article{blogPosts?.length !== 1 ? 's' : ''} published
          </p>
        </div>

        {!blogPosts || blogPosts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No blog posts yet</h2>
            <p className="text-muted-foreground">
              Check back later for new articles.
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {blogPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BlogPostCard({ post }: { post: any }) {
  const formattedDate = post.published_at 
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : ''

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col md:flex-row">
        {/* Cover Image */}
        {post.cover_image && (
          <div className="md:w-64 md:flex-shrink-0">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-48 md:h-full object-cover"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 p-6">
          <Link href={`/blog/${post.slug}`}>
            <CardTitle className="text-xl mb-2 hover:text-primary transition-colors">
              {post.title}
            </CardTitle>
          </Link>
          <CardDescription className="line-clamp-2 mb-3">
            {post.excerpt}
          </CardDescription>

          {/* Meta Information */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.reading_time} min read</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Read More */}
          <Link 
            href={`/blog/${post.slug}`}
            className="inline-block mt-4 text-primary hover:underline font-medium"
          >
            Read more →
          </Link>
        </div>
      </div>
    </Card>
  )
}