// components/social-links-manager.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ExternalLink, ArrowUp, ArrowDown } from "lucide-react"
import { SocialLinkForm } from "@/components/social-link-form"
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

interface SocialLink {
  id?: string
  platform: string
  url: string
  display_text: string
  display_order: number
  is_active: boolean
}

interface SocialLinksManagerProps {
  initialLinks: SocialLink[]
}

const PLATFORM_ICONS: { [key: string]: string } = {
  github: "github",
  twitter: "twitter",
  linkedin: "linkedin",
  youtube: "youtube",
  instagram: "instagram",
  facebook: "facebook",
  twitch: "twitch",
  discord: "discord",
  website: "globe",
  portfolio: "briefcase",
  blog: "book-open",
  email: "mail",
  phone: "phone",
}

const PLATFORM_NAMES: { [key: string]: string } = {
  github: "GitHub",
  twitter: "Twitter",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  instagram: "Instagram",
  facebook: "Facebook",
  twitch: "Twitch",
  discord: "Discord",
  website: "Website",
  portfolio: "Portfolio",
  blog: "Blog",
  email: "Email",
  phone: "Phone",
}

export function SocialLinksManager({ initialLinks }: SocialLinksManagerProps) {
  const [links, setLinks] = useState<SocialLink[]>(initialLinks)
  const [showForm, setShowForm] = useState(false)
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null)
  const [linkToDelete, setLinkToDelete] = useState<SocialLink | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSaveLink = async (linkData: Omit<SocialLink, "id">) => {
    setLoading(true)
    try {
      const url = editingLink ? `/api/social-links/${editingLink.id}` : "/api/social-links"
      const method = editingLink ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...linkData,
          display_order: editingLink ? linkData.display_order : links.length,
        }),
      })

      if (response.ok) {
        const savedLink = await response.json()
        
        if (editingLink) {
          setLinks(links.map(link => 
            link.id === editingLink.id ? savedLink : link
          ))
        } else {
          setLinks([...links, savedLink])
        }
        
        setShowForm(false)
        setEditingLink(null)
      } else {
        console.error("Failed to save social link")
        alert("Failed to save social link")
      }
    } catch (error) {
      console.error("Error saving social link:", error)
      alert("Network error occurred while saving social link")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLink = async () => {
    if (!linkToDelete?.id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/social-links/${linkToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setLinks(links.filter(link => link.id !== linkToDelete.id))
        setLinkToDelete(null)
      } else {
        console.error("Failed to delete social link")
        alert("Failed to delete social link")
      }
    } catch (error) {
      console.error("Error deleting social link:", error)
      alert("Network error occurred while deleting social link")
    } finally {
      setLoading(false)
    }
  }

  const handleReorder = async (linkId: string, direction: 'up' | 'down') => {
    const currentIndex = links.findIndex(link => link.id === linkId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= links.length) return

    setLoading(true)
    try {
      // Swap display orders
      const updatedLinks = [...links]
      const tempOrder = updatedLinks[currentIndex].display_order
      updatedLinks[currentIndex].display_order = updatedLinks[newIndex].display_order
      updatedLinks[newIndex].display_order = tempOrder

      // Swap positions in array
      const tempLink = updatedLinks[currentIndex]
      updatedLinks[currentIndex] = updatedLinks[newIndex]
      updatedLinks[newIndex] = tempLink

      // Update both links in database
      await Promise.all([
        fetch(`/api/social-links/${updatedLinks[currentIndex].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_order: updatedLinks[currentIndex].display_order }),
        }),
        fetch(`/api/social-links/${updatedLinks[newIndex].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_order: updatedLinks[newIndex].display_order }),
        }),
      ])

      setLinks(updatedLinks)
    } catch (error) {
      console.error("Error reordering links:", error)
      alert("Failed to reorder links")
    } finally {
      setLoading(false)
    }
  }

  const getPlatformIcon = (platform: string) => {
    const iconName = PLATFORM_ICONS[platform] || "link"
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {getIconPath(iconName)}
      </svg>
    )
  }

  const getIconPath = (iconName: string) => {
    const paths: { [key: string]: string } = {
      github: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
      twitter: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
      linkedin: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M6 4a2 2 0 11-4 0 2 2 0 014 0z",
      youtube: "M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z M9.75 15.02V8.98l5.75 3.02-5.75 3.02z",
      instagram: "M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z",
      facebook: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
      twitch: "M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7",
      discord: "M18.59 5.89c-1.23-.57-2.53-.99-3.88-1.24-.17.3-.36.7-.5 1.02-1.46-.22-2.91-.22-4.35 0-.14-.32-.34-.72-.51-1.02-1.35.25-2.65.67-3.88 1.24C2.5 9.9 1.75 13.8 2.08 17.7c1.5.7 2.96 1.14 4.41 1.42.36-.49.68-1 .96-1.54-.53-.2-1.03-.45-1.5-.75.13-.1.25-.2.37-.3 2.9 1.35 6.04 1.35 8.93 0 .12.1.24.2.37.3-.47.3-.97.55-1.5.75.28.54.6 1.05.96 1.54 1.45-.28 2.91-.72 4.41-1.42.36-4.1-.45-8-2.08-11.81zM9 14.25c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm6 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
      globe: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
      briefcase: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
      "book-open": "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
      mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
      link: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
    }
    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={paths[iconName] || paths.link} />
  }

  return (
    <div className="space-y-6">
      {/* Add Link Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Your Social Links</h2>
          <p className="text-muted-foreground">
            {links.filter(link => link.is_active).length} active •{" "}
            {links.filter(link => !link.is_active).length} hidden
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Link
        </Button>
      </div>

      {/* Social Links Grid */}
      {links.length > 0 ? (
        <div className="grid gap-4">
          {links.map((link, index) => (
            <Card key={link.id} className="overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(link.platform)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {PLATFORM_NAMES[link.platform] || link.platform}
                        </span>
                        {!link.is_active && (
                          <Badge variant="secondary" className="text-xs">
                            Hidden
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {link.display_text || link.url}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1 mr-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorder(link.id!, 'up')}
                      disabled={loading || index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorder(link.id!, 'down')}
                      disabled={loading || index === links.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* View Link */}
                  <Button variant="outline" size="sm" asChild>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit
                    </a>
                  </Button>

                  {/* Edit Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingLink(link)
                      setShowForm(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>

                  {/* Delete Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLinkToDelete(link)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
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
            <h3 className="text-lg font-semibold mb-2">No social links yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Add your social media profiles and websites to share with visitors.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Link
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Social Link Form Dialog */}
      {showForm && (
        <SocialLinkForm
          link={editingLink}
          onSave={handleSaveLink}
          onCancel={() => {
            setShowForm(false)
            setEditingLink(null)
          }}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!linkToDelete} onOpenChange={() => setLinkToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Social Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this social link? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLink}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}