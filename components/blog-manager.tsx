"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Calendar, Clock, ExternalLink } from "lucide-react"
import { BlogForm } from "./blog-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertCircle } from "lucide-react"

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

interface BlogManagerProps {
  initialPosts: BlogPost[]
}

export function BlogManager({ initialPosts }: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSavePost = async (postData: Omit<BlogPost, "id">) => {
    setLoading(true)
    setError(null)
    
    try {
      const url = editingPost ? `/api/blog/${editingPost.id}` : "/api/blog"
      const method = editingPost ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })

      const responseText = await response.text()
      let responseData
      try {
        responseData = responseText ? JSON.parse(responseText) : null
      } catch {
        responseData = null
      }

      if (response.ok) {
        const savedPost = responseData
        
        if (editingPost) {
          setPosts(posts.map(post => 
            post.id === editingPost.id ? savedPost : post
          ))
        } else {
          setPosts([savedPost, ...posts])
        }
        
        setShowForm(false)
        setEditingPost(null)
      } else {
        // Handle different types of errors
        if (response.status === 500) {
          if (responseData?.error?.includes('duplicate key')) {
            setError("A blog post with this slug already exists. Please try again with a different title.")
          } else {
            setError("Server error: " + (responseData?.error || "Unknown error"))
          }
        } else if (response.status === 400) {
          setError("Invalid data: " + (responseData?.error || "Please check your input"))
        } else if (response.status === 401) {
          setError("Please log in to save blog posts")
        } else {
          setError("Failed to save blog post: " + (responseData?.error || `HTTP ${response.status}`))
        }
        
        console.error("Failed to save blog post:", responseData?.error)
      }
    } catch (error) {
      console.error("Error saving blog post:", error)
      setError("Network error occurred while saving blog post")
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async () => {
    if (!postToDelete?.id) return

    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/blog/${postToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postToDelete.id))
        setPostToDelete(null)
      } else {
        const responseText = await response.text()
        let responseData
        try {
          responseData = responseText ? JSON.parse(responseText) : null
        } catch {
          responseData = null
        }
        
        setError("Failed to delete blog post: " + (responseData?.error || `HTTP ${response.status}`))
        console.error("Failed to delete blog post:", responseData?.error)
      }
    } catch (error) {
      console.error("Error deleting blog post:", error)
      setError("Network error occurred while deleting blog post")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Draft"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPublicUrl = (post: BlogPost) => {
    return `/blog/${post.slug}`
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md border border-destructive/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setError(null)}
            className="mt-2 h-6 text-xs"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Add Post Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Your Blog Posts</h2>
          <p className="text-muted-foreground">
            {posts.filter(post => post.is_published).length} published •{" "}
            {posts.filter(post => !post.is_published).length} drafts
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Blog Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Cover Image */}
                {post.cover_image && (
                  <div className="md:w-48 md:flex-shrink-0">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Post Content */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant={post.is_published ? "default" : "secondary"}>
                        {post.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>

                  {/* Meta Information */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(post.published_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.reading_time} min read
                    </div>
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag, index) => (
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

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {post.is_published && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={getPublicUrl(post)} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPost(post)
                        setShowForm(true)
                        setError(null)
                      }}
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPostToDelete(post)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No blog posts yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Start writing your first blog post to share your knowledge and experiences with the community.
            </p>
            <Button onClick={() => setShowForm(true)} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Post
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Blog Form Dialog */}
      {showForm && (
        <BlogForm
          post={editingPost}
          onSave={handleSavePost}
          onCancel={() => {
            setShowForm(false)
            setEditingPost(null)
            setError(null)
          }}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
