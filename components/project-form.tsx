// components/project-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface ProjectFormProps {
  project?: {
    id: string
    title: string
    description: string
    long_description: string
    tags: string[]
    github_url: string
    demo_url: string
    image_url: string
    is_featured: boolean
    display_order: number
  }
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [formData, setFormData] = useState({
    title: project?.title || "",
    description: project?.description || "",
    long_description: project?.long_description || "",
    tags: project?.tags || [],
    github_url: project?.github_url || "",
    demo_url: project?.demo_url || "",
    image_url: project?.image_url || "",
    is_featured: project?.is_featured || false,
    display_order: project?.display_order || 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Enhanced validation
    if (!formData.title.trim()) {
      alert('Project title is required')
      return
    }
    
    if (!formData.description.trim()) {
      alert('Project description is required')
      return
    }

    setLoading(true)

    try {
      const url = project ? `/api/projects/${project.id}` : "/api/projects"
      const method = project ? "PUT" : "POST"
      
      console.log("Submitting to:", url)
      console.log("Form data:", formData)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const responseText = await response.text()
      console.log("Response status:", response.status)
      console.log("Response text:", responseText)

      let responseData
      try {
        responseData = responseText ? JSON.parse(responseText) : null
      } catch {
        responseData = null
      }

      if (response.ok) {
        console.log("Project saved successfully!")
        router.push("/dashboard/projects")
        router.refresh()
      } else {
        const errorMessage = responseData?.error || `HTTP Error: ${response.status}`
        console.error("Failed to save project:", errorMessage)
        alert(`Failed to save project: ${errorMessage}`)
      }
    } catch (error) {
      console.error("Network error:", error)
      alert("Network error occurred while saving project")
    } finally {
      setLoading(false)
    }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Project Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="My Awesome Project"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Short Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of your project..."
          rows={2}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="long_description">Detailed Description</Label>
        <Textarea
          id="long_description"
          value={formData.long_description}
          onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
          placeholder="Detailed explanation of your project, technologies used, challenges faced..."
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Technologies & Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a technology (e.g., React, Node.js, MongoDB)"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="github_url">GitHub URL</Label>
          <Input
            id="github_url"
            type="url"
            value={formData.github_url}
            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
            placeholder="https://github.com/username/repo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="demo_url">Live Demo URL</Label>
          <Input
            id="demo_url"
            type="url"
            value={formData.demo_url}
            onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
            placeholder="https://my-project.vercel.app"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          type="url"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          placeholder="https://example.com/project-image.jpg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_featured"
            checked={formData.is_featured}
            onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
          />
          <Label htmlFor="is_featured">Featured Project</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : project ? "Update Project" : "Create Project"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}