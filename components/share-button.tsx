// components/share-button.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Share } from "lucide-react"
import { useState } from "react"

interface ShareButtonProps {
  title: string
  excerpt: string
  url: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

export function ShareButton({ title, excerpt, url, variant = "outline", size = "sm" }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false)

  const sharePost = async () => {
    // Ensure we have the full URL (important for sharing)
    const fullUrl = window.location.origin + url
    
    setIsSharing(true)
    
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: excerpt,
          url: fullUrl,
        })
        // Share was successful
        console.log('Share completed successfully')
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(fullUrl)
        alert('Link copied to clipboard! 📋')
      }
    } catch (error) {
      // Handle share cancellation or errors gracefully
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error)
        // Fallback to clipboard if share fails
        try {
          await navigator.clipboard.writeText(fullUrl)
          alert('Link copied to clipboard! 📋')
        } catch (clipboardError) {
          alert('Could not share or copy link. Please copy the URL manually.')
        }
      }
      // If it's AbortError (user cancelled), do nothing
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={sharePost}
      disabled={isSharing}
      className="flex items-center gap-2"
    >
      <Share className="h-4 w-4" />
      {isSharing ? "Sharing..." : "Share"}
    </Button>
  )
}