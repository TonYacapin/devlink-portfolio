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
      name,
      category,
      proficiency_level,
      years_of_experience,
      is_featured,
      description
    } = body

    if (!name || !category || !proficiency_level) {
      return NextResponse.json(
        { error: "Name, category, and proficiency level are required" },
        { status: 400 }
      )
    }

    const { data: skill, error } = await supabase
      .from("skills")
      .insert([
        {
          name: name.trim(),
          category,
          proficiency_level,
          years_of_experience,
          is_featured: is_featured || false,
          description: description?.trim() || "",
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating skill:", error)
      return NextResponse.json(
        { error: "Failed to create skill" },
        { status: 500 }
      )
    }

    return NextResponse.json(skill, { status: 201 })
  } catch (error) {
    console.error("Error in skills API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}