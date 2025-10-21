// app/blog/[slug]/page.tsx
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Calendar, Clock, ArrowLeft, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShareButton } from "@/components/share-button"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  console.log("Looking for blog post with slug:", slug)

  // Fetch the blog post with user profile
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select(`
      *,
      profiles:user_id (
        username,
        display_name,
        avatar_url,
        bio
      )
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  console.log("Blog post query result:", { post, error })

  if (!post || error) {
    console.log("Blog post not found or not published, showing 404")
    notFound()
  }

  // Format date
  const formattedDate = post.published_at 
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : ''

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <article className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Blog Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            {post.excerpt}
          </p>

          {/* Author Info */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <img
                src={post.profiles.avatar_url || "/default-avatar.png"}
                alt={post.profiles.display_name}
                className="w-10 h-10 rounded-full"
              />
              <div className="text-left">
                <p className="font-semibold">{post.profiles.display_name}</p>
                <p className="text-sm text-muted-foreground">@{post.profiles.username}</p>
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-6">
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
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {post.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Share Button */}
          <div className="flex justify-center">
            <ShareButton 
              title={post.title}
              excerpt={post.excerpt}
              url={`/blog/${post.slug}`}
            />
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        )}

        {/* Blog Content */}
        <div className="prose prose-lg max-w-none">
          <div 
            className="whitespace-pre-wrap leading-relaxed text-foreground"
            dangerouslySetInnerHTML={{ __html: formatBlogContent(post.content) }}
          />
        </div>

        {/* Author Bio Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex items-start gap-4">
            <img
              src={post.profiles.avatar_url || "/default-avatar.png"}
              alt={post.profiles.display_name}
              className="w-16 h-16 rounded-full flex-shrink-0"
            />
            <div>
              <h3 className="text-lg font-semibold mb-2">
                About {post.profiles.display_name}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {post.profiles.bio || `@${post.profiles.username} is sharing their knowledge and experiences through blog posts.`}
              </p>
              <Link 
                href={`/dev/${post.profiles.username}`}
                className="inline-block mt-3 text-primary hover:underline"
              >
                View profile →
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex justify-between">
            <Link href="/blog" className="text-primary hover:underline">
              ← Back to all posts
            </Link>
            <ShareButton 
              title={post.title}
              excerpt={post.excerpt}
              url={`/blog/${post.slug}`}
            />
          </div>
        </div>
      </article>
    </div>
  )
}

// Helper function to format blog content
function formatBlogContent(content: string): string {
  // Convert line breaks to <br> tags
  let formatted = content.replace(/\n/g, '<br>')
  
  // Convert URLs to links
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g, 
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>'
  )
  
  return formatted
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from("blog_posts")
    .select(`
      *,
      profiles:user_id (
        username,
        display_name
      )
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!post) {
    return {
      title: 'Blog Post Not Found',
    }
  }

  return {
    title: `${post.title} | ${post.profiles.display_name}`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.profiles.display_name],
      images: post.cover_image ? [post.cover_image] : [],
    },
  }
}