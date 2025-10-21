import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      content,
      excerpt,
      cover_image,
      is_published,
      published_at,
      reading_time,
      tags
    } = body

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required" },
        { status: 400 }
      )
    }

    const { data: post, error } = await supabase
      .from("blog_posts")
      .insert([
        {
          title: title.trim(),
          slug: slug.trim(),
          content: content.trim(),
          excerpt: excerpt?.trim() || "",
          cover_image: cover_image?.trim() || "",
          is_published: is_published || false,
          published_at: published_at || null,
          reading_time: reading_time || 5,
          tags: tags || [],
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating blog post:", error)
      return NextResponse.json(
        { error: "Failed to create blog post" },
        { status: 500 }
      )
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error in blog API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching blog posts:", error)
      return NextResponse.json(
        { error: "Failed to fetch blog posts" },
        { status: 500 }
      )
    }

    return NextResponse.json(posts || [])
  } catch (error) {
    console.error("Error in blog API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}