// components/blog-form.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BlogPost {
  id?: string
  title: string
  slug: string
  content: string
  excerpt: string
  cover_image: string
  is_published: boolean
  published_at: string | null
  reading_time: number
  tags: string[]
}

interface BlogFormProps {
  post?: BlogPost | null
  onSave: (post: Omit<BlogPost, "id">) => void
  onCancel: () => void
  loading: boolean
}

export function BlogForm({ post, onSave, onCancel, loading }: BlogFormProps) {
  const [formData, setFormData] = useState<Omit<BlogPost, "id">>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    cover_image: "",
    is_published: false,
    published_at: null,
    reading_time: 5,
    tags: [],
  })
  const [tagInput, setTagInput] = useState("")
  const [slugError, setSlugError] = useState("")
  const [isEditingSlug, setIsEditingSlug] = useState(false)

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        cover_image: post.cover_image,
        is_published: post.is_published,
        published_at: post.published_at,
        reading_time: post.reading_time,
        tags: post.tags,
      })
    }
  }, [post])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.slug.trim() || !formData.content.trim()) {
      return
    }
    
    // Clear any previous slug errors
    setSlugError("")
    onSave(formData)
  }

  const generateSlug = (title: string) => {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    // Add random string to make it unique for new posts
    if (!post && !isEditingSlug) {
      const randomString = Math.random().toString(36).substring(2, 8) // 6 character random string
      return `${baseSlug}-${randomString}`
    }
    
    return baseSlug
  }

  const handleTitleChange = (title: string) => {
    const newSlug = generateSlug(title)
    setFormData({
      ...formData,
      title,
      slug: isEditingSlug ? formData.slug : newSlug
    })
  }

  const handleSlugChange = (slug: string) => {
    setFormData({
      ...formData,
      slug: slug.toLowerCase().trim()
    })
    setIsEditingSlug(true)
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    return Math.ceil(words / wordsPerMinute) || 1
  }

  const handleContentChange = (content: string) => {
    setFormData({
      ...formData,
      content,
      reading_time: calculateReadingTime(content)
    })
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
          <DialogDescription>
            {post ? "Update your blog post" : "Write a new blog post to share with your audience"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Your amazing blog post title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="your-amazing-blog-post"
                required
              />
              <p className="text-xs text-muted-foreground">
                This will be used in the URL. Must be unique for your blog.
                {!post && " A random string is automatically added to ensure uniqueness."}
              </p>
            </div>
          </div>

          {slugError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {slugError}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Brief description of your blog post..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Write your blog post content here..."
              rows={12}
              required
            />
            <p className="text-xs text-muted-foreground">
              Reading time: {formData.reading_time} minute{formData.reading_time !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image">Cover Image URL</Label>
            <Input
              id="cover_image"
              type="url"
              value={formData.cover_image}
              onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
              placeholder="https://example.com/cover-image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag (e.g., JavaScript, React, Web Development)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ 
                ...formData, 
                is_published: checked,
                published_at: checked ? new Date().toISOString() : null
              })}
            />
            <Label htmlFor="is_published">Publish this post</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : post ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}