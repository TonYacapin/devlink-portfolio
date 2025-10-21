// app/api/projects/route.ts
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        user_id: user.id,
        title: body.title,
        description: body.description,
        long_description: body.long_description,
        tags: body.tags,
        github_url: body.github_url,
        demo_url: body.demo_url,
        image_url: body.image_url,
        is_featured: body.is_featured,
        display_order: body.display_order,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}