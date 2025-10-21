// app/blog/page.tsx
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Calendar, Clock, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function BlogPage() {
  const supabase = await createClient()

  // Fetch all published blog posts with user profiles
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select(`
      *,
      profiles:user_id (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq("is_published", true)
    .order("published_at", { ascending: false })

  if (error) {
    console.error("Error fetching blog posts:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights, tutorials, and thoughts from our community of developers
          </p>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {!posts || posts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No blog posts yet</h2>
            <p className="text-muted-foreground">
              Check back later for new articles and tutorials.
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {posts.map((post) => (
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
        month: 'short',
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
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <Link href={`/blog/${post.slug}`}>
                <CardTitle className="text-xl mb-2 hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </Link>
              <CardDescription className="line-clamp-2 mb-3">
                {post.excerpt}
              </CardDescription>
            </div>
          </div>

          {/* Meta Information */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.profiles.display_name}</span>
            </div>
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
              {post.tags.slice(0, 3).map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{post.tags.length - 3}
                </Badge>
              )}
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