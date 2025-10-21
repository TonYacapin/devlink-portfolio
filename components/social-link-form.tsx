// components/social-link-form.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SocialLink {
  id?: string
  platform: string
  url: string
  display_text: string
  display_order: number
  is_active: boolean
}

interface SocialLinkFormProps {
  link?: SocialLink | null
  onSave: (link: Omit<SocialLink, "id">) => void
  onCancel: () => void
  loading: boolean
}

const PLATFORMS = [
  { value: "github", label: "GitHub" },
  { value: "twitter", label: "Twitter" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "twitch", label: "Twitch" },
  { value: "discord", label: "Discord" },
  { value: "website", label: "Website" },
  { value: "portfolio", label: "Portfolio" },
  { value: "blog", label: "Blog" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
]

export function SocialLinkForm({ link, onSave, onCancel, loading }: SocialLinkFormProps) {
  const [formData, setFormData] = useState<Omit<SocialLink, "id">>({
    platform: "",
    url: "",
    display_text: "",
    display_order: 0,
    is_active: true,
  })

  useEffect(() => {
    if (link) {
      setFormData({
        platform: link.platform,
        url: link.url,
        display_text: link.display_text,
        display_order: link.display_order,
        is_active: link.is_active,
      })
    }
  }, [link])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.platform || !formData.url) {
      return
    }
    onSave(formData)
  }

  const handlePlatformChange = (platform: string) => {
    setFormData({
      ...formData,
      platform,
      display_text: formData.display_text || PLATFORMS.find(p => p.value === platform)?.label || platform
    })
  }

  const getPlaceholderUrl = (platform: string) => {
    const placeholders: { [key: string]: string } = {
      github: "https://github.com/username",
      twitter: "https://twitter.com/username",
      linkedin: "https://linkedin.com/in/username",
      youtube: "https://youtube.com/c/channelname",
      instagram: "https://instagram.com/username",
      facebook: "https://facebook.com/username",
      twitch: "https://twitch.tv/username",
      discord: "https://discord.gg/invitecode",
      website: "https://example.com",
      portfolio: "https://portfolio.example.com",
      blog: "https://blog.example.com",
      email: "mailto:your@email.com",
      phone: "tel:+1234567890",
    }
    return placeholders[platform] || "https://example.com"
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{link ? "Edit Social Link" : "Add Social Link"}</DialogTitle>
          <DialogDescription>
            {link ? "Update your social link details" : "Add a new social media profile or website"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Select value={formData.platform} onValueChange={handlePlatformChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder={getPlaceholderUrl(formData.platform)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_text">Display Text</Label>
            <Input
              id="display_text"
              value={formData.display_text}
              onChange={(e) => setFormData({ ...formData, display_text: e.target.value })}
              placeholder="Custom display text (optional)"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use platform name
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Show on profile</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : link ? "Update Link" : "Add Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}